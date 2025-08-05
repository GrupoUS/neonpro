// Medical Knowledge Base Integration Types
// Story 9.5: Comprehensive medical knowledge management system

// Base medical knowledge interfaces
export interface KnowledgeSource {
  id: string;
  source_name: string;
  source_type: "database" | "journal" | "guideline" | "drug_db" | "classification" | "research";
  api_endpoint?: string;
  access_credentials?: Record<string, any>;
  last_sync?: string;
  sync_frequency: number; // Hours between syncs
  status: "active" | "inactive" | "error" | "syncing";
  configuration?: Record<string, any>;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface MedicalKnowledge {
  id: string;
  knowledge_type:
    | "guideline"
    | "research"
    | "drug_info"
    | "diagnosis"
    | "treatment"
    | "protocol"
    | "reference";
  title: string;
  content_data: Record<string, any>; // Structured medical content
  source_id?: string;
  external_id?: string;
  validity_date?: string;
  evidence_level?: "A" | "B" | "C" | "D" | "Expert Opinion" | "Not Graded";
  quality_score?: number; // 0.00 to 1.00
  medical_categories?: string[];
  keywords?: string[];
  language: string;
  created_at: string;
  updated_at: string;
}

export interface ResearchCache {
  id: string;
  search_query: string;
  search_parameters?: Record<string, any>;
  search_results: Record<string, any>;
  source_id?: string;
  cache_date: string;
  expiry_date: string;
  relevance_score?: number;
  result_count?: number;
  search_user_id?: string;
}

export interface ValidationResult {
  id: string;
  recommendation_id?: string;
  recommendation_type?: string;
  knowledge_source_id?: string;
  knowledge_reference_id?: string;
  evidence_level?: string;
  validation_status: "validated" | "conflicted" | "unsupported" | "pending" | "requires_review";
  confidence_score?: number;
  validation_notes?: string;
  validation_date: string;
  validator_id?: string;
  automated: boolean;
}

export interface DrugInformation {
  id: string;
  drug_name: string;
  generic_name?: string;
  brand_names?: string[];
  drug_class?: string;
  mechanism_of_action?: string;
  indications?: string[];
  contraindications?: string[];
  side_effects?: Record<string, any>;
  dosage_information?: Record<string, any>;
  interaction_data?: Record<string, any>;
  monitoring_requirements?: string[];
  pregnancy_category?: string;
  controlled_substance_schedule?: string;
  source_id?: string;
  last_updated: string;
}

export interface DrugInteraction {
  id: string;
  drug_1_id: string;
  drug_2_id: string;
  interaction_type: "major" | "moderate" | "minor" | "contraindicated";
  severity_level: number; // 1-10
  mechanism?: string;
  clinical_effects?: string;
  management_strategy?: string;
  evidence_level?: string;
  source_id?: string;
}

export interface MedicalGuideline {
  id: string;
  guideline_title: string;
  organization?: string;
  version?: string;
  publication_date?: string;
  last_review_date?: string;
  next_review_date?: string;
  specialty?: string;
  conditions_covered?: string[];
  guideline_content?: Record<string, any>;
  evidence_grade?: string;
  implementation_notes?: string;
  source_id?: string;
  status: "current" | "superseded" | "withdrawn" | "draft";
}

export interface KnowledgeSearchIndex {
  id: string;
  content_id: string;
  content_type: "knowledge" | "drug" | "guideline";
  search_vector?: string;
  medical_terms?: string[];
  concepts?: string[];
  last_indexed: string;
}

export interface KnowledgeAuditLog {
  id: string;
  table_name: string;
  record_id: string;
  operation: "INSERT" | "UPDATE" | "DELETE";
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  changed_by?: string;
  changed_at: string;
}

// Search and query interfaces
export interface MedicalSearchQuery {
  query: string;
  filters?: {
    knowledge_type?: string[];
    evidence_level?: string[];
    medical_categories?: string[];
    date_range?: {
      start?: string;
      end?: string;
    };
    quality_threshold?: number;
  };
  pagination?: {
    page: number;
    limit: number;
  };
  sort?: {
    field: string;
    direction: "asc" | "desc";
  };
}

export interface MedicalSearchResult {
  results: MedicalKnowledge[];
  total_count: number;
  page: number;
  limit: number;
  search_meta: {
    query: string;
    search_time_ms: number;
    relevance_scores: number[];
    filters_applied: Record<string, any>;
  };
}

export interface DrugSearchQuery {
  drug_name?: string;
  generic_name?: string;
  drug_class?: string;
  indication?: string;
  interaction_check?: string[]; // Drug IDs to check interactions
}

export interface DrugSearchResult {
  drugs: DrugInformation[];
  interactions?: DrugInteraction[];
  total_count: number;
}

// Evidence validation interfaces
export interface EvidenceValidationRequest {
  recommendation_id: string;
  recommendation_type: string;
  recommendation_content: Record<string, any>;
  validation_criteria?: {
    min_evidence_level?: string;
    require_guidelines?: boolean;
    recent_only?: boolean;
    max_age_months?: number;
  };
}

export interface EvidenceValidationResponse {
  validation_id: string;
  overall_status: "validated" | "conflicted" | "unsupported" | "requires_review";
  confidence_score: number;
  evidence_sources: {
    source_id: string;
    source_name: string;
    evidence_level: string;
    relevance_score: number;
    supports_recommendation: boolean;
    conflicting_evidence?: boolean;
  }[];
  recommendations: {
    action: "approve" | "review" | "reject" | "modify";
    reason: string;
    suggested_modifications?: string[];
  };
  human_review_required: boolean;
}

// Knowledge base integration interfaces
export interface KnowledgeIntegrationConfig {
  source_id: string;
  api_settings: {
    base_url: string;
    api_key?: string;
    rate_limit?: {
      requests_per_minute: number;
      burst_limit: number;
    };
    timeout_ms?: number;
  };
  sync_settings: {
    auto_sync: boolean;
    sync_interval_hours: number;
    full_sync_frequency_days: number;
    incremental_sync: boolean;
  };
  data_mapping: {
    title_field: string;
    content_field: string;
    category_field?: string;
    date_field?: string;
    evidence_field?: string;
  };
}

export interface SyncStatus {
  source_id: string;
  status: "idle" | "syncing" | "error" | "completed";
  last_sync: string;
  next_sync: string;
  records_synced: number;
  errors_encountered: number;
  sync_duration_ms: number;
  error_details?: string[];
}

// Dashboard and UI interfaces
export interface KnowledgeBaseDashboard {
  overview: {
    total_sources: number;
    active_sources: number;
    total_knowledge_items: number;
    recent_updates: number;
    validation_pending: number;
  };
  source_status: {
    source_id: string;
    source_name: string;
    status: string;
    last_sync: string;
    item_count: number;
    health_score: number;
  }[];
  recent_searches: {
    query: string;
    timestamp: string;
    result_count: number;
    user_id: string;
  }[];
  validation_queue: {
    recommendation_id: string;
    type: string;
    priority: "high" | "medium" | "low";
    created_at: string;
  }[];
}

export interface KnowledgeBaseSettings {
  search_settings: {
    default_result_limit: number;
    relevance_threshold: number;
    enable_semantic_search: boolean;
    cache_duration_hours: number;
  };
  validation_settings: {
    auto_validate_low_risk: boolean;
    require_human_review_threshold: number;
    evidence_level_weights: Record<string, number>;
    validation_timeout_hours: number;
  };
  sync_settings: {
    default_sync_interval: number;
    max_concurrent_syncs: number;
    retry_failed_syncs: boolean;
    notification_preferences: string[];
  };
}

// API request/response types
export interface CreateKnowledgeSourceRequest {
  source_name: string;
  source_type: KnowledgeSource["source_type"];
  api_endpoint?: string;
  configuration?: Record<string, any>;
}

export interface UpdateKnowledgeSourceRequest {
  source_name?: string;
  api_endpoint?: string;
  sync_frequency?: number;
  status?: KnowledgeSource["status"];
  configuration?: Record<string, any>;
}

export interface CreateMedicalKnowledgeRequest {
  knowledge_type: MedicalKnowledge["knowledge_type"];
  title: string;
  content_data: Record<string, any>;
  source_id?: string;
  external_id?: string;
  validity_date?: string;
  evidence_level?: MedicalKnowledge["evidence_level"];
  quality_score?: number;
  medical_categories?: string[];
  keywords?: string[];
}

export interface ValidateRecommendationRequest {
  recommendation: {
    type: string;
    content: Record<string, any>;
    patient_context?: Record<string, any>;
  };
  validation_options?: {
    min_evidence_level?: string;
    require_guidelines?: boolean;
    max_age_months?: number;
  };
}

// Error types
export interface KnowledgeBaseError {
  code: string;
  message: string;
  details?: Record<string, any>;
  source?: string;
}

// Export types for external use
export type KnowledgeSourceType = KnowledgeSource["source_type"];
export type KnowledgeType = MedicalKnowledge["knowledge_type"];
export type EvidenceLevel = MedicalKnowledge["evidence_level"];
export type ValidationStatus = ValidationResult["validation_status"];
export type InteractionType = DrugInteraction["interaction_type"];
export type GuidelineStatus = MedicalGuideline["status"];

// Utility types
export type CreateKnowledgeSource = Omit<KnowledgeSource, "id" | "created_at" | "updated_at">;
export type UpdateKnowledgeSource = Partial<
  Pick<
    KnowledgeSource,
    "source_name" | "api_endpoint" | "sync_frequency" | "status" | "configuration"
  >
>;
export type CreateMedicalKnowledge = Omit<MedicalKnowledge, "id" | "created_at" | "updated_at">;
export type CreateValidationResult = Omit<ValidationResult, "id" | "validation_date">;
