// =====================================================================================
// SUPPLIER MANAGEMENT VALIDATION SCHEMAS
// Epic 6 - Story 6.3: Comprehensive supplier management with performance tracking
// =====================================================================================

import { z } from 'zod';

// =====================================================================================
// ENUM SCHEMAS
// =====================================================================================

export const supplierTypeSchema = z.enum([
  'medical_supplies',
  'pharmaceuticals',
  'equipment',
  'consumables',
  'services',
  'maintenance',
  'technology',
  'general'
] as const);

export const supplierRatingSchema = z.enum([
  'excellent',
  'good',
  'satisfactory',
  'needs_improvement',
  'poor',
  'not_rated'
] as const);

export const supplierStatusSchema = z.enum([
  'active',
  'inactive',
  'pending_approval',
  'suspended',
  'blacklisted'
] as const);

export const contractTypeSchema = z.enum([
  'general',
  'exclusive',
  'preferred',
  'volume_based',
  'seasonal',
  'emergency'
] as const);

export const contractStatusSchema = z.enum([
  'active',
  'expired',
  'pending_renewal',
  'terminated',
  'draft'
] as const);

export const contactTypeSchema = z.enum([
  'general',
  'sales',
  'technical',
  'billing',
  'customer_service',
  'emergency'
] as const);

export const evaluationTypeSchema = z.enum([
  'monthly',
  'quarterly',
  'semi_annual',
  'annual',
  'ad_hoc'
] as const);

export const performanceGradeSchema = z.enum([
  'A+',
  'A',
  'B+',
  'B',
  'C+',
  'C',
  'D',
  'F'
] as const);

export const riskLevelSchema = z.enum([
  'low',
  'medium',
  'high',
  'critical'
] as const);

export const communicationTypeSchema = z.enum([
  'order_inquiry',
  'delivery_issue',
  'quality_complaint',
  'payment_inquiry',
  'contract_negotiation',
  'general_inquiry',
  'emergency'
] as const);

export const communicationMethodSchema = z.enum([
  'email',
  'phone',
  'whatsapp',
  'video_call',
  'in_person',
  'portal'
] as const);

export const communicationDirectionSchema = z.enum([
  'outbound',
  'inbound'
] as const);

export const communicationStatusSchema = z.enum([
  'sent',
  'delivered',
  'read',
  'responded',
  'failed'
] as const);

export const priorityLevelSchema = z.enum([
  'low',
  'medium',
  'high',
  'urgent'
] as const);

export const qualityIssueTypeSchema = z.enum([
  'defective_product',
  'wrong_product',
  'missing_items',
  'damaged_packaging',
  'expired_product',
  'documentation_error',
  'compliance_issue'
] as const);

export const severityLevelSchema = z.enum([
  'low',
  'medium',
  'high',
  'critical'
] as const);

export const issueStatusSchema = z.enum([
  'open',
  'in_progress',
  'resolved',
  'closed',
  'escalated'
] as const);

// =====================================================================================
// CORE VALIDATION SCHEMAS
// =====================================================================================

export const volumeDiscountTierSchema = z.object({
  min_quantity: z.number().positive('Quantidade mínima deve ser positiva'),
  max_quantity: z.number().positive().optional(),
  discount_percentage: z.number().min(0).max(100, 'Percentual deve estar entre 0 e 100'),
  description: z.string().optional()
}).refine(
  (data) => !data.max_quantity || data.max_quantity > data.min_quantity,
  {
    message: "Quantidade máxima deve ser maior que a mínima",
    path: ["max_quantity"]
  }
);

