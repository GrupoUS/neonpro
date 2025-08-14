// 🔍 Search Engine Integration - Smart Search + NLP Integration  
// NeonPro - Integração com Motores de Busca (Supabase/Elasticsearch/Algolia)
// Quality Standard: ≥9.5/10 (BMad Enhanced)

import { createClient } from '@/app/utils/supabase/client';
import { 
  SearchQuery, 
  SearchResponse, 
  SearchResult, 
  SearchProvider, 
  SearchMode,
  SearchContext,
  SearchIntent 
} from '@/lib/types/search-types';
import { searchConfigManager, SearchConfiguration } from '@/lib/ai/search-config';
import { SearchAuditLogger } from '@/lib/ai/audit-logger';
import { SearchErrorHandler } from '@/lib/ai/error-handler';

export interface SearchEngineConfig {
  provider: SearchProvider;
  endpoint?: string;
  apiKey?: string;
  indexName: string;
  timeout: number;
  batchSize: number;
  maxResults: number;
}

export interface DatabaseSearchConfig {
  tables: string[];
  fields: Record<string, string[]>;
  relationships: Record<string, Array<{
    table: string;
    foreignKey: string;
    primaryKey: string;
  }>>;
  weights: Record<string, number>;
}

export interface SearchIndexMetadata {
  entityType: string;
  totalDocuments: number;
  lastUpdated: Date;
  indexSize: number;
  fields: Array<{
    name: string;
    type: string;
    indexed: boolean;
    searchable: boolean;
  }>;
}

/**
 * Main Search Engine Integration Manager
 */
export class SearchEngineManager {
  private supabase = createClient();
  private config: SearchConfiguration;
  private auditLogger: SearchAuditLogger;
  private errorHandler: SearchErrorHandler;
  private activeSearches = new Map<string, AbortController>();

  constructor() {
    this.config = searchConfigManager.getConfig();
    this.auditLogger = new SearchAuditLogger();
    this.errorHandler = new SearchErrorHandler();
  }

  /**
   * Execute unified search across all configured providers
   */
  public async search(query: SearchQuery): Promise<SearchResponse> {
    const searchId = this.generateSearchId();
    const abortController = new AbortController();
    this.activeSearches.set(searchId, abortController);

    try {
      const startTime = Date.now();

      // Log search initiation
      await this.auditLogger.logSearchEvent(query, {
        searchId,
        timestamp: new Date(),
        status: 'initiated'
      } as any, {
        ipAddress: query.metadata?.ipAddress,
        userAgent: query.metadata?.userAgent
      });

      // Determine search strategy based on query and mode
      const searchStrategy = this.determineSearchStrategy(query);
      
      // Execute search based on strategy
      let response: SearchResponse;
      
      switch (searchStrategy.provider) {
        case 'supabase':
          response = await this.executeSupabaseSearch(query, searchStrategy);
          break;
        case 'elasticsearch':
          response = await this.executeElasticsearchSearch(query, searchStrategy);
          break;
        case 'algolia':
          response = await this.executeAlgoliaSearch(query, searchStrategy);
          break;
        case 'hybrid':
          response = await this.executeHybridSearch(query, searchStrategy);
          break;
        default:
          throw new Error(`Unsupported search provider: ${searchStrategy.provider}`);
      }

      // Calculate search time
      response.searchTime = Date.now() - startTime;

      // Log search completion
      await this.auditLogger.logSearchEvent(query, response, {
        ipAddress: query.metadata?.ipAddress,
        userAgent: query.metadata?.userAgent
      });

      // Clean up
      this.activeSearches.delete(searchId);

      return response;

    } catch (error) {
      // Handle search error
      const errorResponse = await this.errorHandler.handleSearchError(error, query);
      
      // Log error
      await this.auditLogger.logSearchEvent(query, errorResponse, {
        ipAddress: query.metadata?.ipAddress,
        userAgent: query.metadata?.userAgent
      });

      // Clean up
      this.activeSearches.delete(searchId);

      return errorResponse;
    }
  }

