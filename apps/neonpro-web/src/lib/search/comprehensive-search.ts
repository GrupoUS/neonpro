/**
 * Comprehensive Data Search System
 * Story 3.4: Smart Search + NLP Integration - Task 2
 * Unified search across all clinic data types
 */

import type { createClient } from "@supabase/supabase-js";
import type { searchIndexer } from "./search-indexer";
import type { nlpEngine, type SupportedLanguage } from "./nlp-engine";

// Types
export interface SearchableDataType {
  type:
    | "patient"
    | "appointment"
    | "treatment"
    | "note"
    | "file"
    | "provider"
    | "medication"
    | "diagnosis";
  table: string;
  searchFields: string[];
  displayFields: string[];
  joinTables?: Array<{
    table: string;
    on: string;
    fields: string[];
  }>;
  filters?: Record<string, any>;
  weight: number; // Relevance weight for this data type
}

export interface ComprehensiveSearchOptions {
  query: string;
  language?: SupportedLanguage;
  dataTypes?: string[];
  dateRange?: {
    start: string;
    end: string;
    field?: string;
  };
  filters?: Record<string, any>;
  sortBy?: "relevance" | "date" | "alphabetical";
  sortOrder?: "asc" | "desc";
  limit?: number;
  offset?: number;
  includeArchived?: boolean;
  fuzzySearch?: boolean;
  exactMatch?: boolean;
}

export interface SearchResult {
  id: string;
  type: string;
  title: string;
  description: string;
  relevanceScore: number;
  matchedFields: string[];
  highlightedText: string;
  metadata: Record<string, any>;
  relatedData?: SearchResult[];
  lastModified: string;
  url?: string;
}

export interface ComprehensiveSearchResponse {
  results: SearchResult[];
  totalCount: number;
  processingTime: number;
  searchStats: {
    byType: Record<string, number>;
    avgRelevance: number;
    nlpConfidence: number;
  };
  suggestions?: string[];
  relatedSearches?: string[];
}

/**
 * Comprehensive Data Search System
 * Provides unified search across all clinic data
 */
export class ComprehensiveSearch {
  private supabase: any;
  private searchableTypes: Map<string, SearchableDataType> = new Map();

  constructor(supabaseUrl?: string, supabaseKey?: string) {
    if (supabaseUrl && supabaseKey) {
      this.supabase = createClient(supabaseUrl, supabaseKey);
    }

    this.initializeSearchableTypes();
  }

