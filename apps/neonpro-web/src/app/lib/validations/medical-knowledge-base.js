"use strict";
// Medical Knowledge Base Validation Schemas
// Story 9.5: Zod validation for medical knowledge management
Object.defineProperty(exports, "__esModule", { value: true });
exports.knowledgeQueryBuilderSchema =
  exports.filterSchema =
  exports.sortingSchema =
  exports.paginationSchema =
  exports.knowledgeBaseErrorSchema =
  exports.evidenceValidationResponseSchema =
  exports.drugSearchResultSchema =
  exports.knowledgeSearchResultSchema =
  exports.bulkKnowledgeImportSchema =
  exports.syncTriggerRequestSchema =
  exports.validateRecommendationRequestSchema =
  exports.createMedicalKnowledgeRequestSchema =
  exports.updateKnowledgeSourceRequestSchema =
  exports.createKnowledgeSourceRequestSchema =
  exports.knowledgeBaseSettingsSchema =
  exports.knowledgeIntegrationConfigSchema =
  exports.evidenceValidationRequestSchema =
  exports.drugSearchQuerySchema =
  exports.medicalSearchQuerySchema =
  exports.medicalGuidelineSchema =
  exports.drugInteractionSchema =
  exports.drugInformationSchema =
  exports.validationResultSchema =
  exports.researchCacheSchema =
  exports.medicalKnowledgeSchema =
  exports.knowledgeSourceSchema =
    void 0;
var zod_1 = require("zod");
// Base validation schemas
exports.knowledgeSourceSchema = zod_1.z.object({
  id: zod_1.z.string().uuid().optional(),
  source_name: zod_1.z.string().min(1).max(255),
  source_type: zod_1.z.enum([
    "database",
    "journal",
    "guideline",
    "drug_db",
    "classification",
    "research",
  ]),
  api_endpoint: zod_1.z.string().url().optional(),
  access_credentials: zod_1.z.record(zod_1.z.any()).optional(),
  last_sync: zod_1.z.string().datetime().optional(),
  sync_frequency: zod_1.z.number().int().min(1).max(8760).default(24), // 1 hour to 1 year
  status: zod_1.z.enum(["active", "inactive", "error", "syncing"]).default("active"),
  configuration: zod_1.z.record(zod_1.z.any()).optional(),
  created_at: zod_1.z.string().datetime().optional(),
  updated_at: zod_1.z.string().datetime().optional(),
  created_by: zod_1.z.string().uuid().optional(),
});
exports.medicalKnowledgeSchema = zod_1.z.object({
  id: zod_1.z.string().uuid().optional(),
  knowledge_type: zod_1.z.enum([
    "guideline",
    "research",
    "drug_info",
    "diagnosis",
    "treatment",
    "protocol",
    "reference",
  ]),
  title: zod_1.z.string().min(1).max(500),
  content_data: zod_1.z.record(zod_1.z.any()),
  source_id: zod_1.z.string().uuid().optional(),
  external_id: zod_1.z.string().max(255).optional(),
  validity_date: zod_1.z.string().date().optional(),
  evidence_level: zod_1.z.enum(["A", "B", "C", "D", "Expert Opinion", "Not Graded"]).optional(),
  quality_score: zod_1.z.number().min(0).max(1).optional(),
  medical_categories: zod_1.z.array(zod_1.z.string()).optional(),
  keywords: zod_1.z.array(zod_1.z.string()).optional(),
  language: zod_1.z.string().length(2).default("en"),
  created_at: zod_1.z.string().datetime().optional(),
  updated_at: zod_1.z.string().datetime().optional(),
});
exports.researchCacheSchema = zod_1.z.object({
  id: zod_1.z.string().uuid().optional(),
  search_query: zod_1.z.string().min(1),
  search_parameters: zod_1.z.record(zod_1.z.any()).optional(),
  search_results: zod_1.z.record(zod_1.z.any()),
  source_id: zod_1.z.string().uuid().optional(),
  cache_date: zod_1.z.string().datetime().optional(),
  expiry_date: zod_1.z.string().datetime(),
  relevance_score: zod_1.z.number().min(0).max(1).optional(),
  result_count: zod_1.z.number().int().min(0).optional(),
  search_user_id: zod_1.z.string().uuid().optional(),
});
exports.validationResultSchema = zod_1.z.object({
  id: zod_1.z.string().uuid().optional(),
  recommendation_id: zod_1.z.string().uuid().optional(),
  recommendation_type: zod_1.z.string().max(100).optional(),
  knowledge_source_id: zod_1.z.string().uuid().optional(),
  knowledge_reference_id: zod_1.z.string().uuid().optional(),
  evidence_level: zod_1.z.string().max(50).optional(),
  validation_status: zod_1.z.enum([
    "validated",
    "conflicted",
    "unsupported",
    "pending",
    "requires_review",
  ]),
  confidence_score: zod_1.z.number().min(0).max(1).optional(),
  validation_notes: zod_1.z.string().optional(),
  validation_date: zod_1.z.string().datetime().optional(),
  validator_id: zod_1.z.string().uuid().optional(),
  automated: zod_1.z.boolean().default(true),
});
exports.drugInformationSchema = zod_1.z.object({
  id: zod_1.z.string().uuid().optional(),
  drug_name: zod_1.z.string().min(1).max(255),
  generic_name: zod_1.z.string().max(255).optional(),
  brand_names: zod_1.z.array(zod_1.z.string()).optional(),
  drug_class: zod_1.z.string().max(255).optional(),
  mechanism_of_action: zod_1.z.string().optional(),
  indications: zod_1.z.array(zod_1.z.string()).optional(),
  contraindications: zod_1.z.array(zod_1.z.string()).optional(),
  side_effects: zod_1.z.record(zod_1.z.any()).optional(),
  dosage_information: zod_1.z.record(zod_1.z.any()).optional(),
  interaction_data: zod_1.z.record(zod_1.z.any()).optional(),
  monitoring_requirements: zod_1.z.array(zod_1.z.string()).optional(),
  pregnancy_category: zod_1.z.string().max(10).optional(),
  controlled_substance_schedule: zod_1.z.string().max(10).optional(),
  source_id: zod_1.z.string().uuid().optional(),
  last_updated: zod_1.z.string().datetime().optional(),
});
exports.drugInteractionSchema = zod_1.z
  .object({
    id: zod_1.z.string().uuid().optional(),
    drug_1_id: zod_1.z.string().uuid(),
    drug_2_id: zod_1.z.string().uuid(),
    interaction_type: zod_1.z.enum(["major", "moderate", "minor", "contraindicated"]),
    severity_level: zod_1.z.number().int().min(1).max(10),
    mechanism: zod_1.z.string().optional(),
    clinical_effects: zod_1.z.string().optional(),
    management_strategy: zod_1.z.string().optional(),
    evidence_level: zod_1.z.string().max(50).optional(),
    source_id: zod_1.z.string().uuid().optional(),
  })
  .refine(
    function (data) {
      return data.drug_1_id !== data.drug_2_id;
    },
    {
      message: "Drug IDs must be different",
      path: ["drug_2_id"],
    },
  );