  /**
   * Execute Supabase-based search
   */
  private async executeSupabaseSearch(
    query: SearchQuery,
    strategy: SearchStrategy
  ): Promise<SearchResponse> {
    const results: SearchResult[] = [];
    
    try {
      // Execute searches based on query intent
      switch (query.intent) {
        case 'patient_lookup':
          const patientResults = await this.searchPatients(query, strategy);
          results.push(...patientResults);
          break;
          
        case 'appointment_search':
          const appointmentResults = await this.searchAppointments(query, strategy);
          results.push(...appointmentResults);
          break;
          
        case 'medical_record_search':
          const recordResults = await this.searchMedicalRecords(query, strategy);
          results.push(...recordResults);
          break;
          
        case 'procedure_search':
          const procedureResults = await this.searchProcedures(query, strategy);
          results.push(...procedureResults);
          break;
          
        case 'financial_search':
          const financialResults = await this.searchFinancialRecords(query, strategy);
          results.push(...financialResults);
          break;
          
        case 'general_search':
        default:
          const generalResults = await this.executeGeneralSearch(query, strategy);
          results.push(...generalResults);
          break;
      }

      // Apply RLS and permissions
      const filteredResults = await this.applyRowLevelSecurity(results, query.userId);
      
      // Sort and limit results
      const sortedResults = this.sortResults(filteredResults, query, strategy);
      const limitedResults = sortedResults.slice(0, query.limit || this.config.behavior.defaultResultsPerPage);

      return {
        results: limitedResults,
        totalCount: sortedResults.length,
        searchTime: 0, // Will be set by caller
        query: query.query,
        intent: query.intent,
        analytics: {
          intent: query.intent,
          context: query.context,
          confidence: 0.9, // High confidence for database searches
          processingTime: 0,
          suggestedFilters: this.generateSuggestedFilters(limitedResults),
          relatedQueries: await this.generateRelatedQueries(query, limitedResults)
        },
        pagination: {
          page: query.page || 1,
          limit: query.limit || this.config.behavior.defaultResultsPerPage,
          total: sortedResults.length,
          hasNext: (query.page || 1) * (query.limit || this.config.behavior.defaultResultsPerPage) < sortedResults.length
        }
      };

    } catch (error) {
      throw new Error(`Supabase search failed: ${error}`);
    }
  }

  /**
   * Search patients in Supabase
   */
  private async searchPatients(
    query: SearchQuery,
    strategy: SearchStrategy
  ): Promise<SearchResult[]> {
    const { data, error } = await this.supabase
      .from('patients')
      .select(`
        id,
        name,
        cpf,
        email,
        phone,
        birth_date,
        gender,
        status,
        created_at,
        updated_at
      `)
      .or(this.buildPatientSearchFilter(query.query))
      .limit(strategy.maxResults || 50);

    if (error) {
      throw new Error(`Patient search error: ${error.message}`);
    }

    return (data || []).map(patient => ({
      id: patient.id,
      entityType: 'patient',
      title: patient.name,
      description: `CPF: ${this.maskCPF(patient.cpf)} | Email: ${patient.email}`,
      content: `${patient.name} ${patient.email} ${patient.phone}`,
      metadata: {
        cpf: patient.cpf,
        email: patient.email,
        phone: patient.phone,
        birthDate: patient.birth_date,
        gender: patient.gender,
        status: patient.status
      },
      score: this.calculateRelevanceScore(query.query, patient.name, 'patient'),
      highlight: this.generateHighlight(query.query, patient.name),
      url: `/dashboard/patients/${patient.id}`,
      actions: [
        { label: 'Ver Perfil', action: 'view', url: `/dashboard/patients/${patient.id}` },
        { label: 'Agendar Consulta', action: 'schedule', url: `/dashboard/appointments/new?patient=${patient.id}` }
      ]
    }));
  }