  /**
   * Initialize searchable data types configuration
   */
  private initializeSearchableTypes(): void {
    // Patient data
    this.searchableTypes.set("patient", {
      type: "patient",
      table: "patients",
      searchFields: ["name", "email", "phone", "cpf", "address", "notes"],
      displayFields: ["id", "name", "email", "phone", "birth_date", "created_at"],
      weight: 1.5,
      filters: { active: true },
    });

    // Appointment data
    this.searchableTypes.set("appointment", {
      type: "appointment",
      table: "appointments",
      searchFields: ["notes", "reason", "diagnosis", "treatment_plan"],
      displayFields: ["id", "patient_id", "provider_id", "scheduled_at", "status", "reason"],
      joinTables: [
        {
          table: "patients",
          on: "appointments.patient_id = patients.id",
          fields: ["name as patient_name"],
        },
        {
          table: "providers",
          on: "appointments.provider_id = providers.id",
          fields: ["name as provider_name"],
        },
      ],
      weight: 1.3,
    });

    // Treatment data
    this.searchableTypes.set("treatment", {
      type: "treatment",
      table: "treatments",
      searchFields: ["name", "description", "instructions", "notes"],
      displayFields: ["id", "name", "description", "duration", "cost", "created_at"],
      weight: 1.2,
    });

    // Clinical notes
    this.searchableTypes.set("note", {
      type: "note",
      table: "clinical_notes",
      searchFields: ["content", "title", "tags"],
      displayFields: ["id", "title", "content", "patient_id", "provider_id", "created_at"],
      joinTables: [
        {
          table: "patients",
          on: "clinical_notes.patient_id = patients.id",
          fields: ["name as patient_name"],
        },
      ],
      weight: 1.1,
    });

    // File attachments
    this.searchableTypes.set("file", {
      type: "file",
      table: "file_attachments",
      searchFields: ["filename", "description", "tags", "extracted_text"],
      displayFields: ["id", "filename", "file_type", "file_size", "uploaded_at"],
      weight: 1.0,
    });

    // Healthcare providers
    this.searchableTypes.set("provider", {
      type: "provider",
      table: "providers",
      searchFields: ["name", "specialization", "bio", "qualifications"],
      displayFields: ["id", "name", "specialization", "email", "phone"],
      weight: 1.1,
      filters: { active: true },
    });

    // Medications
    this.searchableTypes.set("medication", {
      type: "medication",
      table: "medications",
      searchFields: ["name", "generic_name", "description", "indications", "contraindications"],
      displayFields: ["id", "name", "generic_name", "dosage", "form", "manufacturer"],
      weight: 1.0,
    });

    // Diagnoses
    this.searchableTypes.set("diagnosis", {
      type: "diagnosis",
      table: "diagnoses",
      searchFields: ["name", "description", "icd_code", "symptoms"],
      displayFields: ["id", "name", "icd_code", "description", "severity"],
      weight: 1.2,
    });
  }

  /**
   * Perform comprehensive search across all data types
   */
  async search(options: ComprehensiveSearchOptions): Promise<ComprehensiveSearchResponse> {
    const startTime = Date.now();

    try {
      const {
        query,
        language = "pt",
        dataTypes,
        dateRange,
        filters = {},
        sortBy = "relevance",
        sortOrder = "desc",
        limit = 50,
        offset = 0,
        includeArchived = false,
        fuzzySearch = true,
        exactMatch = false,
      } = options;

      // Process query with NLP
      const nlpResult = await nlpEngine.processQuery(query, language);

      // Determine which data types to search
      const typesToSearch = dataTypes || Array.from(this.searchableTypes.keys());

      // Perform parallel searches across data types
      const searchPromises = typesToSearch.map((type) =>
        this.searchDataType(type, {
          query,
          nlpResult,
          dateRange,
          filters,
          includeArchived,
          fuzzySearch,
          exactMatch,
          limit: Math.ceil(limit / typesToSearch.length),
        }),
      );

      const searchResults = await Promise.all(searchPromises);

      // Combine and rank results
      const allResults = searchResults.flat();
      const rankedResults = this.rankResults(allResults, nlpResult, sortBy, sortOrder);

      // Apply pagination
      const paginatedResults = rankedResults.slice(offset, offset + limit);

      // Enhance results with related data
      const enhancedResults = await this.enhanceWithRelatedData(paginatedResults);

      // Calculate statistics
      const stats = this.calculateSearchStats(allResults, nlpResult);

      // Get suggestions and related searches
      const suggestions = await this.getSuggestions(query, nlpResult, language);
      const relatedSearches = await this.getRelatedSearches(query, language);

      const processingTime = Date.now() - startTime;

      return {
        results: enhancedResults,
        totalCount: allResults.length,
        processingTime,
        searchStats: stats,
        suggestions,
        relatedSearches,
      };
    } catch (error) {
      console.error("Comprehensive search error:", error);

      return {
        results: [],
        totalCount: 0,
        processingTime: Date.now() - startTime,
        searchStats: {
          byType: {},
          avgRelevance: 0,
          nlpConfidence: 0,
        },
      };
    }
  }

