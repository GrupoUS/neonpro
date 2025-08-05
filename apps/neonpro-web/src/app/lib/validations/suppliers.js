"use strict";
// =====================================================================================
// SUPPLIER MANAGEMENT VALIDATION SCHEMAS
// Epic 6 - Story 6.3: Comprehensive supplier management with performance tracking
// =====================================================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.supplierComparisonSchema =
  exports.performanceAnalysisSchema =
  exports.bulkCreateContactsSchema =
  exports.bulkUpdateSuppliersSchema =
  exports.qualityIssueFiltersSchema =
  exports.supplierFiltersSchema =
  exports.createContactSchema =
  exports.createCommunicationSchema =
  exports.createQualityIssueSchema =
  exports.createEvaluationSchema =
  exports.createContractSchema =
  exports.updateSupplierSchema =
  exports.createSupplierSchema =
  exports.supplierQualityIssueSchema =
  exports.supplierCommunicationSchema =
  exports.supplierEvaluationSchema =
  exports.supplierPerformanceSchema =
  exports.supplierContactSchema =
  exports.supplierContractSchema =
  exports.supplierSchema =
  exports.volumeDiscountTierSchema =
  exports.issueStatusSchema =
  exports.severityLevelSchema =
  exports.qualityIssueTypeSchema =
  exports.priorityLevelSchema =
  exports.communicationStatusSchema =
  exports.communicationDirectionSchema =
  exports.communicationMethodSchema =
  exports.communicationTypeSchema =
  exports.riskLevelSchema =
  exports.performanceGradeSchema =
  exports.evaluationTypeSchema =
  exports.contactTypeSchema =
  exports.contractStatusSchema =
  exports.contractTypeSchema =
  exports.supplierStatusSchema =
  exports.supplierRatingSchema =
  exports.supplierTypeSchema =
    void 0;
var zod_1 = require("zod");
// =====================================================================================
// ENUM SCHEMAS
// =====================================================================================
exports.supplierTypeSchema = zod_1.z.enum([
  "medical_supplies",
  "pharmaceuticals",
  "equipment",
  "consumables",
  "services",
  "maintenance",
  "technology",
  "general",
]);
exports.supplierRatingSchema = zod_1.z.enum([
  "excellent",
  "good",
  "satisfactory",
  "needs_improvement",
  "poor",
  "not_rated",
]);
exports.supplierStatusSchema = zod_1.z.enum([
  "active",
  "inactive",
  "pending_approval",
  "suspended",
  "blacklisted",
]);
exports.contractTypeSchema = zod_1.z.enum([
  "general",
  "exclusive",
  "preferred",
  "volume_based",
  "seasonal",
  "emergency",
]);
exports.contractStatusSchema = zod_1.z.enum([
  "active",
  "expired",
  "pending_renewal",
  "terminated",
  "draft",
]);
exports.contactTypeSchema = zod_1.z.enum([
  "general",
  "sales",
  "technical",
  "billing",
  "customer_service",
  "emergency",
]);
exports.evaluationTypeSchema = zod_1.z.enum([
  "monthly",
  "quarterly",
  "semi_annual",
  "annual",
  "ad_hoc",
]);
exports.performanceGradeSchema = zod_1.z.enum(["A+", "A", "B+", "B", "C+", "C", "D", "F"]);
exports.riskLevelSchema = zod_1.z.enum(["low", "medium", "high", "critical"]);
exports.communicationTypeSchema = zod_1.z.enum([
  "order_inquiry",
  "delivery_issue",
  "quality_complaint",
  "payment_inquiry",
  "contract_negotiation",
  "general_inquiry",
  "emergency",
]);
exports.communicationMethodSchema = zod_1.z.enum([
  "email",
  "phone",
  "whatsapp",
  "video_call",
  "in_person",
  "portal",
]);
exports.communicationDirectionSchema = zod_1.z.enum(["outbound", "inbound"]);
exports.communicationStatusSchema = zod_1.z.enum([
  "sent",
  "delivered",
  "read",
  "responded",
  "failed",
]);
exports.priorityLevelSchema = zod_1.z.enum(["low", "medium", "high", "urgent"]);
exports.qualityIssueTypeSchema = zod_1.z.enum([
  "defective_product",
  "wrong_product",
  "missing_items",
  "damaged_packaging",
  "expired_product",
  "documentation_error",
  "compliance_issue",
]);
exports.severityLevelSchema = zod_1.z.enum(["low", "medium", "high", "critical"]);
exports.issueStatusSchema = zod_1.z.enum([
  "open",
  "in_progress",
  "resolved",
  "closed",
  "escalated",
]);
// =====================================================================================
// CORE VALIDATION SCHEMAS
// =====================================================================================
exports.volumeDiscountTierSchema = zod_1.z
  .object({
    min_quantity: zod_1.z.number().positive("Quantidade mínima deve ser positiva"),
    max_quantity: zod_1.z.number().positive().optional(),
    discount_percentage: zod_1.z.number().min(0).max(100, "Percentual deve estar entre 0 e 100"),
    description: zod_1.z.string().optional(),
  })
  .refine(
    function (data) {
      return !data.max_quantity || data.max_quantity > data.min_quantity;
    },
    {
      message: "Quantidade máxima deve ser maior que a mínima",
      path: ["max_quantity"],
    },
  );