  /**
   * Search appointments in Supabase
   */
  private async searchAppointments(
    query: SearchQuery,
    strategy: SearchStrategy
  ): Promise<SearchResult[]> {
    const { data, error } = await this.supabase
      .from('appointments')
      .select(`
        id,
        date,
        time,
        status,
        notes,
        patient:patients!appointments_patient_id_fkey(
          id,
          name,
          cpf
        ),
        procedure:procedures!appointments_procedure_id_fkey(
          id,
          name,
          category
        ),
        professional:professionals!appointments_professional_id_fkey(
          id,
          name,
          specialty
        )
      `)
      .or(this.buildAppointmentSearchFilter(query.query))
      .order('date', { ascending: false })
      .limit(strategy.maxResults || 50);

    if (error) {
      throw new Error(`Appointment search error: ${error.message}`);
    }

    return (data || []).map(appointment => ({
      id: appointment.id,
      entityType: 'appointment',
      title: `${(appointment.patient as any)?.name} - ${(appointment.procedure as any)?.name}`,
      description: `${this.formatDate(appointment.date)} às ${appointment.time} | Status: ${appointment.status}`,
      content: `${(appointment.patient as any)?.name} ${(appointment.procedure as any)?.name} ${(appointment.professional as any)?.name} ${appointment.notes || ''}`,
      metadata: {
        date: appointment.date,
        time: appointment.time,
        status: appointment.status,
        patientId: (appointment.patient as any)?.id,
        patientName: (appointment.patient as any)?.name,
        procedureId: (appointment.procedure as any)?.id,
        procedureName: (appointment.procedure as any)?.name,
        professionalId: (appointment.professional as any)?.id,
        professionalName: (appointment.professional as any)?.name
      },
      score: this.calculateRelevanceScore(query.query, `${(appointment.patient as any)?.name} ${(appointment.procedure as any)?.name}`, 'appointment'),
      highlight: this.generateHighlight(query.query, `${(appointment.patient as any)?.name} ${(appointment.procedure as any)?.name}`),
      url: `/dashboard/appointments/${appointment.id}`,
      actions: [
        { label: 'Ver Detalhes', action: 'view', url: `/dashboard/appointments/${appointment.id}` },
        { label: 'Editar', action: 'edit', url: `/dashboard/appointments/${appointment.id}/edit` }
      ]
    }));
  }

  /**
   * Search medical records in Supabase
   */
  private async searchMedicalRecords(
    query: SearchQuery,
    strategy: SearchStrategy
  ): Promise<SearchResult[]> {
    const { data, error } = await this.supabase
      .from('medical_records')
      .select(`
        id,
        date,
        type,
        summary,
        diagnosis,
        treatment,
        notes,
        patient:patients!medical_records_patient_id_fkey(
          id,
          name,
          cpf
        ),
        professional:professionals!medical_records_professional_id_fkey(
          id,
          name,
          specialty
        )
      `)
      .textSearch('summary', query.query, { type: 'websearch' })
      .order('date', { ascending: false })
      .limit(strategy.maxResults || 30);

    if (error) {
      throw new Error(`Medical record search error: ${error.message}`);
    }

    return (data || []).map(record => ({
      id: record.id,
      entityType: 'medical_record',
      title: `${record.type} - ${(record.patient as any)?.name}`,
      description: `${this.formatDate(record.date)} | ${record.summary}`,
      content: `${record.summary} ${record.diagnosis} ${record.treatment} ${record.notes || ''}`,
      metadata: {
        date: record.date,
        type: record.type,
        summary: record.summary,
        diagnosis: record.diagnosis,
        treatment: record.treatment,
        patientId: (record.patient as any)?.id,
        patientName: (record.patient as any)?.name,
        professionalId: (record.professional as any)?.id,
        professionalName: (record.professional as any)?.name
      },
      score: this.calculateRelevanceScore(query.query, `${record.summary} ${record.diagnosis}`, 'medical_record'),
      highlight: this.generateHighlight(query.query, record.summary),
      url: `/dashboard/medical-records/${record.id}`,
      actions: [
        { label: 'Ver Prontuário', action: 'view', url: `/dashboard/medical-records/${record.id}` },
        { label: 'Editar', action: 'edit', url: `/dashboard/medical-records/${record.id}/edit` }
      ]
    }));
  }

