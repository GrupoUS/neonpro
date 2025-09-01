import { z } from "zod";

// LGPD Data Processing Legal Basis
export const LgpdLegalBasisSchema = z.enum([
  "consent", // Consentimento
  "legitimate_interest", // Interesse legítimo
  "contract_performance", // Execução de contrato
  "legal_obligation", // Cumprimento de obrigação legal
  "vital_interests", // Proteção da vida ou incolumidade física
  "public_interest", // Exercício regular de direitos
  "credit_protection", // Proteção ao crédito
]);

// LGPD Data Subject Rights
export const DataSubjectRightSchema = z.enum([
  "access", // Confirmação e acesso
  "correction", // Correção
  "anonymization", // Anonimização
  "blocking", // Bloqueio
  "elimination", // Eliminação
  "portability", // Portabilidade
  "information", // Informações sobre compartilhamento
  "revoke_consent", // Revogação do consentimento
  "oppose_processing", // Oposição ao tratamento
]);

// Data Category Schema
export const DataCategorySchema = z.enum([
  "personal_identification", // Identificação pessoal
  "contact_information", // Informações de contato
  "medical_records", // Registros médicos
  "financial_data", // Dados financeiros
  "biometric_data", // Dados biométricos
  "genetic_data", // Dados genéticos
  "behavioral_data", // Dados comportamentais
  "location_data", // Dados de localização
  "professional_data", // Dados profissionais
  "sensitive_data", // Dados sensíveis
  "children_data", // Dados de menores
]);

// Processing Purpose Schema
export const ProcessingPurposeSchema = z.enum([
  "healthcare_provision", // Prestação de cuidados de saúde
  "appointment_management", // Gestão de consultas
  "billing_payment", // Cobrança e pagamento
  "marketing_communication", // Comunicação de marketing
  "service_improvement", // Melhoria de serviços
  "legal_compliance", // Conformidade legal
  "quality_assurance", // Garantia de qualidade
  "research_statistics", // Pesquisa e estatísticas
  "fraud_prevention", // Prevenção de fraudes
  "system_security", // Segurança do sistema
]);

// Audit Action Schema
export const AuditActionSchema = z.enum([
  "create", // Criar
  "read", // Ler/Visualizar
  "update", // Atualizar
  "delete", // Deletar
  "export", // Exportar
  "print", // Imprimir
  "share", // Compartilhar
  "backup", // Backup
  "restore", // Restaurar
  "login", // Login
  "logout", // Logout
  "access_denied", // Acesso negado
  "password_change", // Mudança de senha
  "permission_change", // Mudança de permissão
  "data_export", // Exportação de dados
  "consent_given", // Consentimento dado
  "consent_revoked", // Consentimento revogado
  "gdpr_request", // Solicitação LGPD
]);

// Risk Level Schema
export const RiskLevelSchema = z.enum([
  "low", // Baixo
  "medium", // Médio
  "high", // Alto
  "critical", // Crítico
]);

// Incident Category Schema
export const IncidentCategorySchema = z.enum([
  "data_breach", // Vazamento de dados
  "unauthorized_access", // Acesso não autorizado
  "system_failure", // Falha do sistema
  "human_error", // Erro humano
  "malware", // Malware
  "phishing", // Phishing
  "insider_threat", // Ameaça interna
  "physical_security", // Segurança física
  "compliance_violation", // Violação de conformidade
  "other", // Outro
]);