exports.medicalGuidelineSchema = zod_1.z.object({
  id: zod_1.z.string().uuid().optional(),
  guideline_title: zod_1.z.string().min(1).max(500),
  organization: zod_1.z.string().max(255).optional(),
  version: zod_1.z.string().max(50).optional(),
  publication_date: zod_1.z.string().date().optional(),
  last_review_date: zod_1.z.string().date().optional(),
  next_review_date: zod_1.z.string().date().optional(),
  specialty: zod_1.z.string().max(255).optional(),
  conditions_covered: zod_1.z.array(zod_1.z.string()).optional(),
  guideline_content: zod_1.z.record(zod_1.z.any()).optional(),
  evidence_grade: zod_1.z.string().max(50).optional(),
  implementation_notes: zod_1.z.string().optional(),
  source_id: zod_1.z.string().uuid().optional(),
  status: zod_1.z.enum(["current", "superseded", "withdrawn", "draft"]).default("current"),
});
// Search and query validation schemas
exports.medicalSearchQuerySchema = zod_1.z.object({
  query: zod_1.z.string().min(1).max(1000),
  filters: zod_1.z
    .object({
      knowledge_type: zod_1.z.array(zod_1.z.string()).optional(),
      evidence_level: zod_1.z.array(zod_1.z.string()).optional(),
      medical_categories: zod_1.z.array(zod_1.z.string()).optional(),
      date_range: zod_1.z
        .object({
          start: zod_1.z.string().date().optional(),
          end: zod_1.z.string().date().optional(),
        })
        .optional(),
      quality_threshold: zod_1.z.number().min(0).max(1).optional(),
    })
    .optional(),
  pagination: zod_1.z
    .object({
      page: zod_1.z.number().int().min(1).default(1),
      limit: zod_1.z.number().int().min(1).max(100).default(20),
    })
    .optional(),
  sort: zod_1.z
    .object({
      field: zod_1.z.string(),
      direction: zod_1.z.enum(["asc", "desc"]).default("desc"),
    })
    .optional(),
});
exports.drugSearchQuerySchema = zod_1.z.object({
  drug_name: zod_1.z.string().max(255).optional(),
  generic_name: zod_1.z.string().max(255).optional(),
  drug_class: zod_1.z.string().max(255).optional(),
  indication: zod_1.z.string().max(500).optional(),
  interaction_check: zod_1.z.array(zod_1.z.string().uuid()).optional(),
});
exports.evidenceValidationRequestSchema = zod_1.z.object({
  recommendation_id: zod_1.z.string().uuid(),
  recommendation_type: zod_1.z.string().min(1).max(100),
  recommendation_content: zod_1.z.record(zod_1.z.any()),
  validation_criteria: zod_1.z
    .object({
      min_evidence_level: zod_1.z.enum(["A", "B", "C", "D", "Expert Opinion"]).optional(),
      require_guidelines: zod_1.z.boolean().default(false),
      recent_only: zod_1.z.boolean().default(false),
      max_age_months: zod_1.z.number().int().min(1).max(120).optional(),
    })
    .optional(),
});
// Knowledge base integration schemas
exports.knowledgeIntegrationConfigSchema = zod_1.z.object({
  source_id: zod_1.z.string().uuid(),
  api_settings: zod_1.z.object({
    base_url: zod_1.z.string().url(),
    api_key: zod_1.z.string().optional(),
    rate_limit: zod_1.z
      .object({
        requests_per_minute: zod_1.z.number().int().min(1).max(1000).default(60),
        burst_limit: zod_1.z.number().int().min(1).max(100).default(10),
      })
      .optional(),
    timeout_ms: zod_1.z.number().int().min(1000).max(300000).default(30000),
  }),
  sync_settings: zod_1.z.object({
    auto_sync: zod_1.z.boolean().default(true),
    sync_interval_hours: zod_1.z.number().int().min(1).max(168).default(24),
    full_sync_frequency_days: zod_1.z.number().int().min(1).max(365).default(7),
    incremental_sync: zod_1.z.boolean().default(true),
  }),
  data_mapping: zod_1.z.object({
    title_field: zod_1.z.string().min(1),
    content_field: zod_1.z.string().min(1),
    category_field: zod_1.z.string().optional(),
    date_field: zod_1.z.string().optional(),
    evidence_field: zod_1.z.string().optional(),
  }),
});
exports.knowledgeBaseSettingsSchema = zod_1.z.object({
  search_settings: zod_1.z.object({
    default_result_limit: zod_1.z.number().int().min(1).max(100).default(20),
    relevance_threshold: zod_1.z.number().min(0).max(1).default(0.3),
    enable_semantic_search: zod_1.z.boolean().default(true),
    cache_duration_hours: zod_1.z.number().int().min(1).max(168).default(24),
  }),
  validation_settings: zod_1.z.object({
    auto_validate_low_risk: zod_1.z.boolean().default(true),
    require_human_review_threshold: zod_1.z.number().min(0).max(1).default(0.7),
    evidence_level_weights: zod_1.z.record(zod_1.z.number().min(0).max(1)).default({
      A: 1.0,
      B: 0.8,
      C: 0.6,
      D: 0.4,
      "Expert Opinion": 0.3,
      "Not Graded": 0.2,
    }),
    validation_timeout_hours: zod_1.z.number().int().min(1).max(72).default(24),
  }),
  sync_settings: zod_1.z.object({
    default_sync_interval: zod_1.z.number().int().min(1).max(168).default(24),
    max_concurrent_syncs: zod_1.z.number().int().min(1).max(10).default(3),
    retry_failed_syncs: zod_1.z.boolean().default(true),
    notification_preferences: zod_1.z.array(zod_1.z.string()).default(["email", "dashboard"]),
  }),
});
// API request schemas
exports.createKnowledgeSourceRequestSchema = exports.knowledgeSourceSchema.pick({
  source_name: true,
  source_type: true,
  api_endpoint: true,
  sync_frequency: true,
  configuration: true,
});
exports.updateKnowledgeSourceRequestSchema = exports.knowledgeSourceSchema
  .pick({
    source_name: true,
    api_endpoint: true,
    sync_frequency: true,
    status: true,
    configuration: true,
  })
  .partial();