  /**
   * Execute hybrid search combining multiple providers
   */
  private async executeHybridSearch(
    query: SearchQuery,
    strategy: SearchStrategy
  ): Promise<SearchResponse> {
    const promises: Promise<SearchResult[]>[] = [];

    // Execute Supabase search
    promises.push(
      this.executeSupabaseSearch(query, { ...strategy, provider: 'supabase' })
        .then(response => response.results)
        .catch(() => [])
    );

    // Execute other provider searches if available
    if (this.config.providers.fallback.includes('elasticsearch')) {
      promises.push(
        this.executeElasticsearchSearch(query, { ...strategy, provider: 'elasticsearch' })
          .then(response => response.results)
          .catch(() => [])
      );
    }

    // Wait for all searches to complete
    const resultsArrays = await Promise.all(promises);
    
    // Merge and deduplicate results
    const mergedResults = this.mergeSearchResults(resultsArrays);
    
    // Sort by relevance
    const sortedResults = this.sortResults(mergedResults, query, strategy);
    
    return {
      results: sortedResults.slice(0, query.limit || this.config.behavior.defaultResultsPerPage),
      totalCount: sortedResults.length,
      searchTime: 0,
      query: query.query,
      intent: query.intent,
      analytics: {
        intent: query.intent,
        context: query.context,
        confidence: 0.85,
        processingTime: 0,
        suggestedFilters: this.generateSuggestedFilters(sortedResults),
        relatedQueries: await this.generateRelatedQueries(query, sortedResults)
      },
      pagination: {
        page: query.page || 1,
        limit: query.limit || this.config.behavior.defaultResultsPerPage,
        total: sortedResults.length,
        hasNext: (query.page || 1) * (query.limit || this.config.behavior.defaultResultsPerPage) < sortedResults.length
      }
    };
  }

  /**
   * Placeholder for Elasticsearch integration
   */
  private async executeElasticsearchSearch(
    query: SearchQuery,
    strategy: SearchStrategy
  ): Promise<SearchResponse> {
    // TODO: Implement Elasticsearch integration
    throw new Error('Elasticsearch integration not yet implemented');
  }

  /**
   * Placeholder for Algolia integration  
   */
  private async executeAlgoliaSearch(
    query: SearchQuery,
    strategy: SearchStrategy
  ): Promise<SearchResponse> {
    // TODO: Implement Algolia integration
    throw new Error('Algolia integration not yet implemented');
  }

  /**
   * Helper methods
   */
  private determineSearchStrategy(query: SearchQuery): SearchStrategy {
    const intentConfig = this.config.intentRecognition.intentMapping[query.intent];
    
    return {
      provider: this.config.providers.primary,
      maxResults: query.limit || this.config.behavior.defaultResultsPerPage,
      timeout: this.config.performance.queryTimeout,
      boost: intentConfig?.boost || 1.0,
      filters: query.filters || [],
      sorts: intentConfig?.sorts || [{ field: 'relevance', order: 'desc' }]
    };
  }

  private buildPatientSearchFilter(queryText: string): string {
    return `name.ilike.%${queryText}%,cpf.ilike.%${queryText}%,email.ilike.%${queryText}%,phone.ilike.%${queryText}%`;
  }

  private buildAppointmentSearchFilter(queryText: string): string {
    return `notes.ilike.%${queryText}%`;
  }

  private calculateRelevanceScore(query: string, content: string, entityType: string): number {
    const queryLower = query.toLowerCase();
    const contentLower = content.toLowerCase();
    
    // Exact match
    if (contentLower.includes(queryLower)) {
      return 1.0;
    }
    
    // Fuzzy match
    const words = queryLower.split(' ');
    const matchedWords = words.filter(word => contentLower.includes(word));
    
    return matchedWords.length / words.length;
  }

  private generateHighlight(query: string, content: string): string {
    const queryLower = query.toLowerCase();
    const contentLower = content.toLowerCase();
    
    const index = contentLower.indexOf(queryLower);
    if (index === -1) return content;
    
    const start = Math.max(0, index - 50);
    const end = Math.min(content.length, index + queryLower.length + 50);
    
    return content.substring(start, end);
  }