exports.supplierSchema = zod_1.z.object({
  id: zod_1.z.string().uuid(),
  clinic_id: zod_1.z.string().uuid(),
  // Basic Information
  supplier_name: zod_1.z
    .string()
    .min(2, "Nome do fornecedor deve ter pelo menos 2 caracteres")
    .max(255, "Nome muito longo"),
  supplier_code: zod_1.z
    .string()
    .min(2, "Código deve ter pelo menos 2 caracteres")
    .max(50, "Código muito longo"),
  business_registration: zod_1.z.string().max(100).optional(),
  tax_id: zod_1.z.string().max(50).optional(),
  // Contact Information
  primary_contact_name: zod_1.z.string().max(255).optional(),
  primary_contact_email: zod_1.z.string().email("Email inválido").optional(),
  primary_contact_phone: zod_1.z.string().max(50).optional(),
  // Address Information
  address_line1: zod_1.z.string().max(255).optional(),
  address_line2: zod_1.z.string().max(255).optional(),
  city: zod_1.z.string().max(100).optional(),
  state: zod_1.z.string().max(100).optional(),
  postal_code: zod_1.z.string().max(20).optional(),
  country: zod_1.z.string().max(100).optional(),
  // Business Information
  supplier_type: exports.supplierTypeSchema,
  category: zod_1.z.array(zod_1.z.string()).default([]),
  payment_terms: zod_1.z.number().int().min(0).max(365).optional(),
  currency: zod_1.z.string().length(3).optional(),
  // Performance Metrics
  performance_score: zod_1.z.number().min(0).max(10).optional(),
  reliability_rating: exports.supplierRatingSchema.optional(),
  quality_rating: exports.supplierRatingSchema.optional(),
  delivery_rating: exports.supplierRatingSchema.optional(),
  // Status and Flags
  status: exports.supplierStatusSchema.default("active"),
  is_preferred: zod_1.z.boolean().default(false),
  is_critical: zod_1.z.boolean().default(false),
  // Audit fields
  created_by: zod_1.z.string().uuid().optional(),
  created_at: zod_1.z.string().datetime(),
  updated_at: zod_1.z.string().datetime(),
});
exports.supplierContractSchema = zod_1.z
  .object({
    id: zod_1.z.string().uuid(),
    supplier_id: zod_1.z.string().uuid(),
    // Contract Information
    contract_number: zod_1.z
      .string()
      .min(1, "Número do contrato é obrigatório")
      .max(100, "Número muito longo"),
    contract_type: exports.contractTypeSchema,
    // Terms and Conditions
    start_date: zod_1.z.string().datetime(),
    end_date: zod_1.z.string().datetime().optional(),
    auto_renewal: zod_1.z.boolean().default(false),
    renewal_notice_days: zod_1.z.number().int().min(1).max(365).optional(),
    // Pricing and Payment
    payment_terms: zod_1.z.number().int().min(0).max(365).optional(),
    early_payment_discount: zod_1.z.number().min(0).max(100).optional(),
    late_payment_penalty: zod_1.z.number().min(0).max(100).optional(),
    minimum_order_amount: zod_1.z.number().min(0).optional(),
    volume_discount_tiers: zod_1.z.array(exports.volumeDiscountTierSchema).optional(),
    // Performance Clauses
    delivery_sla_days: zod_1.z.number().int().min(1).max(365).optional(),
    quality_requirements: zod_1.z.string().optional(),
    performance_penalties: zod_1.z.record(zod_1.z.any()).optional(),
    // Status and Metadata
    status: exports.contractStatusSchema.default("draft"),
    contract_value: zod_1.z.number().min(0).optional(),
    currency: zod_1.z.string().length(3).optional(),
    // Document Management
    contract_document_url: zod_1.z.string().url().optional(),
    signed_date: zod_1.z.string().datetime().optional(),
    // Audit fields
    created_by: zod_1.z.string().uuid().optional(),
    created_at: zod_1.z.string().datetime(),
    updated_at: zod_1.z.string().datetime(),
  })
  .refine(
    function (data) {
      return !data.end_date || new Date(data.end_date) > new Date(data.start_date);
    },
    {
      message: "Data de fim deve ser posterior à data de início",
      path: ["end_date"],
    },
  );
