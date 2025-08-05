// Medical Knowledge Base Validation Schemas
// Story 9.5: Zod validation for medical knowledge management

import type { z } from "zod";

// Base validation schemas
export const knowledgeSourceSchema = z.object({
  id: z.string().uuid().optional(),
  source_name: z.string().min(1).max(255),
  source_type: z.enum([
    "database",
    "journal",
    "guideline",
    "drug_db",
    "classification",
    "research",
  ]),
  api_endpoint: z.string().url().optional(),
  access_credentials: z.record(z.any()).optional(),
  last_sync: z.string().datetime().optional(),
  sync_frequency: z.number().int().min(1).max(8760).default(24), // 1 hour to 1 year
  status: z.enum(["active", "inactive", "error", "syncing"]).default("active"),
  configuration: z.record(z.any()).optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
  created_by: z.string().uuid().optional(),
});

export const medicalKnowledgeSchema = z.object({
  id: z.string().uuid().optional(),
  knowledge_type: z.enum([
    "guideline",
    "research",
    "drug_info",
    "diagnosis",
    "treatment",
    "protocol",
    "reference",
  ]),
  title: z.string().min(1).max(500),
  content_data: z.record(z.any()),
  source_id: z.string().uuid().optional(),
  external_id: z.string().max(255).optional(),
  validity_date: z.string().date().optional(),
  evidence_level: z.enum(["A", "B", "C", "D", "Expert Opinion", "Not Graded"]).optional(),
  quality_score: z.number().min(0).max(1).optional(),
  medical_categories: z.array(z.string()).optional(),
  keywords: z.array(z.string()).optional(),
  language: z.string().length(2).default("en"),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

export const researchCacheSchema = z.object({
  id: z.string().uuid().optional(),
  search_query: z.string().min(1),
  search_parameters: z.record(z.any()).optional(),
  search_results: z.record(z.any()),
  source_id: z.string().uuid().optional(),
  cache_date: z.string().datetime().optional(),
  expiry_date: z.string().datetime(),
  relevance_score: z.number().min(0).max(1).optional(),
  result_count: z.number().int().min(0).optional(),
  search_user_id: z.string().uuid().optional(),
});

export const validationResultSchema = z.object({
  id: z.string().uuid().optional(),
  recommendation_id: z.string().uuid().optional(),
  recommendation_type: z.string().max(100).optional(),
  knowledge_source_id: z.string().uuid().optional(),
  knowledge_reference_id: z.string().uuid().optional(),
  evidence_level: z.string().max(50).optional(),
  validation_status: z.enum([
    "validated",
    "conflicted",
    "unsupported",
    "pending",
    "requires_review",
  ]),
  confidence_score: z.number().min(0).max(1).optional(),
  validation_notes: z.string().optional(),
  validation_date: z.string().datetime().optional(),
  validator_id: z.string().uuid().optional(),
  automated: z.boolean().default(true),
});

export const drugInformationSchema = z.object({
  id: z.string().uuid().optional(),
  drug_name: z.string().min(1).max(255),
  generic_name: z.string().max(255).optional(),
  brand_names: z.array(z.string()).optional(),
  drug_class: z.string().max(255).optional(),
  mechanism_of_action: z.string().optional(),
  indications: z.array(z.string()).optional(),
  contraindications: z.array(z.string()).optional(),
  side_effects: z.record(z.any()).optional(),
  dosage_information: z.record(z.any()).optional(),
  interaction_data: z.record(z.any()).optional(),
  monitoring_requirements: z.array(z.string()).optional(),
  pregnancy_category: z.string().max(10).optional(),
  controlled_substance_schedule: z.string().max(10).optional(),
  source_id: z.string().uuid().optional(),
  last_updated: z.string().datetime().optional(),
});

export const drugInteractionSchema = z
  .object({
    id: z.string().uuid().optional(),
    drug_1_id: z.string().uuid(),
    drug_2_id: z.string().uuid(),
    interaction_type: z.enum(["major", "moderate", "minor", "contraindicated"]),
    severity_level: z.number().int().min(1).max(10),
    mechanism: z.string().optional(),
    clinical_effects: z.string().optional(),
    management_strategy: z.string().optional(),
    evidence_level: z.string().max(50).optional(),
    source_id: z.string().uuid().optional(),
  })
  .refine((data) => data.drug_1_id !== data.drug_2_id, {
    message: "Drug IDs must be different",
    path: ["drug_2_id"],
  });

export const medicalGuidelineSchema = z.object({
  id: z.string().uuid().optional(),
  guideline_title: z.string().min(1).max(500),
  organization: z.string().max(255).optional(),
  version: z.string().max(50).optional(),
  publication_date: z.string().date().optional(),
  last_review_date: z.string().date().optional(),
  next_review_date: z.string().date().optional(),
  specialty: z.string().max(255).optional(),
  conditions_covered: z.array(z.string()).optional(),
  guideline_content: z.record(z.any()).optional(),
  evidence_grade: z.string().max(50).optional(),
  implementation_notes: z.string().optional(),
  source_id: z.string().uuid().optional(),
  status: z.enum(["current", "superseded", "withdrawn", "draft"]).default("current"),
});

// Search and query validation schemas
export const medicalSearchQuerySchema = z.object({
  query: z.string().min(1).max(1000),
  filters: z
    .object({
      knowledge_type: z.array(z.string()).optional(),
      evidence_level: z.array(z.string()).optional(),
      medical_categories: z.array(z.string()).optional(),
      date_range: z
        .object({
          start: z.string().date().optional(),
          end: z.string().date().optional(),
        })
        .optional(),
      quality_threshold: z.number().min(0).max(1).optional(),
    })
    .optional(),
  pagination: z
    .object({
      page: z.number().int().min(1).default(1),
      limit: z.number().int().min(1).max(100).default(20),
    })
    .optional(),
  sort: z
    .object({
      field: z.string(),
      direction: z.enum(["asc", "desc"]).default("desc"),
    })
    .optional(),
});

export const drugSearchQuerySchema = z.object({
  drug_name: z.string().max(255).optional(),
  generic_name: z.string().max(255).optional(),
  drug_class: z.string().max(255).optional(),
  indication: z.string().max(500).optional(),
  interaction_check: z.array(z.string().uuid()).optional(),
});

export const evidenceValidationRequestSchema = z.object({
  recommendation_id: z.string().uuid(),
  recommendation_type: z.string().min(1).max(100),
  recommendation_content: z.record(z.any()),
  validation_criteria: z
    .object({
      min_evidence_level: z.enum(["A", "B", "C", "D", "Expert Opinion"]).optional(),
      require_guidelines: z.boolean().default(false),
      recent_only: z.boolean().default(false),
      max_age_months: z.number().int().min(1).max(120).optional(),
    })
    .optional(),
});

// Knowledge base integration schemas
export const knowledgeIntegrationConfigSchema = z.object({
  source_id: z.string().uuid(),
  api_settings: z.object({
    base_url: z.string().url(),
    api_key: z.string().optional(),
    rate_limit: z
      .object({
        requests_per_minute: z.number().int().min(1).max(1000).default(60),
        burst_limit: z.number().int().min(1).max(100).default(10),
      })
      .optional(),
    timeout_ms: z.number().int().min(1000).max(300000).default(30000),
  }),
  sync_settings: z.object({
    auto_sync: z.boolean().default(true),
    sync_interval_hours: z.number().int().min(1).max(168).default(24),
    full_sync_frequency_days: z.number().int().min(1).max(365).default(7),
    incremental_sync: z.boolean().default(true),
  }),
  data_mapping: z.object({
    title_field: z.string().min(1),
    content_field: z.string().min(1),
    category_field: z.string().optional(),
    date_field: z.string().optional(),
    evidence_field: z.string().optional(),
  }),
});

export const knowledgeBaseSettingsSchema = z.object({
  search_settings: z.object({
    default_result_limit: z.number().int().min(1).max(100).default(20),
    relevance_threshold: z.number().min(0).max(1).default(0.3),
    enable_semantic_search: z.boolean().default(true),
    cache_duration_hours: z.number().int().min(1).max(168).default(24),
  }),
  validation_settings: z.object({
    auto_validate_low_risk: z.boolean().default(true),
    require_human_review_threshold: z.number().min(0).max(1).default(0.7),
    evidence_level_weights: z.record(z.number().min(0).max(1)).default({
      A: 1.0,
      B: 0.8,
      C: 0.6,
      D: 0.4,
      "Expert Opinion": 0.3,
      "Not Graded": 0.2,
    }),
    validation_timeout_hours: z.number().int().min(1).max(72).default(24),
  }),
  sync_settings: z.object({
    default_sync_interval: z.number().int().min(1).max(168).default(24),
    max_concurrent_syncs: z.number().int().min(1).max(10).default(3),
    retry_failed_syncs: z.boolean().default(true),
    notification_preferences: z.array(z.string()).default(["email", "dashboard"]),
  }),
});

// API request schemas
export const createKnowledgeSourceRequestSchema = knowledgeSourceSchema.pick({
  source_name: true,
  source_type: true,
  api_endpoint: true,
  sync_frequency: true,
  configuration: true,
});

export const updateKnowledgeSourceRequestSchema = knowledgeSourceSchema
  .pick({
    source_name: true,
    api_endpoint: true,
    sync_frequency: true,
    status: true,
    configuration: true,
  })
  .partial();

export const createMedicalKnowledgeRequestSchema = medicalKnowledgeSchema.pick({
  knowledge_type: true,
  title: true,
  content_data: true,
  source_id: true,
  external_id: true,
  validity_date: true,
  evidence_level: true,
  quality_score: true,
  medical_categories: true,
  keywords: true,
  language: true,
});

export const validateRecommendationRequestSchema = z.object({
  recommendation: z.object({
    type: z.string().min(1),
    content: z.record(z.any()),
    patient_context: z.record(z.any()).optional(),
  }),
  validation_options: z
    .object({
      min_evidence_level: z.enum(["A", "B", "C", "D", "Expert Opinion"]).optional(),
      require_guidelines: z.boolean().default(false),
      max_age_months: z.number().int().min(1).max(120).optional(),
    })
    .optional(),
});

// Sync and status schemas
export const syncTriggerRequestSchema = z.object({
  source_ids: z.array(z.string().uuid()).optional(),
  force_full_sync: z.boolean().default(false),
  priority: z.enum(["high", "normal", "low"]).default("normal"),
});

export const bulkKnowledgeImportSchema = z.object({
  source_id: z.string().uuid(),
  knowledge_items: z.array(createMedicalKnowledgeRequestSchema),
  import_options: z
    .object({
      skip_duplicates: z.boolean().default(true),
      validate_before_import: z.boolean().default(true),
      update_existing: z.boolean().default(false),
    })
    .optional(),
});

// Response validation schemas
export const knowledgeSearchResultSchema = z.object({
  results: z.array(medicalKnowledgeSchema),
  total_count: z.number().int().min(0),
  page: z.number().int().min(1),
  limit: z.number().int().min(1),
  search_meta: z.object({
    query: z.string(),
    search_time_ms: z.number().min(0),
    relevance_scores: z.array(z.number()),
    filters_applied: z.record(z.any()),
  }),
});

export const drugSearchResultSchema = z.object({
  drugs: z.array(drugInformationSchema),
  interactions: z.array(drugInteractionSchema).optional(),
  total_count: z.number().int().min(0),
});

export const evidenceValidationResponseSchema = z.object({
  validation_id: z.string().uuid(),
  overall_status: z.enum(["validated", "conflicted", "unsupported", "requires_review"]),
  confidence_score: z.number().min(0).max(1),
  evidence_sources: z.array(
    z.object({
      source_id: z.string().uuid(),
      source_name: z.string(),
      evidence_level: z.string(),
      relevance_score: z.number().min(0).max(1),
      supports_recommendation: z.boolean(),
      conflicting_evidence: z.boolean().optional(),
    }),
  ),
  recommendations: z.object({
    action: z.enum(["approve", "review", "reject", "modify"]),
    reason: z.string(),
    suggested_modifications: z.array(z.string()).optional(),
  }),
  human_review_required: z.boolean(),
});

// Error handling schemas
export const knowledgeBaseErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  details: z.record(z.any()).optional(),
  source: z.string().optional(),
});