  private async applyRowLevelSecurity(
    results: SearchResult[], 
    userId: string
  ): Promise<SearchResult[]> {
    // TODO: Implement RLS filtering based on user permissions
    return results;
  }

  private sortResults(
    results: SearchResult[], 
    query: SearchQuery, 
    strategy: SearchStrategy
  ): SearchResult[] {
    return results.sort((a, b) => b.score - a.score);
  }

  private mergeSearchResults(resultsArrays: SearchResult[][]): SearchResult[] {
    const merged = new Map<string, SearchResult>();
    
    for (const results of resultsArrays) {
      for (const result of results) {
        const key = `${result.entityType}_${result.id}`;
        if (!merged.has(key) || merged.get(key)!.score < result.score) {
          merged.set(key, result);
        }
      }
    }
    
    return Array.from(merged.values());
  }

  private generateSuggestedFilters(results: SearchResult[]): Array<{ label: string; value: string; count: number }> {
    const entityCounts = new Map<string, number>();
    
    for (const result of results) {
      const count = entityCounts.get(result.entityType) || 0;
      entityCounts.set(result.entityType, count + 1);
    }
    
    return Array.from(entityCounts.entries()).map(([entityType, count]) => ({
      label: this.getEntityTypeLabel(entityType),
      value: entityType,
      count
    }));
  }

  private async generateRelatedQueries(
    query: SearchQuery, 
    results: SearchResult[]
  ): Promise<string[]> {
    // TODO: Implement AI-powered related query generation
    return [];
  }

  private formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('pt-BR');
  }

  private maskCPF(cpf: string): string {
    if (!cpf) return '';
    return cpf.replace(/(\d{3})\d{3}(\d{3})/, '$1.***.$2-**');
  }

  private getEntityTypeLabel(entityType: string): string {
    const labels: Record<string, string> = {
      'patient': 'Pacientes',
      'appointment': 'Agendamentos',
      'medical_record': 'Prontuários',
      'procedure': 'Procedimentos',
      'payment': 'Pagamentos'
    };
    
    return labels[entityType] || entityType;
  }

  private generateSearchId(): string {
    return `search_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Cancel active search
   */
  public cancelSearch(searchId: string): void {
    const controller = this.activeSearches.get(searchId);
    if (controller) {
      controller.abort();
      this.activeSearches.delete(searchId);
    }
  }

  /**
   * Get search index metadata
   */
  public async getIndexMetadata(): Promise<SearchIndexMetadata[]> {
    const metadata: SearchIndexMetadata[] = [];
    
    const entities = ['patients', 'appointments', 'medical_records', 'procedures', 'payments'];
    
    for (const entity of entities) {
      try {
        const { count } = await this.supabase
          .from(entity)
          .select('*', { count: 'exact', head: true });
          
        metadata.push({
          entityType: entity,
          totalDocuments: count || 0,
          lastUpdated: new Date(),
          indexSize: (count || 0) * 1024, // Mock size calculation
          fields: this.getEntityFields(entity)
        });
      } catch (error) {
        console.warn(`Failed to get metadata for ${entity}:`, error);
      }
    }
    
    return metadata;
  }

  private getEntityFields(entityType: string): Array<{
    name: string;
    type: string;
    indexed: boolean;
    searchable: boolean;
  }> {
    const entityConfig = this.config.indexing.entities[entityType];
    if (!entityConfig) return [];
    
    return entityConfig.fields.map(field => ({
      name: field.name,
      type: field.type,
      indexed: true,
      searchable: field.searchable
    }));
  }
}

// Types for internal use
interface SearchStrategy {
  provider: SearchProvider;
  maxResults: number;
  timeout: number;
  boost: number;
  filters: any[];
  sorts: Array<{ field: string; order: 'asc' | 'desc' }>;
}

// Export the search engine manager
export const searchEngineManager = new SearchEngineManager();