exports.supplierContactSchema = zod_1.z
  .object({
    id: zod_1.z.string().uuid(),
    supplier_id: zod_1.z.string().uuid(),
    // Contact Information
    contact_name: zod_1.z
      .string()
      .min(2, "Nome deve ter pelo menos 2 caracteres")
      .max(255, "Nome muito longo"),
    contact_title: zod_1.z.string().max(100).optional(),
    department: zod_1.z.string().max(100).optional(),
    // Contact Methods
    email: zod_1.z.string().email("Email inválido").optional(),
    phone: zod_1.z.string().max(50).optional(),
    mobile: zod_1.z.string().max(50).optional(),
    whatsapp: zod_1.z.string().max(50).optional(),
    // Contact Type and Preferences
    contact_type: exports.contactTypeSchema,
    is_primary: zod_1.z.boolean().default(false),
    preferred_contact_method: zod_1.z.string().max(50).optional(),
    // Communication Preferences
    can_receive_orders: zod_1.z.boolean().default(false),
    can_receive_invoices: zod_1.z.boolean().default(false),
    can_receive_complaints: zod_1.z.boolean().default(false),
    emergency_contact: zod_1.z.boolean().default(false),
    // Status
    is_active: zod_1.z.boolean().default(true),
    // Audit fields
    created_at: zod_1.z.string().datetime(),
    updated_at: zod_1.z.string().datetime(),
  })
  .refine(
    function (data) {
      return data.email || data.phone || data.mobile;
    },
    {
      message: "Pelo menos um método de contato deve ser fornecido",
      path: ["email"],
    },
  );
exports.supplierPerformanceSchema = zod_1.z
  .object({
    id: zod_1.z.string().uuid(),
    supplier_id: zod_1.z.string().uuid(),
    // Time Period
    period_start: zod_1.z.string().datetime(),
    period_end: zod_1.z.string().datetime(),
    evaluation_type: exports.evaluationTypeSchema,
    // Delivery Performance
    total_orders: zod_1.z.number().int().min(0).optional(),
    on_time_deliveries: zod_1.z.number().int().min(0).optional(),
    late_deliveries: zod_1.z.number().int().min(0).optional(),
    avg_delivery_days: zod_1.z.number().min(0).optional(),
    delivery_performance_score: zod_1.z.number().min(0).max(10).optional(),
    // Quality Performance
    total_items_received: zod_1.z.number().int().min(0).optional(),
    defective_items: zod_1.z.number().int().min(0).optional(),
    returned_items: zod_1.z.number().int().min(0).optional(),
    quality_score: zod_1.z.number().min(0).max(10).optional(),
    // Financial Performance
    total_order_value: zod_1.z.number().min(0).optional(),
    total_invoiced: zod_1.z.number().min(0).optional(),
    total_paid: zod_1.z.number().min(0).optional(),
    avg_payment_delay_days: zod_1.z.number().min(0).optional(),
    cost_savings: zod_1.z.number().optional(),
    // Communication and Service
    response_time_hours: zod_1.z.number().min(0).optional(),
    communication_rating: zod_1.z.number().min(0).max(10).optional(),
    issue_resolution_days: zod_1.z.number().min(0).optional(),
    // Overall Performance
    overall_score: zod_1.z.number().min(0).max(10).optional(),
    performance_grade: exports.performanceGradeSchema.optional(),
    // Metadata
    calculated_at: zod_1.z.string().datetime(),
    calculated_by: zod_1.z.string().uuid().optional(),
  })
  .refine(
    function (data) {
      return new Date(data.period_end) > new Date(data.period_start);
    },
    {
      message: "Data de fim deve ser posterior à data de início",
      path: ["period_end"],
    },
  );
