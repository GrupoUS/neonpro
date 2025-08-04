// lib/search/types.ts - Search type definitions (client-safe)

export interface SearchQuery {
  term: string;
  nlpAnalysis?: NLPSearchQuery;
  context?: SearchContext;
  filters?: {
    types?: SearchType[];
    dateRange?: {
      start: Date;
      end: Date;
    };
    patientId?: string;
    status?: string[];
    priority?: string[];
  };
  options?: {
    limit?: number;
    offset?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    fuzzy?: boolean;
    highlight?: boolean;
    useNLP?: boolean;
  };
}

export type SearchType = 
  | 'patients' 
  | 'appointments' 
  | 'medical_records' 
  | 'lab_results' 
  | 'medications' 
  | 'documents' 
  | 'insights' 
  | 'timeline_events'
  | 'duplicates'
  | 'photos';

export interface SearchResult {
  id: string;
  type: SearchType;
  title: string;
  description: string;
  relevanceScore: number;
  metadata: Record<string, any>;
  highlights?: Record<string, string[]>;
  url?: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface SearchResponse {
  results: SearchResult[];
  totalCount: number;
  query: SearchQuery;
  executionTime: number;
  suggestions?: string[];
  nlpInsights?: NLPInsights;
  facets?: SearchFacets;
  stats?: SearchStats;
}

export interface NLPSearchQuery {
  intent: string;
  entities: {
    type: string;
    value: string;
    confidence: number;
  }[];
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number;
}

export interface SearchContext {
  userId: string;
  clinicId: string;
  userRole: string;
  previousQueries: string[];
  sessionId: string;
}

export interface NLPInsights {
  queryComplexity: 'simple' | 'moderate' | 'complex';
  suggestedFilters: string[];
  relatedQueries: string[];
  confidence: number;
}

export interface SearchFacets {
  types: Array<{ type: SearchType; count: number }>;
  dateRanges: Array<{ range: string; count: number }>;
  statuses: Array<{ status: string; count: number }>;
}

export interface SearchStats {
  totalIndexedItems: number;
  lastIndexUpdate: Date;
  avgResponseTime: number;
  popularQueries: string[];
}

export interface GlobalSearchStats {
  totalSearches: number;
  popularQueries: Array<{ query: string; count: number }>;
  avgResponseTime: number;
  totalIndexedItems: number;
  searchTrends: Array<{
    query: string;
    trend: 'up' | 'down' | 'stable';
    changePercent: number;
  }>;
}

export interface SavedSearch {
  id: string;
  name: string;
  query: SearchQuery;
  userId: string;
  createdAt: Date;
  lastUsed: Date;
  useCount: number;
}

export interface SearchHistory {
  id: string;
  query: string;
  userId: string;
  resultCount: number;
  executionTime: number;
  timestamp: Date;
}