exports.createMedicalKnowledgeRequestSchema = exports.medicalKnowledgeSchema.pick({
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
exports.validateRecommendationRequestSchema = zod_1.z.object({
  recommendation: zod_1.z.object({
    type: zod_1.z.string().min(1),
    content: zod_1.z.record(zod_1.z.any()),
    patient_context: zod_1.z.record(zod_1.z.any()).optional(),
  }),
  validation_options: zod_1.z
    .object({
      min_evidence_level: zod_1.z.enum(["A", "B", "C", "D", "Expert Opinion"]).optional(),
      require_guidelines: zod_1.z.boolean().default(false),
      max_age_months: zod_1.z.number().int().min(1).max(120).optional(),
    })
    .optional(),
});
// Sync and status schemas
exports.syncTriggerRequestSchema = zod_1.z.object({
  source_ids: zod_1.z.array(zod_1.z.string().uuid()).optional(),
  force_full_sync: zod_1.z.boolean().default(false),
  priority: zod_1.z.enum(["high", "normal", "low"]).default("normal"),
});
exports.bulkKnowledgeImportSchema = zod_1.z.object({
  source_id: zod_1.z.string().uuid(),
  knowledge_items: zod_1.z.array(exports.createMedicalKnowledgeRequestSchema),
  import_options: zod_1.z
    .object({
      skip_duplicates: zod_1.z.boolean().default(true),
      validate_before_import: zod_1.z.boolean().default(true),
      update_existing: zod_1.z.boolean().default(false),
    })
    .optional(),
});
// Response validation schemas
exports.knowledgeSearchResultSchema = zod_1.z.object({
  results: zod_1.z.array(exports.medicalKnowledgeSchema),
  total_count: zod_1.z.number().int().min(0),
  page: zod_1.z.number().int().min(1),
  limit: zod_1.z.number().int().min(1),
  search_meta: zod_1.z.object({
    query: zod_1.z.string(),
    search_time_ms: zod_1.z.number().min(0),
    relevance_scores: zod_1.z.array(zod_1.z.number()),
    filters_applied: zod_1.z.record(zod_1.z.any()),
  }),
});
exports.drugSearchResultSchema = zod_1.z.object({
  drugs: zod_1.z.array(exports.drugInformationSchema),
  interactions: zod_1.z.array(exports.drugInteractionSchema).optional(),
  total_count: zod_1.z.number().int().min(0),
});
exports.evidenceValidationResponseSchema = zod_1.z.object({
  validation_id: zod_1.z.string().uuid(),
  overall_status: zod_1.z.enum(["validated", "conflicted", "unsupported", "requires_review"]),
  confidence_score: zod_1.z.number().min(0).max(1),
  evidence_sources: zod_1.z.array(
    zod_1.z.object({
      source_id: zod_1.z.string().uuid(),
      source_name: zod_1.z.string(),
      evidence_level: zod_1.z.string(),
      relevance_score: zod_1.z.number().min(0).max(1),
      supports_recommendation: zod_1.z.boolean(),
      conflicting_evidence: zod_1.z.boolean().optional(),
    }),
  ),
  recommendations: zod_1.z.object({
    action: zod_1.z.enum(["approve", "review", "reject", "modify"]),
    reason: zod_1.z.string(),
    suggested_modifications: zod_1.z.array(zod_1.z.string()).optional(),
  }),
  human_review_required: zod_1.z.boolean(),
});
// Error handling schemas
exports.knowledgeBaseErrorSchema = zod_1.z.object({
  code: zod_1.z.string(),
  message: zod_1.z.string(),
  details: zod_1.z.record(zod_1.z.any()).optional(),
  source: zod_1.z.string().optional(),
});
// Pagination and filtering helpers
exports.paginationSchema = zod_1.z.object({
  page: zod_1.z.number().int().min(1).default(1),
  limit: zod_1.z.number().int().min(1).max(100).default(20),
  offset: zod_1.z.number().int().min(0).optional(),
});
exports.sortingSchema = zod_1.z.object({
  field: zod_1.z.string().min(1),
  direction: zod_1.z.enum(["asc", "desc"]).default("desc"),
});
exports.filterSchema = zod_1.z.object({
  field: zod_1.z.string().min(1),
  operator: zod_1.z.enum(["eq", "ne", "gt", "gte", "lt", "lte", "in", "nin", "like", "ilike"]),
  value: zod_1.z.union([
    zod_1.z.string(),
    zod_1.z.number(),
    zod_1.z.boolean(),
    zod_1.z.array(zod_1.z.any()),
  ]),
});
// Comprehensive query builder schema
exports.knowledgeQueryBuilderSchema = zod_1.z.object({
  select: zod_1.z.array(zod_1.z.string()).optional(),
  filters: zod_1.z.array(exports.filterSchema).optional(),
  search: zod_1.z
    .object({
      query: zod_1.z.string(),
      fields: zod_1.z.array(zod_1.z.string()).optional(),
      operator: zod_1.z.enum(["and", "or"]).default("and"),
    })
    .optional(),
  sort: zod_1.z.array(exports.sortingSchema).optional(),
  pagination: exports.paginationSchema.optional(),
  include_related: zod_1.z.array(zod_1.z.string()).optional(),
});