exports.supplierEvaluationSchema = zod_1.z
  .object({
    id: zod_1.z.string().uuid(),
    supplier_id: zod_1.z.string().uuid(),
    // Evaluation Information
    evaluation_date: zod_1.z.string().datetime(),
    evaluation_period_start: zod_1.z.string().datetime(),
    evaluation_period_end: zod_1.z.string().datetime(),
    evaluation_type: exports.evaluationTypeSchema,
    // Scoring Criteria (1-10 scale)
    delivery_reliability: zod_1.z.number().min(1, "Nota mínima é 1").max(10, "Nota máxima é 10"),
    product_quality: zod_1.z.number().min(1, "Nota mínima é 1").max(10, "Nota máxima é 10"),
    customer_service: zod_1.z.number().min(1, "Nota mínima é 1").max(10, "Nota máxima é 10"),
    pricing_competitiveness: zod_1.z.number().min(1, "Nota mínima é 1").max(10, "Nota máxima é 10"),
    technical_support: zod_1.z.number().min(1, "Nota mínima é 1").max(10, "Nota máxima é 10"),
    documentation_quality: zod_1.z.number().min(1, "Nota mínima é 1").max(10, "Nota máxima é 10"),
    // Calculated Scores
    weighted_score: zod_1.z.number().min(0).max(10),
    final_grade: exports.performanceGradeSchema,
    // Qualitative Assessment
    strengths: zod_1.z.string().max(2000).optional(),
    weaknesses: zod_1.z.string().max(2000).optional(),
    improvement_recommendations: zod_1.z.string().max(2000).optional(),
    action_items: zod_1.z.string().max(2000).optional(),
    // Future Relationship
    renewal_recommendation: zod_1.z.boolean().optional(),
    preferred_supplier_status: zod_1.z.boolean().optional(),
    risk_level: exports.riskLevelSchema.optional(),
    // Evaluator Information
    evaluated_by: zod_1.z.string().uuid(),
    approved_by: zod_1.z.string().uuid().optional(),
    approval_date: zod_1.z.string().datetime().optional(),
    // Audit fields
    created_at: zod_1.z.string().datetime(),
    updated_at: zod_1.z.string().datetime(),
  })
  .refine(
    function (data) {
      return new Date(data.evaluation_period_end) > new Date(data.evaluation_period_start);
    },
    {
      message: "Data de fim deve ser posterior à data de início",
      path: ["evaluation_period_end"],
    },
  );