// Data Retention Schema
export const DataRetentionSchema = z.object({
  id: z.string().uuid().optional(),
  data_category: DataCategorySchema,
  retention_period_months: z.number().min(1).max(600), // Up to 50 years for medical records
  legal_basis: z.string().max(500),
  deletion_method: z
    .enum(["automatic", "manual", "archival"])
    .default("automatic"),
  exceptions: z.string().max(1000).optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

// Consent Record Schema
export const ConsentRecordSchema = z.object({
  id: z.string().uuid().optional(),
  user_id: z.string().uuid(),
  data_subject_name: z.string(),
  consent_version: z.string(),
  processing_purposes: z.array(ProcessingPurposeSchema),
  data_categories: z.array(DataCategorySchema),
  legal_basis: LgpdLegalBasisSchema,
  consent_given: z.boolean(),
  consent_date: z.string().datetime(),
  expiry_date: z.string().datetime().optional(),
  withdrawal_date: z.string().datetime().optional(),
  withdrawal_reason: z.string().max(500).optional(),
  ip_address: z.string().ip(),
  user_agent: z.string().optional(),
  consent_method: z
    .enum(["web", "mobile", "paper", "verbal", "email"])
    .default("web"),
  witness_name: z.string().optional(),
  is_active: z.boolean().default(true),
  marketing_consent: z.boolean().default(false),
  data_sharing_consent: z.boolean().default(false),
  research_consent: z.boolean().default(false),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

// Data Processing Activity Schema
export const DataProcessingActivitySchema = z.object({
  id: z.string().uuid().optional(),
  activity_name: z
    .string()
    .min(3, "Nome da atividade deve ter pelo menos 3 caracteres")
    .max(200, "Nome da atividade deve ter no máximo 200 caracteres"),
  description: z
    .string()
    .min(10, "Descrição deve ter pelo menos 10 caracteres")
    .max(2000, "Descrição deve ter no máximo 2000 caracteres"),
  controller_name: z.string(),
  controller_contact: z.string().email(),
  dpo_contact: z.string().email().optional(),
  purposes: z.array(ProcessingPurposeSchema),
  legal_basis: z.array(LgpdLegalBasisSchema),
  data_categories: z.array(DataCategorySchema),
  data_subjects: z.array(z.string()),
  recipients: z.array(z.string()).default([]),
  international_transfers: z
    .array(
      z.object({
        country: z.string(),
        safeguards: z.string(),
        adequacy_decision: z.boolean().default(false),
      }),
    )
    .default([]),
  retention_period: z.string(),
  security_measures: z.array(z.string()),
  privacy_impact_assessment: z.boolean().default(false),
  pia_date: z.string().date().optional(),
  pia_outcome: z.string().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  reviewed_at: z.string().datetime().optional(),
  next_review_date: z.string().date(),
});

// Data Subject Request Schema
export const DataSubjectRequestSchema = z.object({
  id: z.string().uuid().optional(),
  request_number: z.string().optional(),
  user_id: z.string().uuid().optional(),
  requester_name: z
    .string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(100, "Nome deve ter no máximo 100 caracteres"),
  requester_email: z.string().email(),
  requester_phone: z.string().optional(),
  request_type: DataSubjectRightSchema,
  description: z
    .string()
    .min(10, "Descrição deve ter pelo menos 10 caracteres")
    .max(2000, "Descrição deve ter no máximo 2000 caracteres"),
  status: z
    .enum(["pending", "in_progress", "completed", "rejected", "cancelled"])
    .default("pending"),
  priority: z.enum(["low", "normal", "high", "urgent"]).default("normal"),
  assigned_to: z.string().uuid().optional(),
  received_date: z.string().datetime(),
  due_date: z.string().datetime(),
  completed_date: z.string().datetime().optional(),
  response: z.string().max(2000).optional(),
  response_method: z
    .enum(["email", "mail", "in_person", "secure_portal"])
    .optional(),
  documents_provided: z.array(z.string()).default([]),
  verification_method: z
    .enum([
      "id_document",
      "email_verification",
      "phone_verification",
      "in_person",
    ])
    .optional(),
  verification_completed: z.boolean().default(false),
  verification_date: z.string().datetime().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  notes: z.string().max(1000).optional(),
});

// Audit Log Schema
export const AuditLogSchema = z.object({
  id: z.string().uuid().optional(),
  timestamp: z.string().datetime(),
  user_id: z.string().uuid().optional(),
  user_name: z.string().optional(),
  user_role: z.string().optional(),
  session_id: z.string().uuid().optional(),
  action: AuditActionSchema,
  resource_type: z.string(), // 'patient', 'appointment', 'service', etc.
  resource_id: z.string().uuid().optional(),
  resource_name: z.string().optional(),
  ip_address: z.string().ip(),
  user_agent: z.string().optional(),
  location: z.string().optional(),
  device_info: z
    .object({
      device_type: z.enum(["desktop", "mobile", "tablet"]).optional(),
      operating_system: z.string().optional(),
      browser: z.string().optional(),
    })
    .optional(),
  success: z.boolean(),
  error_message: z.string().optional(),
  changes: z
    .record(
      z.object({
        old_value: z.<unknown>().optional(),
        new_value: z.<unknown>().optional(),
      }),
    )
    .optional(),
  metadata: z.record(z.<unknown>()).optional(),
  risk_level: RiskLevelSchema.default("low"),
  compliance_flags: z.array(z.string()).default([]),
  retention_date: z.string().datetime(),
  is_sensitive: z.boolean().default(false),
});

// Security Incident Schema
export const SecurityIncidentSchema = z.object({
  id: z.string().uuid().optional(),
  incident_number: z.string().optional(),
  title: z
    .string()
    .min(5, "Título deve ter pelo menos 5 caracteres")
    .max(200, "Título deve ter no máximo 200 caracteres"),
  description: z
    .string()
    .min(10, "Descrição deve ter pelo menos 10 caracteres")
    .max(2000, "Descrição deve ter no máximo 2000 caracteres"),
  category: IncidentCategorySchema,
  severity: z.enum(["low", "medium", "high", "critical"]).default("medium"),
  status: z
    .enum(["open", "investigating", "contained", "resolved", "closed"])
    .default("open"),

  // Incident Details
  discovered_date: z.string().datetime(),
  occurred_date: z.string().datetime().optional(),
  reporter_id: z.string().uuid().optional(),
  reporter_name: z.string().optional(),
  assigned_investigator: z.string().uuid().optional(),

  // Data Breach Specific
  data_types_affected: z.array(DataCategorySchema).optional(),
  records_affected: z.number().min(0).optional(),
  individuals_affected: z.number().min(0).optional(),
  potential_impact: z.string().max(1000).optional(),

  // Response Actions
  immediate_actions: z.string().max(2000).optional(),
  containment_actions: z.string().max(2000).optional(),
  remediation_actions: z.string().max(2000).optional(),
  prevention_measures: z.string().max(2000).optional(),

  // Notifications
  authorities_notified: z.boolean().default(false),
  authority_notification_date: z.string().datetime().optional(),
  individuals_notified: z.boolean().default(false),
  individual_notification_date: z.string().datetime().optional(),
  notification_method: z
    .enum(["email", "letter", "website", "media", "sms"])
    .optional(),

  // Investigation
  root_cause: z.string().max(1000).optional(),
  lessons_learned: z.string().max(1000).optional(),
  cost_estimate: z.number().min(0).optional(),

  // Compliance
  lgpd_breach: z.boolean().default(false),
  anvisa_reportable: z.boolean().default(false),
  external_parties_involved: z.array(z.string()).default([]),

  // Timestamps
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  closed_at: z.string().datetime().optional(),
});

// Vendor/Third Party Schema
export const VendorComplianceSchema = z.object({
  id: z.string().uuid().optional(),
  vendor_name: z
    .string()
    .min(2, "Nome do fornecedor deve ter pelo menos 2 caracteres")
    .max(200, "Nome do fornecedor deve ter no máximo 200 caracteres"),
  vendor_type: z.enum([
    "cloud_provider",
    "software_vendor",
    "service_provider",
    "consultant",
    "other",
  ]),
  contact_person: z.string(),
  contact_email: z.string().email(),
  contract_start_date: z.string().date(),
  contract_end_date: z.string().date().optional(),

  // Services Provided
  services_description: z.string().max(1000),
  data_processing: z.boolean().default(false),
  data_categories_processed: z.array(DataCategorySchema).default([]),
  processing_location: z.string().optional(),

  // Compliance Status
  lgpd_compliant: z.boolean().default(false),
  lgpd_assessment_date: z.string().date().optional(),
  dpa_signed: z.boolean().default(false),
  dpa_date: z.string().date().optional(),
  security_assessment: z.boolean().default(false),
  security_assessment_date: z.string().date().optional(),
  certifications: z.array(z.string()).default([]),

  // Risk Assessment
  risk_level: RiskLevelSchema.default("medium"),
  risk_assessment_date: z.string().date().optional(),
  risk_mitigation_measures: z.string().max(1000).optional(),

  // Monitoring
  last_audit_date: z.string().date().optional(),
  next_audit_date: z.string().date().optional(),
  incidents_reported: z.number().min(0).default(0),
  performance_rating: z.number().min(1).max(5).optional(),

  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

// Privacy Impact Assessment Schema
export const PrivacyImpactAssessmentSchema = z.object({
  id: z.string().uuid().optional(),
  pia_number: z.string().optional(),
  project_name: z
    .string()
    .min(3, "Nome do projeto deve ter pelo menos 3 caracteres")
    .max(200, "Nome do projeto deve ter no máximo 200 caracteres"),
  project_description: z
    .string()
    .min(10, "Descrição deve ter pelo menos 10 caracteres")
    .max(2000, "Descrição deve ter no máximo 2000 caracteres"),

  // Assessment Details
  assessor_name: z.string(),
  assessor_email: z.string().email(),
  assessment_date: z.string().date(),
  review_date: z.string().date().optional(),

  // Data Processing Information
  data_categories: z.array(DataCategorySchema),
  processing_purposes: z.array(ProcessingPurposeSchema),
  legal_basis: z.array(LgpdLegalBasisSchema),
  data_subjects: z.array(z.string()),
  data_sources: z.array(z.string()),
  data_recipients: z.array(z.string()).default([]),
  retention_periods: z.string(),

  // Risk Assessment
  privacy_risks: z.array(
    z.object({
      risk_description: z.string(),
      likelihood: z.enum(["very_low", "low", "medium", "high", "very_high"]),
      impact: z.enum(["very_low", "low", "medium", "high", "very_high"]),
      risk_level: RiskLevelSchema,
      mitigation_measures: z.string(),
    }),
  ),

  // Conclusions
  overall_risk_level: RiskLevelSchema,
  recommendation: z.enum([
    "proceed",
    "proceed_with_conditions",
    "reject",
    "needs_review",
  ]),
  conditions: z.string().max(1000).optional(),

  // Approval
  approved_by: z.string().optional(),
  approval_date: z.string().date().optional(),

  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

// Training Record Schema
export const TrainingRecordSchema = z.object({
  id: z.string().uuid().optional(),
  user_id: z.string().uuid(),
  user_name: z.string(),
  training_type: z.enum([
    "lgpd_awareness",
    "data_security",
    "incident_response",
    "anvisa_compliance",
    "clinical_protocols",
  ]),
  training_title: z.string(),
  provider: z.string().optional(),
  completion_date: z.string().date(),
  expiry_date: z.string().date().optional(),
  score: z.number().min(0).max(100).optional(),
  certificate_url: z.string().url().optional(),
  created_at: z.string().datetime(),
});

// Query Schemas
export const ComplianceQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),

  // Date filters
  date_from: z.string().date().optional(),
  date_to: z.string().date().optional(),

  // Type filters
  user_id: z.string().uuid().optional(),
  resource_type: z.string().optional(),
  action: AuditActionSchema.optional(),
  risk_level: RiskLevelSchema.optional(),

  // Sorting
  sort_by: z
    .enum(["timestamp", "risk_level", "user_name", "action"])
    .default("timestamp"),
  sort_order: z.enum(["asc", "desc"]).default("desc"),
});

// Response Schemas
export const AuditLogResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z
    .object({
      logs: z.array(AuditLogSchema),
      pagination: z.object({
        page: z.number(),
        limit: z.number(),
        total: z.number(),
        total_pages: z.number(),
        has_next: z.boolean(),
        has_prev: z.boolean(),
      }),
      summary: z
        .object({
          total_events: z.number(),
          by_action: z.record(z.number()),
          by_risk_level: z.record(z.number()),
          unique_users: z.number(),
        })
        .optional(),
    })
    .optional(),
});

export const ComplianceReportSchema = z.object({
  report_period: z.object({
    start_date: z.string().date(),
    end_date: z.string().date(),
  }),
  consent_summary: z.object({
    total_consents: z.number(),
    active_consents: z.number(),
    withdrawn_consents: z.number(),
    expired_consents: z.number(),
  }),
  data_requests_summary: z.object({
    total_requests: z.number(),
    pending_requests: z.number(),
    completed_requests: z.number(),
    average_response_time: z.number(), // days
  }),
  security_incidents: z.object({
    total_incidents: z.number(),
    by_severity: z.record(z.number()),
    resolved_incidents: z.number(),
    data_breaches: z.number(),
  }),
  audit_summary: z.object({
    total_events: z.number(),
    high_risk_events: z.number(),
    failed_access_attempts: z.number(),
    by_user_role: z.record(z.number()),
  }),
  vendor_compliance: z.object({
    total_vendors: z.number(),
    compliant_vendors: z.number(),
    pending_assessments: z.number(),
  }),
  training_compliance: z.object({
    total_users: z.number(),
    trained_users: z.number(),
    expired_training: z.number(),
  }),
  recommendations: z.array(z.string()),
});

// Type exports
export type LgpdLegalBasis = z.infer<typeof LgpdLegalBasisSchema>;
export type DataSubjectRight = z.infer<typeof DataSubjectRightSchema>;
export type DataCategory = z.infer<typeof DataCategorySchema>;
export type ProcessingPurpose = z.infer<typeof ProcessingPurposeSchema>;
export type AuditAction = z.infer<typeof AuditActionSchema>;
export type RiskLevel = z.infer<typeof RiskLevelSchema>;
export type IncidentCategory = z.infer<typeof IncidentCategorySchema>;
export type DataRetention = z.infer<typeof DataRetentionSchema>;
export type ConsentRecord = z.infer<typeof ConsentRecordSchema>;
export type DataProcessingActivity = z.infer<
  typeof DataProcessingActivitySchema
>;
export type DataSubjectRequest = z.infer<typeof DataSubjectRequestSchema>;
export type AuditLog = z.infer<typeof AuditLogSchema>;
export type SecurityIncident = z.infer<typeof SecurityIncidentSchema>;
export type VendorCompliance = z.infer<typeof VendorComplianceSchema>;
export type PrivacyImpactAssessment = z.infer<
  typeof PrivacyImpactAssessmentSchema
>;
export type TrainingRecord = z.infer<typeof TrainingRecordSchema>;
export type ComplianceQuery = z.infer<typeof ComplianceQuerySchema>;
export type AuditLogResponse = z.infer<typeof AuditLogResponseSchema>;
export type ComplianceReport = z.infer<typeof ComplianceReportSchema>;