export const supplierSchema = z.object({
  id: z.string().uuid(),
  clinic_id: z.string().uuid(),
  
  // Basic Information
  supplier_name: z.string()
    .min(2, 'Nome do fornecedor deve ter pelo menos 2 caracteres')
    .max(255, 'Nome muito longo'),
  supplier_code: z.string()
    .min(2, 'Código deve ter pelo menos 2 caracteres')
    .max(50, 'Código muito longo'),
  business_registration: z.string().max(100).optional(),
  tax_id: z.string().max(50).optional(),
  
  // Contact Information
  primary_contact_name: z.string().max(255).optional(),
  primary_contact_email: z.string().email('Email inválido').optional(),
  primary_contact_phone: z.string().max(50).optional(),
  
  // Address Information
  address_line1: z.string().max(255).optional(),
  address_line2: z.string().max(255).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  postal_code: z.string().max(20).optional(),
  country: z.string().max(100).optional(),
  
  // Business Information
  supplier_type: supplierTypeSchema,
  category: z.array(z.string()).default([]),
  payment_terms: z.number().int().min(0).max(365).optional(),
  currency: z.string().length(3).optional(),
  
  // Performance Metrics
  performance_score: z.number().min(0).max(10).optional(),
  reliability_rating: supplierRatingSchema.optional(),
  quality_rating: supplierRatingSchema.optional(),
  delivery_rating: supplierRatingSchema.optional(),
  
  // Status and Flags
  status: supplierStatusSchema.default('active'),
  is_preferred: z.boolean().default(false),
  is_critical: z.boolean().default(false),
  
  // Audit fields
  created_by: z.string().uuid().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime()
});

export const supplierContractSchema = z.object({
  id: z.string().uuid(),
  supplier_id: z.string().uuid(),
  
  // Contract Information
  contract_number: z.string()
    .min(1, 'Número do contrato é obrigatório')
    .max(100, 'Número muito longo'),
  contract_type: contractTypeSchema,
  
  // Terms and Conditions
  start_date: z.string().datetime(),
  end_date: z.string().datetime().optional(),
  auto_renewal: z.boolean().default(false),
  renewal_notice_days: z.number().int().min(1).max(365).optional(),
  
  // Pricing and Payment
  payment_terms: z.number().int().min(0).max(365).optional(),
  early_payment_discount: z.number().min(0).max(100).optional(),
  late_payment_penalty: z.number().min(0).max(100).optional(),
  minimum_order_amount: z.number().min(0).optional(),
  volume_discount_tiers: z.array(volumeDiscountTierSchema).optional(),
  
  // Performance Clauses
  delivery_sla_days: z.number().int().min(1).max(365).optional(),
  quality_requirements: z.string().optional(),
  performance_penalties: z.record(z.any()).optional(),
  
  // Status and Metadata
  status: contractStatusSchema.default('draft'),
  contract_value: z.number().min(0).optional(),
  currency: z.string().length(3).optional(),
  
  // Document Management
  contract_document_url: z.string().url().optional(),
  signed_date: z.string().datetime().optional(),
  
  // Audit fields
  created_by: z.string().uuid().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime()
}).refine(
  (data) => !data.end_date || new Date(data.end_date) > new Date(data.start_date),
  {
    message: "Data de fim deve ser posterior à data de início",
    path: ["end_date"]
  }
);

export const supplierContactSchema = z.object({
  id: z.string().uuid(),
  supplier_id: z.string().uuid(),
  
  // Contact Information
  contact_name: z.string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(255, 'Nome muito longo'),
  contact_title: z.string().max(100).optional(),
  department: z.string().max(100).optional(),
  
  // Contact Methods
  email: z.string().email('Email inválido').optional(),
  phone: z.string().max(50).optional(),
  mobile: z.string().max(50).optional(),
  whatsapp: z.string().max(50).optional(),
  
  // Contact Type and Preferences
  contact_type: contactTypeSchema,
  is_primary: z.boolean().default(false),
  preferred_contact_method: z.string().max(50).optional(),
  
  // Communication Preferences
  can_receive_orders: z.boolean().default(false),
  can_receive_invoices: z.boolean().default(false),
  can_receive_complaints: z.boolean().default(false),
  emergency_contact: z.boolean().default(false),
  
  // Status
  is_active: z.boolean().default(true),
  
  // Audit fields
  created_at: z.string().datetime(),
  updated_at: z.string().datetime()
}).refine(
  (data) => data.email || data.phone || data.mobile,
  {
    message: "Pelo menos um método de contato deve ser fornecido",
    path: ["email"]
  }
);