exports.supplierCommunicationSchema = zod_1.z.object({
  id: zod_1.z.string().uuid(),
  supplier_id: zod_1.z.string().uuid(),
  contact_id: zod_1.z.string().uuid().optional(),
  // Communication Details
  communication_type: exports.communicationTypeSchema,
  subject: zod_1.z
    .string()
    .min(5, "Assunto deve ter pelo menos 5 caracteres")
    .max(255, "Assunto muito longo"),
  message_body: zod_1.z.string().max(5000).optional(),
  // Communication Method
  method: exports.communicationMethodSchema,
  direction: exports.communicationDirectionSchema,
  // Status and Follow-up
  status: exports.communicationStatusSchema.default("sent"),
  priority: exports.priorityLevelSchema.default("medium"),
  requires_response: zod_1.z.boolean().default(false),
  response_deadline: zod_1.z.string().datetime().optional(),
  // Metadata
  communication_date: zod_1.z.string().datetime(),
  handled_by: zod_1.z.string().uuid().optional(),
  // Audit fields
  created_at: zod_1.z.string().datetime(),
  updated_at: zod_1.z.string().datetime(),
});
exports.supplierQualityIssueSchema = zod_1.z.object({
  id: zod_1.z.string().uuid(),
  supplier_id: zod_1.z.string().uuid(),
  // Issue Information
  issue_date: zod_1.z.string().datetime(),
  issue_type: exports.qualityIssueTypeSchema,
  severity: exports.severityLevelSchema,
  // Issue Details
  issue_description: zod_1.z
    .string()
    .min(10, "Descrição deve ter pelo menos 10 caracteres")
    .max(2000, "Descrição muito longa"),
  affected_items: zod_1.z.array(zod_1.z.string()).optional(),
  quantity_affected: zod_1.z.number().int().min(0).optional(),
  estimated_cost_impact: zod_1.z.number().min(0).optional(),
  // Resolution
  resolution_required: zod_1.z.boolean().default(true),
  resolution_description: zod_1.z.string().max(2000).optional(),
  resolution_date: zod_1.z.string().datetime().optional(),
  resolved_by: zod_1.z.string().uuid().optional(),
  // Impact Assessment
  customer_impact: zod_1.z.boolean().default(false),
  regulatory_impact: zod_1.z.boolean().default(false),
  financial_impact: zod_1.z.number().min(0).optional(),
  // Status
  status: exports.issueStatusSchema.default("open"),
  // Follow-up
  follow_up_required: zod_1.z.boolean().default(false),
  follow_up_date: zod_1.z.string().datetime().optional(),
  // Audit fields
  reported_by: zod_1.z.string().uuid(),
  created_at: zod_1.z.string().datetime(),
  updated_at: zod_1.z.string().datetime(),
});
// =====================================================================================
// CREATE/UPDATE REQUEST SCHEMAS
// =====================================================================================
exports.createSupplierSchema = zod_1.z.object({
  supplier_name: zod_1.z
    .string()
    .min(2, "Nome do fornecedor deve ter pelo menos 2 caracteres")
    .max(255, "Nome muito longo"),
  supplier_code: zod_1.z
    .string()
    .min(2, "Código deve ter pelo menos 2 caracteres")
    .max(50, "Código muito longo"),
  business_registration: zod_1.z.string().max(100).optional(),
  tax_id: zod_1.z.string().max(50).optional(),
  // Contact Information
  primary_contact_name: zod_1.z.string().max(255).optional(),
  primary_contact_email: zod_1.z.string().email("Email inválido").optional(),
  primary_contact_phone: zod_1.z.string().max(50).optional(),
  // Address Information
  address_line1: zod_1.z.string().max(255).optional(),
  address_line2: zod_1.z.string().max(255).optional(),
  city: zod_1.z.string().max(100).optional(),
  state: zod_1.z.string().max(100).optional(),
  postal_code: zod_1.z.string().max(20).optional(),
  country: zod_1.z.string().max(100).optional(),
  // Business Information
  supplier_type: exports.supplierTypeSchema,
  category: zod_1.z.array(zod_1.z.string()).default([]),
  payment_terms: zod_1.z.number().int().min(0).max(365).optional(),
  currency: zod_1.z.string().length(3).optional(),
  // Status and Flags
  is_preferred: zod_1.z.boolean().default(false),
  is_critical: zod_1.z.boolean().default(false),
});
exports.updateSupplierSchema = exports.createSupplierSchema.partial().extend({
  performance_score: zod_1.z.number().min(0).max(10).optional(),
  reliability_rating: exports.supplierRatingSchema.optional(),
  quality_rating: exports.supplierRatingSchema.optional(),
  delivery_rating: exports.supplierRatingSchema.optional(),
  status: exports.supplierStatusSchema.optional(),
});
exports.createContractSchema = zod_1.z
  .object({
    supplier_id: zod_1.z.string().uuid(),
    contract_number: zod_1.z
      .string()
      .min(1, "Número do contrato é obrigatório")
      .max(100, "Número muito longo"),
    contract_type: exports.contractTypeSchema,
    start_date: zod_1.z.string().datetime(),
    end_date: zod_1.z.string().datetime().optional(),
    auto_renewal: zod_1.z.boolean().default(false),
    renewal_notice_days: zod_1.z.number().int().min(1).max(365).optional(),
    payment_terms: zod_1.z.number().int().min(0).max(365).optional(),
    early_payment_discount: zod_1.z.number().min(0).max(100).optional(),
    late_payment_penalty: zod_1.z.number().min(0).max(100).optional(),
    minimum_order_amount: zod_1.z.number().min(0).optional(),
    volume_discount_tiers: zod_1.z.array(exports.volumeDiscountTierSchema).optional(),
    delivery_sla_days: zod_1.z.number().int().min(1).max(365).optional(),
    quality_requirements: zod_1.z.string().optional(),
    contract_value: zod_1.z.number().min(0).optional(),
    currency: zod_1.z.string().length(3).optional(),
    contract_document_url: zod_1.z.string().url().optional(),
    signed_date: zod_1.z.string().datetime().optional(),
  })
  .refine(
    function (data) {
      return !data.end_date || new Date(data.end_date) > new Date(data.start_date);
    },
    {
      message: "Data de fim deve ser posterior à data de início",
      path: ["end_date"],
    },
  );