  /**
   * Search specific data type
   */
  private async searchDataType(
    dataType: string,
    options: {
      query: string;
      nlpResult: any;
      dateRange?: any;
      filters: Record<string, any>;
      includeArchived: boolean;
      fuzzySearch: boolean;
      exactMatch: boolean;
      limit: number;
    },
  ): Promise<SearchResult[]> {
    const config = this.searchableTypes.get(dataType);
    if (!config || !this.supabase) {
      return [];
    }

    try {
      // Build base query
      let query = this.supabase.from(config.table).select(this.buildSelectClause(config));

      // Apply search conditions
      const searchConditions = this.buildSearchConditions(
        config,
        options.query,
        options.nlpResult,
        options.fuzzySearch,
        options.exactMatch,
      );

      if (searchConditions) {
        query = query.or(searchConditions);
      }

      // Apply filters
      query = this.applyFilters(query, config, options.filters, options.includeArchived);

      // Apply date range
      if (options.dateRange) {
        query = this.applyDateRange(query, options.dateRange);
      }

      // Execute query
      const { data, error } = await query.limit(options.limit);

      if (error) {
        console.error(`Search error for ${dataType}:`, error);
        return [];
      }

      // Transform results
      return (data || []).map((item) => this.transformResult(item, config, options.nlpResult));
    } catch (error) {
      console.error(`Error searching ${dataType}:`, error);
      return [];
    }
  }

  /**
   * Build SELECT clause with joins
   */
  private buildSelectClause(config: SearchableDataType): string {
    let selectFields = config.displayFields.map((field) =>
      field.includes(" as ") ? field : `${config.table}.${field}`,
    );

    if (config.joinTables) {
      config.joinTables.forEach((join) => {
        selectFields = selectFields.concat(join.fields);
      });
    }

    return selectFields.join(", ");
  }

  /**
   * Build search conditions
   */
  private buildSearchConditions(
    config: SearchableDataType,
    query: string,
    nlpResult: any,
    fuzzySearch: boolean,
    exactMatch: boolean,
  ): string {
    const conditions: string[] = [];
    const searchTerms = exactMatch ? [query] : [query, ...nlpResult.tokens];

    config.searchFields.forEach((field) => {
      searchTerms.forEach((term) => {
        if (exactMatch) {
          conditions.push(`${field}.eq."${term}"`);
        } else if (fuzzySearch) {
          conditions.push(`${field}.ilike."%${term}%"`);
        } else {
          conditions.push(`${field}.like."%${term}%"`);
        }
      });
    });

    // Add entity-based searches
    nlpResult.entities.forEach((entity: any) => {
      config.searchFields.forEach((field) => {
        conditions.push(`${field}.ilike."%${entity.value}%"`);
      });
    });

    return conditions.join(",");
  }

