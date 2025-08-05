// 🔍 Search System Types - Smart Search + NLP Integration
// NeonPro - Sistema de Busca Inteligente com Processamento de Linguagem Natural
// Quality Standard: ≥9.5/10 (BMad Enhanced)

export type SearchIntent =
  | "patient_lookup" // Buscar paciente específico
  | "appointment_search" // Buscar agendamentos
  | "medical_record_search" // Buscar prontuários médicos
  | "procedure_search" // Buscar procedimentos
  | "financial_search" // Buscar informações financeiras
  | "compliance_search" // Buscar dados de compliance
  | "general_search" // Busca geral no sistema
  | "similar_cases" // Buscar casos similares
  | "treatment_history" // Histórico de tratamentos
  | "analytics_search"; // Buscar dados analíticos

export type SearchContext =
  | "clinical" // Contexto clínico/médico
  | "administrative" // Contexto administrativo
  | "financial" // Contexto financeiro
  | "compliance" // Contexto de compliance
  | "analytics" // Contexto analítico
  | "general"; // Contexto geral

export type SearchMode =
  | "natural_language" // Busca em linguagem natural
  | "structured" // Busca estruturada
  | "semantic" // Busca semântica
  | "similarity" // Busca por similaridade
  | "fuzzy" // Busca aproximada
  | "exact"; // Busca exata

export type EntityType =
  | "patient"
  | "appointment"
  | "medical_record"
  | "procedure"
  | "prescription"
  | "payment"
  | "user"
  | "document"
  | "compliance_record"
  | "analytics_data";

export type SearchDataCategory =
  | "personal" // Dados pessoais
  | "medical" // Dados médicos
  | "financial" // Dados financeiros
  | "sensitive" // Dados sensíveis
  | "public" // Dados públicos
  | "internal"; // Dados internos

export interface NaturalLanguageQuery {
  originalQuery: string;
  processedQuery: string;
  detectedIntent: SearchIntent;
  extractedEntities: Array<{
    type: EntityType;
    value: string;
    confidence: number;
    startPos: number;
    endPos: number;
  }>;
  suggestedFilters: SearchFilter[];
  confidence: number;
  language: "pt" | "en";
  medicalTerms: string[];
  temporalFilters?: {
    startDate?: Date;
    endDate?: Date;
    period?: string;
  };
}

export interface SearchFilter {
  field: string;
  operator:
    | "equals"
    | "contains"
    | "starts_with"
    | "ends_with"
    | "between"
    | "in"
    | "not_in"
    | "exists"
    | "similarity";
  value: any;
  label: string;
  category: SearchDataCategory;
  required: boolean;
  suggested: boolean;
  confidence?: number;
}

export interface SearchQuery {
  query: string;
  mode: SearchMode;
  context: SearchContext;
  intent?: SearchIntent;
  filters: SearchFilter[];
  sortBy?: string;
  sortOrder: "asc" | "desc";
  limit: number;
  offset: number;
  includeHighlights: boolean;
  includeSuggestions: boolean;
  includeAnalytics: boolean;
  vectorSearchEnabled: boolean;
  semanticBoost?: number;
  userId: string;
  sessionId: string;
}

export interface SearchResult {
  id: string;
  entityType: EntityType;
  title: string;
  description: string;
  content: string;
  highlights: Array<{
    field: string;
    snippet: string;
    startPos: number;
    endPos: number;
  }>;
  score: number;
  relevanceScore: number;
  semanticScore?: number;
  similarityScore?: number;
  metadata: Record<string, any>;
  dataCategory: SearchDataCategory;
  lastModified: Date;
  accessLevel: "public" | "restricted" | "confidential";
  complianceFlags: string[];
}