exports.createEvaluationSchema = zod_1.z
  .object({
    supplier_id: zod_1.z.string().uuid(),
    evaluation_period_start: zod_1.z.string().datetime(),
    evaluation_period_end: zod_1.z.string().datetime(),
    evaluation_type: exports.evaluationTypeSchema,
    delivery_reliability: zod_1.z.number().min(1, "Nota mínima é 1").max(10, "Nota máxima é 10"),
    product_quality: zod_1.z.number().min(1, "Nota mínima é 1").max(10, "Nota máxima é 10"),
    customer_service: zod_1.z.number().min(1, "Nota mínima é 1").max(10, "Nota máxima é 10"),
    pricing_competitiveness: zod_1.z.number().min(1, "Nota mínima é 1").max(10, "Nota máxima é 10"),
    technical_support: zod_1.z.number().min(1, "Nota mínima é 1").max(10, "Nota máxima é 10"),
    documentation_quality: zod_1.z.number().min(1, "Nota mínima é 1").max(10, "Nota máxima é 10"),
    strengths: zod_1.z.string().max(2000).optional(),
    weaknesses: zod_1.z.string().max(2000).optional(),
    improvement_recommendations: zod_1.z.string().max(2000).optional(),
    action_items: zod_1.z.string().max(2000).optional(),
    renewal_recommendation: zod_1.z.boolean().optional(),
    preferred_supplier_status: zod_1.z.boolean().optional(),
    risk_level: exports.riskLevelSchema.optional(),
  })
  .refine(
    function (data) {
      return new Date(data.evaluation_period_end) > new Date(data.evaluation_period_start);
    },
    {
      message: "Data de fim deve ser posterior à data de início",
      path: ["evaluation_period_end"],
    },
  );
exports.createQualityIssueSchema = zod_1.z.object({
  supplier_id: zod_1.z.string().uuid(),
  issue_type: exports.qualityIssueTypeSchema,
  severity: exports.severityLevelSchema,
  issue_description: zod_1.z
    .string()
    .min(10, "Descrição deve ter pelo menos 10 caracteres")
    .max(2000, "Descrição muito longa"),
  affected_items: zod_1.z.array(zod_1.z.string()).optional(),
  quantity_affected: zod_1.z.number().int().min(0).optional(),
  estimated_cost_impact: zod_1.z.number().min(0).optional(),
  customer_impact: zod_1.z.boolean().default(false),
  regulatory_impact: zod_1.z.boolean().default(false),
  financial_impact: zod_1.z.number().min(0).optional(),
});
exports.createCommunicationSchema = zod_1.z.object({
  supplier_id: zod_1.z.string().uuid(),
  contact_id: zod_1.z.string().uuid().optional(),
  communication_type: exports.communicationTypeSchema,
  subject: zod_1.z
    .string()
    .min(5, "Assunto deve ter pelo menos 5 caracteres")
    .max(255, "Assunto muito longo"),
  message_body: zod_1.z.string().max(5000).optional(),
  method: exports.communicationMethodSchema,
  direction: exports.communicationDirectionSchema,
  priority: exports.priorityLevelSchema.default("medium"),
  requires_response: zod_1.z.boolean().default(false),
  response_deadline: zod_1.z.string().datetime().optional(),
});
exports.createContactSchema = zod_1.z
  .object({
    supplier_id: zod_1.z.string().uuid(),
    contact_name: zod_1.z
      .string()
      .min(2, "Nome deve ter pelo menos 2 caracteres")
      .max(255, "Nome muito longo"),
    contact_title: zod_1.z.string().max(100).optional(),
    department: zod_1.z.string().max(100).optional(),
    email: zod_1.z.string().email("Email inválido").optional(),
    phone: zod_1.z.string().max(50).optional(),
    mobile: zod_1.z.string().max(50).optional(),
    whatsapp: zod_1.z.string().max(50).optional(),
    contact_type: exports.contactTypeSchema,
    is_primary: zod_1.z.boolean().default(false),
    preferred_contact_method: zod_1.z.string().max(50).optional(),
    can_receive_orders: zod_1.z.boolean().default(false),
    can_receive_invoices: zod_1.z.boolean().default(false),
    can_receive_complaints: zod_1.z.boolean().default(false),
    emergency_contact: zod_1.z.boolean().default(false),
  })
  .refine(
    function (data) {
      return data.email || data.phone || data.mobile;
    },
    {
      message: "Pelo menos um método de contato deve ser fornecido",
      path: ["email"],
    },
  );