export const supplierPerformanceSchema = z.object({
  id: z.string().uuid(),
  supplier_id: z.string().uuid(),
  
  // Time Period
  period_start: z.string().datetime(),
  period_end: z.string().datetime(),
  evaluation_type: evaluationTypeSchema,
  
  // Delivery Performance
  total_orders: z.number().int().min(0).optional(),
  on_time_deliveries: z.number().int().min(0).optional(),
  late_deliveries: z.number().int().min(0).optional(),
  avg_delivery_days: z.number().min(0).optional(),
  delivery_performance_score: z.number().min(0).max(10).optional(),
  
  // Quality Performance
  total_items_received: z.number().int().min(0).optional(),
  defective_items: z.number().int().min(0).optional(),
  returned_items: z.number().int().min(0).optional(),
  quality_score: z.number().min(0).max(10).optional(),
  
  // Financial Performance
  total_order_value: z.number().min(0).optional(),
  total_invoiced: z.number().min(0).optional(),
  total_paid: z.number().min(0).optional(),
  avg_payment_delay_days: z.number().min(0).optional(),
  cost_savings: z.number().optional(),
  
  // Communication and Service
  response_time_hours: z.number().min(0).optional(),
  communication_rating: z.number().min(0).max(10).optional(),
  issue_resolution_days: z.number().min(0).optional(),
  
  // Overall Performance
  overall_score: z.number().min(0).max(10).optional(),
  performance_grade: performanceGradeSchema.optional(),
  
  // Metadata
  calculated_at: z.string().datetime(),
  calculated_by: z.string().uuid().optional()
}).refine(
  (data) => new Date(data.period_end) > new Date(data.period_start),
  {
    message: "Data de fim deve ser posterior à data de início",
    path: ["period_end"]
  }
);

export const supplierEvaluationSchema = z.object({
  id: z.string().uuid(),
  supplier_id: z.string().uuid(),
  
  // Evaluation Information
  evaluation_date: z.string().datetime(),
  evaluation_period_start: z.string().datetime(),
  evaluation_period_end: z.string().datetime(),
  evaluation_type: evaluationTypeSchema,
  
  // Scoring Criteria (1-10 scale)
  delivery_reliability: z.number()
    .min(1, 'Nota mínima é 1')
    .max(10, 'Nota máxima é 10'),
  product_quality: z.number()
    .min(1, 'Nota mínima é 1')
    .max(10, 'Nota máxima é 10'),
  customer_service: z.number()
    .min(1, 'Nota mínima é 1')
    .max(10, 'Nota máxima é 10'),
  pricing_competitiveness: z.number()
    .min(1, 'Nota mínima é 1')
    .max(10, 'Nota máxima é 10'),
  technical_support: z.number()
    .min(1, 'Nota mínima é 1')
    .max(10, 'Nota máxima é 10'),
  documentation_quality: z.number()
    .min(1, 'Nota mínima é 1')
    .max(10, 'Nota máxima é 10'),
  
  // Calculated Scores
  weighted_score: z.number().min(0).max(10),
  final_grade: performanceGradeSchema,
  
  // Qualitative Assessment
  strengths: z.string().max(2000).optional(),
  weaknesses: z.string().max(2000).optional(),
  improvement_recommendations: z.string().max(2000).optional(),
  action_items: z.string().max(2000).optional(),
  
  // Future Relationship
  renewal_recommendation: z.boolean().optional(),
  preferred_supplier_status: z.boolean().optional(),
  risk_level: riskLevelSchema.optional(),
  
  // Evaluator Information
  evaluated_by: z.string().uuid(),
  approved_by: z.string().uuid().optional(),
  approval_date: z.string().datetime().optional(),
  
  // Audit fields
  created_at: z.string().datetime(),
  updated_at: z.string().datetime()
}).refine(
  (data) => new Date(data.evaluation_period_end) > new Date(data.evaluation_period_start),
  {
    message: "Data de fim deve ser posterior à data de início",
    path: ["evaluation_period_end"]
  }
);

export const supplierCommunicationSchema = z.object({
  id: z.string().uuid(),
  supplier_id: z.string().uuid(),
  contact_id: z.string().uuid().optional(),
  
  // Communication Details
  communication_type: communicationTypeSchema,
  subject: z.string()
    .min(5, 'Assunto deve ter pelo menos 5 caracteres')
    .max(255, 'Assunto muito longo'),
  message_body: z.string().max(5000).optional(),
  
  // Communication Method
  method: communicationMethodSchema,
  direction: communicationDirectionSchema,
  
  // Status and Follow-up
  status: communicationStatusSchema.default('sent'),
  priority: priorityLevelSchema.default('medium'),
  requires_response: z.boolean().default(false),
  response_deadline: z.string().datetime().optional(),
  
  // Metadata
  communication_date: z.string().datetime(),
  handled_by: z.string().uuid().optional(),
  
  // Audit fields
  created_at: z.string().datetime(),
  updated_at: z.string().datetime()
});