// Pagination and filtering helpers
export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).optional(),
});

export const sortingSchema = z.object({
  field: z.string().min(1),
  direction: z.enum(["asc", "desc"]).default("desc"),
});

export const filterSchema = z.object({
  field: z.string().min(1),
  operator: z.enum(["eq", "ne", "gt", "gte", "lt", "lte", "in", "nin", "like", "ilike"]),
  value: z.union([z.string(), z.number(), z.boolean(), z.array(z.any())]),
});

// Comprehensive query builder schema
export const knowledgeQueryBuilderSchema = z.object({
  select: z.array(z.string()).optional(),
  filters: z.array(filterSchema).optional(),
  search: z
    .object({
      query: z.string(),
      fields: z.array(z.string()).optional(),
      operator: z.enum(["and", "or"]).default("and"),
    })
    .optional(),
  sort: z.array(sortingSchema).optional(),
  pagination: paginationSchema.optional(),
  include_related: z.array(z.string()).optional(),
});

// Type inference from schemas
export type KnowledgeSourceInput = z.infer<typeof createKnowledgeSourceRequestSchema>;
export type KnowledgeSourceUpdate = z.infer<typeof updateKnowledgeSourceRequestSchema>;
export type MedicalKnowledgeInput = z.infer<typeof createMedicalKnowledgeRequestSchema>;
export type MedicalSearchQuery = z.infer<typeof medicalSearchQuerySchema>;
export type DrugSearchQuery = z.infer<typeof drugSearchQuerySchema>;
export type EvidenceValidationRequest = z.infer<typeof evidenceValidationRequestSchema>;
export type KnowledgeBaseSettings = z.infer<typeof knowledgeBaseSettingsSchema>;
export type KnowledgeIntegrationConfig = z.infer<typeof knowledgeIntegrationConfigSchema>;