  /**
   * Apply filters to query
   */
  private applyFilters(
    query: any,
    config: SearchableDataType,
    filters: Record<string, any>,
    includeArchived: boolean,
  ): any {
    // Apply default filters
    if (config.filters) {
      Object.entries(config.filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
    }

    // Apply custom filters
    Object.entries(filters).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        query = query.in(key, value);
      } else {
        query = query.eq(key, value);
      }
    });

    // Handle archived records
    if (!includeArchived && config.table !== "file_attachments") {
      query = query.neq("archived", true);
    }

    return query;
  }

  /**
   * Apply date range filter
   */
  private applyDateRange(query: any, dateRange: any): any {
    const dateField = dateRange.field || "created_at";

    if (dateRange.start) {
      query = query.gte(dateField, dateRange.start);
    }

    if (dateRange.end) {
      query = query.lte(dateField, dateRange.end);
    }

    return query;
  }

  /**
   * Transform database result to SearchResult
   */
  private transformResult(item: any, config: SearchableDataType, nlpResult: any): SearchResult {
    // Calculate relevance score
    const relevanceScore = this.calculateRelevanceScore(item, config, nlpResult);

    // Generate title and description
    const { title, description } = this.generateTitleAndDescription(item, config);

    // Find matched fields
    const matchedFields = this.findMatchedFields(item, config, nlpResult);

    // Generate highlighted text
    const highlightedText = this.generateHighlightedText(item, config, nlpResult);

    return {
      id: item.id,
      type: config.type,
      title,
      description,
      relevanceScore,
      matchedFields,
      highlightedText,
      metadata: {
        ...item,
        dataType: config.type,
        table: config.table,
      },
      lastModified: item.updated_at || item.created_at,
      url: this.generateResultUrl(config.type, item.id),
    };
  }

  /**
   * Calculate relevance score for result
   */
  private calculateRelevanceScore(item: any, config: SearchableDataType, nlpResult: any): number {
    let score = config.weight;

    // Boost score based on NLP confidence
    score *= 0.5 + nlpResult.confidence * 0.5;

    // Boost for exact matches
    const searchText = config.searchFields
      .map((field) => item[field] || "")
      .join(" ")
      .toLowerCase();

    if (searchText.includes(nlpResult.normalized.toLowerCase())) {
      score *= 1.5;
    }

    // Boost for entity matches
    nlpResult.entities.forEach((entity: any) => {
      if (searchText.includes(entity.value.toLowerCase())) {
        score *= 1.2;
      }
    });

    // Boost for recent items
    const lastModified = new Date(item.updated_at || item.created_at);
    const daysSinceModified = (Date.now() - lastModified.getTime()) / (1000 * 60 * 60 * 24);

    if (daysSinceModified < 7) {
      score *= 1.3;
    } else if (daysSinceModified < 30) {
      score *= 1.1;
    }

    return Math.round(score * 100) / 100;
  }

  /**
   * Generate title and description for result
   */
  private generateTitleAndDescription(
    item: any,
    config: SearchableDataType,
  ): { title: string; description: string } {
    let title = "";
    let description = "";

    switch (config.type) {
      case "patient":
        title = item.name || "Paciente";
        description = `${item.email || ""} • ${item.phone || ""}`;
        break;

      case "appointment":
        title = `Consulta - ${item.patient_name || "Paciente"}`;
        description = `${item.reason || ""} • ${new Date(item.scheduled_at).toLocaleDateString()}`;
        break;

      case "treatment":
        title = item.name || "Tratamento";
        description = item.description || "";
        break;

      case "note":
        title = item.title || "Anotação Clínica";
        description = (item.content || "").substring(0, 150) + "...";
        break;

      case "file":
        title = item.filename || "Arquivo";
        description = `${item.file_type || ""} • ${this.formatFileSize(item.file_size)}`;
        break;

      case "provider":
        title = item.name || "Profissional";
        description = `${item.specialization || ""} • ${item.email || ""}`;
        break;

      case "medication":
        title = item.name || "Medicamento";
        description = `${item.generic_name || ""} • ${item.dosage || ""}`;
        break;

      case "diagnosis":
        title = item.name || "Diagnóstico";
        description = `${item.icd_code || ""} • ${item.description || ""}`;
        break;

      default:
        title = item.name || item.title || `${config.type} #${item.id}`;
        description = item.description || "";
    }

    return { title, description };
  }

  /**
   * Find matched fields in result
   */
  private findMatchedFields(item: any, config: SearchableDataType, nlpResult: any): string[] {
    const matchedFields: string[] = [];
    const searchTerms = [nlpResult.normalized, ...nlpResult.tokens];

    config.searchFields.forEach((field) => {
      const fieldValue = (item[field] || "").toLowerCase();

      searchTerms.forEach((term) => {
        if (fieldValue.includes(term.toLowerCase())) {
          matchedFields.push(field);
        }
      });
    });

    return [...new Set(matchedFields)];
  }

  /**
   * Generate highlighted text
   */
  private generateHighlightedText(item: any, config: SearchableDataType, nlpResult: any): string {
    const searchTerms = [nlpResult.normalized, ...nlpResult.tokens];
    let text = config.searchFields
      .map((field) => item[field] || "")
      .join(" ")
      .substring(0, 200);

    // Highlight search terms
    searchTerms.forEach((term) => {
      const regex = new RegExp(`(${term})`, "gi");
      text = text.replace(regex, "<mark>$1</mark>");
    });

    return text;
  }

  /**
   * Generate URL for result
   */
  private generateResultUrl(type: string, id: string): string {
    const baseUrls: Record<string, string> = {
      patient: "/patients",
      appointment: "/appointments",
      treatment: "/treatments",
      note: "/notes",
      file: "/files",
      provider: "/providers",
      medication: "/medications",
      diagnosis: "/diagnoses",
    };

    return `${baseUrls[type] || "/"}/${id}`;
  }

  /**
   * Format file size
   */
  private formatFileSize(bytes: number): string {
    if (!bytes) return "0 B";

    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  /**
   * Rank search results
   */
  private rankResults(
    results: SearchResult[],
    nlpResult: any,
    sortBy: string,
    sortOrder: string,
  ): SearchResult[] {
    return results.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case "relevance":
          comparison = b.relevanceScore - a.relevanceScore;
          break;
        case "date":
          comparison = new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime();
          break;
        case "alphabetical":
          comparison = a.title.localeCompare(b.title);
          break;
      }

      return sortOrder === "desc" ? comparison : -comparison;
    });
  }

  /**
   * Enhance results with related data
   */
  private async enhanceWithRelatedData(results: SearchResult[]): Promise<SearchResult[]> {
    // TODO: Implement related data enhancement
    // This could include:
    // - Related patients for appointments
    // - Related appointments for patients
    // - Related files for notes
    // - etc.

    return results;
  }

  /**
   * Calculate search statistics
   */
  private calculateSearchStats(
    results: SearchResult[],
    nlpResult: any,
  ): { byType: Record<string, number>; avgRelevance: number; nlpConfidence: number } {
    const byType: Record<string, number> = {};
    let totalRelevance = 0;

    results.forEach((result) => {
      byType[result.type] = (byType[result.type] || 0) + 1;
      totalRelevance += result.relevanceScore;
    });

    return {
      byType,
      avgRelevance: results.length > 0 ? totalRelevance / results.length : 0,
      nlpConfidence: nlpResult.confidence,
    };
  }

  /**
   * Get search suggestions
   */
  private async getSuggestions(
    query: string,
    nlpResult: any,
    language: SupportedLanguage,
  ): Promise<string[]> {
    // Use the search indexer for suggestions
    return searchIndexer.getSuggestions(query, language, 5);
  }

  /**
   * Get related searches
   */
  private async getRelatedSearches(query: string, language: SupportedLanguage): Promise<string[]> {
    try {
      if (!this.supabase) {
        return [];
      }

      // Get popular searches related to this query
      const { data, error } = await this.supabase
        .from("search_analytics")
        .select("query")
        .ilike("query", `%${query}%`)
        .neq("query", query)
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) {
        console.error("Error getting related searches:", error);
        return [];
      }

      return data?.map((item) => item.query) || [];
    } catch (error) {
      console.error("Error in getRelatedSearches:", error);
      return [];
    }
  }

  /**
   * Index content for comprehensive search
   */
  async indexContent(
    type: string,
    contentId: string,
    searchableText: string,
    metadata?: Record<string, any>,
  ): Promise<void> {
    await searchIndexer.indexContent({
      contentType: type as any,
      contentId,
      searchableText,
      metadata,
      language: "pt",
    });
  }

  /**
   * Remove content from index
   */
  async removeFromIndex(type: string, contentId: string): Promise<void> {
    await searchIndexer.removeFromIndex(type, contentId);
  }

  /**
   * Get search statistics
   */
  getSearchableTypes(): string[] {
    return Array.from(this.searchableTypes.keys());
  }
}

// Export singleton instance
export const comprehensiveSearch = new ComprehensiveSearch(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
);