export const supplierQualityIssueSchema = z.object({
  id: z.string().uuid(),
  supplier_id: z.string().uuid(),
  
  // Issue Information
  issue_date: z.string().datetime(),
  issue_type: qualityIssueTypeSchema,
  severity: severityLevelSchema,
  
  // Issue Details
  issue_description: z.string()
    .min(10, 'Descrição deve ter pelo menos 10 caracteres')
    .max(2000, 'Descrição muito longa'),
  affected_items: z.array(z.string()).optional(),
  quantity_affected: z.number().int().min(0).optional(),
  estimated_cost_impact: z.number().min(0).optional(),
  
  // Resolution
  resolution_required: z.boolean().default(true),
  resolution_description: z.string().max(2000).optional(),
  resolution_date: z.string().datetime().optional(),
  resolved_by: z.string().uuid().optional(),
  
  // Impact Assessment
  customer_impact: z.boolean().default(false),
  regulatory_impact: z.boolean().default(false),
  financial_impact: z.number().min(0).optional(),
  
  // Status
  status: issueStatusSchema.default('open'),
  
  // Follow-up
  follow_up_required: z.boolean().default(false),
  follow_up_date: z.string().datetime().optional(),
  
  // Audit fields
  reported_by: z.string().uuid(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime()
});

// =====================================================================================
// CREATE/UPDATE REQUEST SCHEMAS
// =====================================================================================

export const createSupplierSchema = z.object({
  supplier_name: z.string()
    .min(2, 'Nome do fornecedor deve ter pelo menos 2 caracteres')
    .max(255, 'Nome muito longo'),
  supplier_code: z.string()
    .min(2, 'Código deve ter pelo menos 2 caracteres')
    .max(50, 'Código muito longo'),
  business_registration: z.string().max(100).optional(),
  tax_id: z.string().max(50).optional(),
  
  // Contact Information
  primary_contact_name: z.string().max(255).optional(),
  primary_contact_email: z.string().email('Email inválido').optional(),
  primary_contact_phone: z.string().max(50).optional(),
  
  // Address Information
  address_line1: z.string().max(255).optional(),
  address_line2: z.string().max(255).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  postal_code: z.string().max(20).optional(),
  country: z.string().max(100).optional(),
  
  // Business Information
  supplier_type: supplierTypeSchema,
  category: z.array(z.string()).default([]),
  payment_terms: z.number().int().min(0).max(365).optional(),
  currency: z.string().length(3).optional(),
  
  // Status and Flags
  is_preferred: z.boolean().default(false),
  is_critical: z.boolean().default(false)
});

export const updateSupplierSchema = createSupplierSchema.partial().extend({
  performance_score: z.number().min(0).max(10).optional(),
  reliability_rating: supplierRatingSchema.optional(),
  quality_rating: supplierRatingSchema.optional(),
  delivery_rating: supplierRatingSchema.optional(),
  status: supplierStatusSchema.optional()
});

export const createContractSchema = z.object({
  supplier_id: z.string().uuid(),
  contract_number: z.string()
    .min(1, 'Número do contrato é obrigatório')
    .max(100, 'Número muito longo'),
  contract_type: contractTypeSchema,
  start_date: z.string().datetime(),
  end_date: z.string().datetime().optional(),
  auto_renewal: z.boolean().default(false),
  renewal_notice_days: z.number().int().min(1).max(365).optional(),
  payment_terms: z.number().int().min(0).max(365).optional(),
  early_payment_discount: z.number().min(0).max(100).optional(),
  late_payment_penalty: z.number().min(0).max(100).optional(),
  minimum_order_amount: z.number().min(0).optional(),
  volume_discount_tiers: z.array(volumeDiscountTierSchema).optional(),
  delivery_sla_days: z.number().int().min(1).max(365).optional(),
  quality_requirements: z.string().optional(),
  contract_value: z.number().min(0).optional(),
  currency: z.string().length(3).optional(),
  contract_document_url: z.string().url().optional(),
  signed_date: z.string().datetime().optional()
}).refine(
  (data) => !data.end_date || new Date(data.end_date) > new Date(data.start_date),
  {
    message: "Data de fim deve ser posterior à data de início",
    path: ["end_date"]
  }
);

export const createEvaluationSchema = z.object({
  supplier_id: z.string().uuid(),
  evaluation_period_start: z.string().datetime(),
  evaluation_period_end: z.string().datetime(),
  evaluation_type: evaluationTypeSchema,
  delivery_reliability: z.number()
    .min(1, 'Nota mínima é 1')
    .max(10, 'Nota máxima é 10'),
  product_quality: z.number()
    .min(1, 'Nota mínima é 1')
    .max(10, 'Nota máxima é 10'),
  customer_service: z.number()
    .min(1, 'Nota mínima é 1')
    .max(10, 'Nota máxima é 10'),
  pricing_competitiveness: z.number()
    .min(1, 'Nota mínima é 1')
    .max(10, 'Nota máxima é 10'),
  technical_support: z.number()
    .min(1, 'Nota mínima é 1')
    .max(10, 'Nota máxima é 10'),
  documentation_quality: z.number()
    .min(1, 'Nota mínima é 1')
    .max(10, 'Nota máxima é 10'),
  strengths: z.string().max(2000).optional(),
  weaknesses: z.string().max(2000).optional(),
  improvement_recommendations: z.string().max(2000).optional(),
  action_items: z.string().max(2000).optional(),
  renewal_recommendation: z.boolean().optional(),
  preferred_supplier_status: z.boolean().optional(),
  risk_level: riskLevelSchema.optional()
}).refine(
  (data) => new Date(data.evaluation_period_end) > new Date(data.evaluation_period_start),
  {
    message: "Data de fim deve ser posterior à data de início",
    path: ["evaluation_period_end"]
  }
);

export const createQualityIssueSchema = z.object({
  supplier_id: z.string().uuid(),
  issue_type: qualityIssueTypeSchema,
  severity: severityLevelSchema,
  issue_description: z.string()
    .min(10, 'Descrição deve ter pelo menos 10 caracteres')
    .max(2000, 'Descrição muito longa'),
  affected_items: z.array(z.string()).optional(),
  quantity_affected: z.number().int().min(0).optional(),
  estimated_cost_impact: z.number().min(0).optional(),
  customer_impact: z.boolean().default(false),
  regulatory_impact: z.boolean().default(false),
  financial_impact: z.number().min(0).optional()
});

export const createCommunicationSchema = z.object({
  supplier_id: z.string().uuid(),
  contact_id: z.string().uuid().optional(),
  communication_type: communicationTypeSchema,
  subject: z.string()
    .min(5, 'Assunto deve ter pelo menos 5 caracteres')
    .max(255, 'Assunto muito longo'),
  message_body: z.string().max(5000).optional(),
  method: communicationMethodSchema,
  direction: communicationDirectionSchema,
  priority: priorityLevelSchema.default('medium'),
  requires_response: z.boolean().default(false),
  response_deadline: z.string().datetime().optional()
});

export const createContactSchema = z.object({
  supplier_id: z.string().uuid(),
  contact_name: z.string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(255, 'Nome muito longo'),
  contact_title: z.string().max(100).optional(),
  department: z.string().max(100).optional(),
  email: z.string().email('Email inválido').optional(),
  phone: z.string().max(50).optional(),
  mobile: z.string().max(50).optional(),
  whatsapp: z.string().max(50).optional(),
  contact_type: contactTypeSchema,
  is_primary: z.boolean().default(false),
  preferred_contact_method: z.string().max(50).optional(),
  can_receive_orders: z.boolean().default(false),
  can_receive_invoices: z.boolean().default(false),
  can_receive_complaints: z.boolean().default(false),
  emergency_contact: z.boolean().default(false)
}).refine(
  (data) => data.email || data.phone || data.mobile,
  {
    message: "Pelo menos um método de contato deve ser fornecido",
    path: ["email"]
  }
);

// =====================================================================================
// FILTER SCHEMAS
// =====================================================================================

export const supplierFiltersSchema = z.object({
  supplier_type: z.array(supplierTypeSchema).optional(),
  status: z.array(supplierStatusSchema).optional(),
  is_preferred: z.boolean().optional(),
  is_critical: z.boolean().optional(),
  performance_score_min: z.number().min(0).max(10).optional(),
  performance_score_max: z.number().min(0).max(10).optional(),
  search: z.string().max(255).optional()
}).refine(
  (data) => {
    if (data.performance_score_min && data.performance_score_max) {
      return data.performance_score_min <= data.performance_score_max;
    }
    return true;
  },
  {
    message: "Score mínimo deve ser menor ou igual ao máximo",
    path: ["performance_score_min"]
  }
);

export const qualityIssueFiltersSchema = z.object({
  supplier_id: z.string().uuid().optional(),
  issue_type: z.array(qualityIssueTypeSchema).optional(),
  severity: z.array(severityLevelSchema).optional(),
  status: z.array(issueStatusSchema).optional(),
  date_from: z.string().datetime().optional(),
  date_to: z.string().datetime().optional(),
  has_financial_impact: z.boolean().optional(),
  has_customer_impact: z.boolean().optional(),
  requires_follow_up: z.boolean().optional()
}).refine(
  (data) => {
    if (data.date_from && data.date_to) {
      return new Date(data.date_from) <= new Date(data.date_to);
    }
    return true;
  },
  {
    message: "Data inicial deve ser anterior ou igual à data final",
    path: ["date_from"]
  }
);

// =====================================================================================
// BULK OPERATION SCHEMAS
// =====================================================================================

export const bulkUpdateSuppliersSchema = z.object({
  supplier_ids: z.array(z.string().uuid()).min(1, 'Pelo menos um fornecedor deve ser selecionado'),
  updates: z.object({
    status: supplierStatusSchema.optional(),
    is_preferred: z.boolean().optional(),
    is_critical: z.boolean().optional(),
    category: z.array(z.string()).optional(),
    payment_terms: z.number().int().min(0).max(365).optional()
  })
});

export const bulkCreateContactsSchema = z.object({
  supplier_id: z.string().uuid(),
  contacts: z.array(createContactSchema).min(1, 'Pelo menos um contato deve ser fornecido')
});

// =====================================================================================
// ANALYSIS AND REPORTING SCHEMAS
// =====================================================================================

export const performanceAnalysisSchema = z.object({
  supplier_ids: z.array(z.string().uuid()).optional(),
  period_start: z.string().datetime(),
  period_end: z.string().datetime(),
  include_financial_metrics: z.boolean().default(true),
  include_quality_metrics: z.boolean().default(true),
  include_delivery_metrics: z.boolean().default(true),
  group_by: z.enum(['supplier', 'category', 'type', 'month']).optional()
}).refine(
  (data) => new Date(data.period_end) > new Date(data.period_start),
  {
    message: "Data final deve ser posterior à data inicial",
    path: ["period_end"]
  }
);

export const supplierComparisonSchema = z.object({
  supplier_ids: z.array(z.string().uuid())
    .min(2, 'Pelo menos 2 fornecedores devem ser selecionados')
    .max(10, 'Máximo de 10 fornecedores por comparação'),
  comparison_criteria: z.array(z.string()).min(1, 'Pelo menos um critério deve ser selecionado'),
  period_start: z.string().datetime().optional(),
  period_end: z.string().datetime().optional()
});

// =====================================================================================
// EXPORT TYPES FOR USE IN COMPONENTS
// =====================================================================================

export type CreateSupplierInput = z.infer<typeof createSupplierSchema>;
export type UpdateSupplierInput = z.infer<typeof updateSupplierSchema>;
export type CreateContractInput = z.infer<typeof createContractSchema>;
export type CreateEvaluationInput = z.infer<typeof createEvaluationSchema>;
export type CreateQualityIssueInput = z.infer<typeof createQualityIssueSchema>;
export type CreateCommunicationInput = z.infer<typeof createCommunicationSchema>;
export type CreateContactInput = z.infer<typeof createContactSchema>;
export type SupplierFiltersInput = z.infer<typeof supplierFiltersSchema>;
export type QualityIssueFiltersInput = z.infer<typeof qualityIssueFiltersSchema>;
export type PerformanceAnalysisInput = z.infer<typeof performanceAnalysisSchema>;
export type SupplierComparisonInput = z.infer<typeof supplierComparisonSchema>;