// =====================================================================================
// FILTER SCHEMAS
// =====================================================================================
exports.supplierFiltersSchema = zod_1.z
  .object({
    supplier_type: zod_1.z.array(exports.supplierTypeSchema).optional(),
    status: zod_1.z.array(exports.supplierStatusSchema).optional(),
    is_preferred: zod_1.z.boolean().optional(),
    is_critical: zod_1.z.boolean().optional(),
    performance_score_min: zod_1.z.number().min(0).max(10).optional(),
    performance_score_max: zod_1.z.number().min(0).max(10).optional(),
    search: zod_1.z.string().max(255).optional(),
  })
  .refine(
    function (data) {
      if (data.performance_score_min && data.performance_score_max) {
        return data.performance_score_min <= data.performance_score_max;
      }
      return true;
    },
    {
      message: "Score mínimo deve ser menor ou igual ao máximo",
      path: ["performance_score_min"],
    },
  );
exports.qualityIssueFiltersSchema = zod_1.z
  .object({
    supplier_id: zod_1.z.string().uuid().optional(),
    issue_type: zod_1.z.array(exports.qualityIssueTypeSchema).optional(),
    severity: zod_1.z.array(exports.severityLevelSchema).optional(),
    status: zod_1.z.array(exports.issueStatusSchema).optional(),
    date_from: zod_1.z.string().datetime().optional(),
    date_to: zod_1.z.string().datetime().optional(),
    has_financial_impact: zod_1.z.boolean().optional(),
    has_customer_impact: zod_1.z.boolean().optional(),
    requires_follow_up: zod_1.z.boolean().optional(),
  })
  .refine(
    function (data) {
      if (data.date_from && data.date_to) {
        return new Date(data.date_from) <= new Date(data.date_to);
      }
      return true;
    },
    {
      message: "Data inicial deve ser anterior ou igual à data final",
      path: ["date_from"],
    },
  );
// =====================================================================================
// BULK OPERATION SCHEMAS
// =====================================================================================
exports.bulkUpdateSuppliersSchema = zod_1.z.object({
  supplier_ids: zod_1.z
    .array(zod_1.z.string().uuid())
    .min(1, "Pelo menos um fornecedor deve ser selecionado"),
  updates: zod_1.z.object({
    status: exports.supplierStatusSchema.optional(),
    is_preferred: zod_1.z.boolean().optional(),
    is_critical: zod_1.z.boolean().optional(),
    category: zod_1.z.array(zod_1.z.string()).optional(),
    payment_terms: zod_1.z.number().int().min(0).max(365).optional(),
  }),
});
exports.bulkCreateContactsSchema = zod_1.z.object({
  supplier_id: zod_1.z.string().uuid(),
  contacts: zod_1.z
    .array(exports.createContactSchema)
    .min(1, "Pelo menos um contato deve ser fornecido"),
});
// =====================================================================================
// ANALYSIS AND REPORTING SCHEMAS
// =====================================================================================
exports.performanceAnalysisSchema = zod_1.z
  .object({
    supplier_ids: zod_1.z.array(zod_1.z.string().uuid()).optional(),
    period_start: zod_1.z.string().datetime(),
    period_end: zod_1.z.string().datetime(),
    include_financial_metrics: zod_1.z.boolean().default(true),
    include_quality_metrics: zod_1.z.boolean().default(true),
    include_delivery_metrics: zod_1.z.boolean().default(true),
    group_by: zod_1.z.enum(["supplier", "category", "type", "month"]).optional(),
  })
  .refine(
    function (data) {
      return new Date(data.period_end) > new Date(data.period_start);
    },
    {
      message: "Data final deve ser posterior à data inicial",
      path: ["period_end"],
    },
  );
exports.supplierComparisonSchema = zod_1.z.object({
  supplier_ids: zod_1.z
    .array(zod_1.z.string().uuid())
    .min(2, "Pelo menos 2 fornecedores devem ser selecionados")
    .max(10, "Máximo de 10 fornecedores por comparação"),
  comparison_criteria: zod_1.z
    .array(zod_1.z.string())
    .min(1, "Pelo menos um critério deve ser selecionado"),
  period_start: zod_1.z.string().datetime().optional(),
  period_end: zod_1.z.string().datetime().optional(),
});