export interface SearchResponse {
  query: SearchQuery;
  results: SearchResult[];
  totalResults: number;
  searchTime: number;
  suggestions: SearchSuggestion[];
  analytics: SearchAnalytics;
  filters: {
    applied: SearchFilter[];
    available: SearchFilter[];
    suggested: SearchFilter[];
  };
  pagination: {
    currentPage: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
  debugging?: {
    parsedQuery: NaturalLanguageQuery;
    searchStrategy: string;
    indexesUsed: string[];
    queryExecutionTime: number;
  };
}

export interface SearchSuggestion {
  query: string;
  type: "autocomplete" | "spelling_correction" | "query_expansion" | "related_search";
  score: number;
  reason: string;
  previewResults?: number;
}

export interface SearchAnalytics {
  queryId: string;
  userId: string;
  sessionId: string;
  timestamp: Date;
  query: string;
  intent: SearchIntent;
  context: SearchContext;
  totalResults: number;
  clickedResults: string[];
  searchTime: number;
  userSatisfaction?: number;
  resultQuality?: number;
  abandoned: boolean;
  refinements: Array<{
    type: "filter_added" | "filter_removed" | "query_modified" | "sort_changed";
    timestamp: Date;
    details: any;
  }>;
}

export interface VectorSearchQuery {
  text: string;
  embedding?: number[];
  similarityThreshold: number;
  maxResults: number;
  entityTypes: EntityType[];
  filters: SearchFilter[];
  includeMetadata: boolean;
  boostFactors?: Record<string, number>;
}

export interface VectorSearchResult {
  id: string;
  entityType: EntityType;
  content: string;
  similarity: number;
  metadata: Record<string, any>;
  embedding?: number[];
}

export interface SemanticIndex {
  id: string;
  entityType: EntityType;
  entityId: string;
  content: string;
  embedding: number[];
  metadata: Record<string, any>;
  dataCategory: SearchDataCategory;
  accessLevel: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface SearchConfiguration {
  nlpProvider: "openai" | "claude" | "local";
  searchEngine: "elasticsearch" | "algolia" | "supabase";
  vectorDatabase: "pinecone" | "supabase" | "local";
  embeddingModel: "text-embedding-ada-002" | "text-embedding-3-small" | "text-embedding-3-large";
  maxQueryLength: number;
  maxResults: number;
  cacheEnabled: boolean;
  cacheTTL: number;
  auditEnabled: boolean;
  debugMode: boolean;
  fallbackToTraditionalSearch: boolean;
  similarityThreshold: number;
  relevanceThreshold: number;
  supportedLanguages: string[];
}

export interface SearchPermissions {
  userId: string;
  allowedEntityTypes: EntityType[];
  allowedDataCategories: SearchDataCategory[];
  maxResults: number;
  canAccessSensitiveData: boolean;
  canPerformSemanticSearch: boolean;
  canAccessAnalytics: boolean;
  restrictionFilters: SearchFilter[];
}

export interface SearchIndex {
  name: string;
  entityType: EntityType;
  fields: Array<{
    name: string;
    type: "text" | "keyword" | "number" | "date" | "boolean" | "object";
    searchable: boolean;
    filterable: boolean;
    sortable: boolean;
    highlightable: boolean;
    weight: number;
  }>;
  settings: {
    shards: number;
    replicas: number;
    refreshInterval: string;
    maxResultWindow: number;
  };
  mappings: Record<string, any>;
  isActive: boolean;
  lastIndexed: Date;
  documentCount: number;
  sizeInBytes: number;
}

export interface SearchCache {
  key: string;
  query: SearchQuery;
  response: SearchResponse;
  createdAt: Date;
  expiresAt: Date;
  hitCount: number;
  lastAccessed: Date;
}

export interface SearchAuditLog {
  id: string;
  userId: string;
  sessionId: string;
  query: string;
  intent: SearchIntent;
  context: SearchContext;
  results: Array<{
    entityId: string;
    entityType: EntityType;
    score: number;
    clicked: boolean;
  }>;
  performance: {
    searchTime: number;
    indexTime: number;
    totalTime: number;
  };
  compliance: {
    dataAccessLogged: boolean;
    sensitiveDataAccessed: string[];
    lgpdCompliant: boolean;
  };
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  errorDetails?: {
    code: string;
    message: string;
    stack?: string;
  };
}

export interface SearchOptimizationMetrics {
  averageSearchTime: number;
  cacheHitRate: number;
  indexEfficiency: number;
  userSatisfactionScore: number;
  querySuccessRate: number;
  mostFrequentQueries: Array<{
    query: string;
    count: number;
    averageResults: number;
    successRate: number;
  }>;
  performanceByIntent: Record<
    SearchIntent,
    {
      averageTime: number;
      successRate: number;
      userSatisfaction: number;
    }
  >;
  indexStatistics: Record<
    string,
    {
      documentsCount: number;
      sizeInMB: number;
      lastOptimized: Date;
      queryPerformance: number;
    }
  >;
}

// Error Types
export class SearchError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any,
  ) {
    super(message);
    this.name = "SearchError";
  }
}

export class NLPProcessingError extends SearchError {
  constructor(message: string, details?: any) {
    super(message, "NLP_PROCESSING_ERROR", details);
    this.name = "NLPProcessingError";
  }
}

export class SearchIndexError extends SearchError {
  constructor(message: string, details?: any) {
    super(message, "SEARCH_INDEX_ERROR", details);
    this.name = "SearchIndexError";
  }
}

export class VectorSearchError extends SearchError {
  constructor(message: string, details?: any) {
    super(message, "VECTOR_SEARCH_ERROR", details);
    this.name = "VectorSearchError";
  }
}

export class SearchPermissionError extends SearchError {
  constructor(message: string, details?: any) {
    super(message, "SEARCH_PERMISSION_ERROR", details);
    this.name = "SearchPermissionError";
  }
}

// Utility Types
export type SearchValidationResult = {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
};

export type SearchPerformanceProfile = {
  queryComplexity: "low" | "medium" | "high";
  expectedResults: number;
  estimatedTime: number;
  recommendedIndexes: string[];
  optimizationSuggestions: string[];
};

// Medical-specific Types
export interface MedicalSearchContext {
  patientId?: string;
  procedureType?: string;
  diagnosisCode?: string;
  treatmentPhase?: "consultation" | "treatment" | "follow_up" | "completed";
  urgencyLevel?: "low" | "medium" | "high" | "critical";
  specialization?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface ClinicalSearchResult extends SearchResult {
  patientInfo?: {
    id: string;
    name: string;
    age: number;
    gender: string;
  };
  medicalContext?: {
    diagnosis: string[];
    procedures: string[];
    medications: string[];
    allergies: string[];
  };
  confidentialityLevel: "public" | "restricted" | "confidential" | "highly_confidential";
  accessRestrictions: string[];
}

// Export default configuration
export const DEFAULT_SEARCH_CONFIG: SearchConfiguration = {
  nlpProvider: "openai",
  searchEngine: "elasticsearch",
  vectorDatabase: "supabase",
  embeddingModel: "text-embedding-3-small",
  maxQueryLength: 500,
  maxResults: 50,
  cacheEnabled: true,
  cacheTTL: 300, // 5 minutes
  auditEnabled: true,
  debugMode: false,
  fallbackToTraditionalSearch: true,
  similarityThreshold: 0.7,
  relevanceThreshold: 0.5,
  supportedLanguages: ["pt", "en"],
};
