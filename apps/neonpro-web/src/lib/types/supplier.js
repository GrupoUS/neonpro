"use strict";
// ============================================================================
// Supplier Management Types - Epic 6, Story 6.3
// ============================================================================
// Comprehensive TypeScript types for supplier management, performance tracking,
// and quality assurance system for NeonPro clinic management
// ============================================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupplierSchemas = exports.QualityIssueSchema = exports.ProcurementRequestSchema = exports.SupplierSchema = exports.CertificationSchema = exports.AddressSchema = exports.ContactInfoSchema = exports.IssueStatus = exports.QualityIssueType = exports.RiskLevel = exports.PerformanceMetric = exports.PaymentTerms = exports.ContractType = exports.SupplierCategory = exports.SupplierStatus = void 0;
var zod_1 = require("zod");
// ============================================================================
// ENUMS
// ============================================================================
var SupplierStatus;
(function (SupplierStatus) {
    SupplierStatus["ACTIVE"] = "active";
    SupplierStatus["INACTIVE"] = "inactive";
    SupplierStatus["SUSPENDED"] = "suspended";
    SupplierStatus["PENDING_VERIFICATION"] = "pending_verification";
    SupplierStatus["BLOCKED"] = "blocked";
})(SupplierStatus || (exports.SupplierStatus = SupplierStatus = {}));
var SupplierCategory;
(function (SupplierCategory) {
    SupplierCategory["MEDICAL_EQUIPMENT"] = "medical_equipment";
    SupplierCategory["AESTHETIC_SUPPLIES"] = "aesthetic_supplies";
    SupplierCategory["PHARMACEUTICALS"] = "pharmaceuticals";
    SupplierCategory["CONSUMABLES"] = "consumables";
    SupplierCategory["TECHNOLOGY"] = "technology";
    SupplierCategory["SERVICES"] = "services";
    SupplierCategory["MAINTENANCE"] = "maintenance";
    SupplierCategory["OFFICE_SUPPLIES"] = "office_supplies";
})(SupplierCategory || (exports.SupplierCategory = SupplierCategory = {}));
var ContractType;
(function (ContractType) {
    ContractType["FIXED_TERM"] = "fixed_term";
    ContractType["INDEFINITE"] = "indefinite";
    ContractType["PROJECT_BASED"] = "project_based";
    ContractType["FRAMEWORK"] = "framework";
    ContractType["SPOT_PURCHASE"] = "spot_purchase";
})(ContractType || (exports.ContractType = ContractType = {}));
var PaymentTerms;
(function (PaymentTerms) {
    PaymentTerms["NET_7"] = "net_7";
    PaymentTerms["NET_15"] = "net_15";
    PaymentTerms["NET_30"] = "net_30";
    PaymentTerms["NET_45"] = "net_45";
    PaymentTerms["NET_60"] = "net_60";
    PaymentTerms["IMMEDIATE"] = "immediate";
    PaymentTerms["ADVANCE"] = "advance";
    PaymentTerms["COD"] = "cod";
})(PaymentTerms || (exports.PaymentTerms = PaymentTerms = {}));
var PerformanceMetric;
(function (PerformanceMetric) {
    PerformanceMetric["DELIVERY_TIME"] = "delivery_time";
    PerformanceMetric["QUALITY_SCORE"] = "quality_score";
    PerformanceMetric["PRICING_COMPETITIVENESS"] = "pricing_competitiveness";
    PerformanceMetric["SERVICE_QUALITY"] = "service_quality";
    PerformanceMetric["COMMUNICATION"] = "communication";
    PerformanceMetric["COMPLIANCE"] = "compliance";
    PerformanceMetric["INNOVATION"] = "innovation";
    PerformanceMetric["SUSTAINABILITY"] = "sustainability";
})(PerformanceMetric || (exports.PerformanceMetric = PerformanceMetric = {}));
var RiskLevel;
(function (RiskLevel) {
    RiskLevel["LOW"] = "low";
    RiskLevel["MEDIUM"] = "medium";
    RiskLevel["HIGH"] = "high";
    RiskLevel["CRITICAL"] = "critical";
})(RiskLevel || (exports.RiskLevel = RiskLevel = {}));
var QualityIssueType;
(function (QualityIssueType) {
    QualityIssueType["DEFECTIVE_PRODUCT"] = "defective_product";
    QualityIssueType["WRONG_SPECIFICATION"] = "wrong_specification";
    QualityIssueType["PACKAGING_DAMAGE"] = "packaging_damage";
    QualityIssueType["CONTAMINATION"] = "contamination";
    QualityIssueType["EXPIRY_ISSUES"] = "expiry_issues";
    QualityIssueType["DOCUMENTATION_ERROR"] = "documentation_error";
    QualityIssueType["REGULATORY_NON_COMPLIANCE"] = "regulatory_non_compliance";
})(QualityIssueType || (exports.QualityIssueType = QualityIssueType = {}));
var IssueStatus;
(function (IssueStatus) {
    IssueStatus["OPEN"] = "open";
    IssueStatus["IN_PROGRESS"] = "in_progress";
    IssueStatus["RESOLVED"] = "resolved";
    IssueStatus["ESCALATED"] = "escalated";
    IssueStatus["CLOSED"] = "closed";
})(IssueStatus || (exports.IssueStatus = IssueStatus = {}));
// ============================================================================
// ZOD VALIDATION SCHEMAS
// ============================================================================
// Contact Information Schema
exports.ContactInfoSchema = zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string().min(1, 'Nome é obrigatório'),
    title: zod_1.z.string().optional(),
    email: zod_1.z.string().email('Email inválido'),
    phone: zod_1.z.string().min(10, 'Telefone deve ter pelo menos 10 dígitos'),
    mobile: zod_1.z.string().optional(),
    department: zod_1.z.string().optional(),
    is_primary: zod_1.z.boolean(),
    preferred_contact_method: zod_1.z.enum(['email', 'phone', 'whatsapp'])
});
// Address Schema
exports.AddressSchema = zod_1.z.object({
    street: zod_1.z.string().min(1, 'Rua é obrigatória'),
    number: zod_1.z.string().min(1, 'Número é obrigatório'),
    complement: zod_1.z.string().optional(),
    neighborhood: zod_1.z.string().min(1, 'Bairro é obrigatório'),
    city: zod_1.z.string().min(1, 'Cidade é obrigatória'),
    state: zod_1.z.string().min(2, 'Estado é obrigatório'),
    postal_code: zod_1.z.string().regex(/^\d{5}-?\d{3}$/, 'CEP inválido'),
    country: zod_1.z.string().default('Brasil')
});
// Certification Schema
exports.CertificationSchema = zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string().min(1, 'Nome da certificação é obrigatório'),
    issuing_authority: zod_1.z.string().min(1, 'Autoridade emissora é obrigatória'),
    certificate_number: zod_1.z.string().min(1, 'Número do certificado é obrigatório'),
    issue_date: zod_1.z.string(),
    expiry_date: zod_1.z.string().optional(),
    document_url: zod_1.z.string().url().optional(),
    verification_status: zod_1.z.enum(['verified', 'pending', 'expired', 'invalid'])
});
// Supplier Schema
exports.SupplierSchema = zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string().min(1, 'Nome do fornecedor é obrigatório'),
    legal_name: zod_1.z.string().min(1, 'Razão social é obrigatória'),
    cnpj: zod_1.z.string().regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, 'CNPJ inválido').optional(),
    cpf: zod_1.z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'CPF inválido').optional(),
    category: zod_1.z.nativeEnum(SupplierCategory),
    subcategories: zod_1.z.array(zod_1.z.string()),
    status: zod_1.z.nativeEnum(SupplierStatus),
    primary_contact: exports.ContactInfoSchema,
    secondary_contacts: zod_1.z.array(exports.ContactInfoSchema),
    website: zod_1.z.string().url().optional(),
    registration_number: zod_1.z.string().optional(),
    tax_id: zod_1.z.string().optional(),
    address: exports.AddressSchema,
    billing_address: exports.AddressSchema.optional(),
    performance_score: zod_1.z.number().min(0).max(100),
    quality_rating: zod_1.z.number().min(1).max(5),
    reliability_score: zod_1.z.number().min(0).max(100),
    cost_competitiveness: zod_1.z.number().min(0).max(100),
    credit_rating: zod_1.z.string().optional(),
    payment_terms: zod_1.z.nativeEnum(PaymentTerms),
    currency: zod_1.z.string().default('BRL'),
    early_payment_discount: zod_1.z.number().min(0).max(100).optional(),
    risk_level: zod_1.z.nativeEnum(RiskLevel),
    risk_factors: zod_1.z.array(zod_1.z.string()),
    certifications: zod_1.z.array(exports.CertificationSchema),
    regulatory_compliance: zod_1.z.boolean(),
    anvisa_registration: zod_1.z.string().optional(),
    created_at: zod_1.z.string(),
    updated_at: zod_1.z.string(),
    created_by: zod_1.z.string(),
    last_reviewed_at: zod_1.z.string().optional(),
    next_review_date: zod_1.z.string().optional(),
    clinic_id: zod_1.z.string(),
    tags: zod_1.z.array(zod_1.z.string()),
    notes: zod_1.z.string().optional()
});
// Procurement Request Schema
exports.ProcurementRequestSchema = zod_1.z.object({
    id: zod_1.z.string(),
    request_number: zod_1.z.string(),
    title: zod_1.z.string().min(1, 'Título é obrigatório'),
    description: zod_1.z.string().min(1, 'Descrição é obrigatória'),
    category: zod_1.z.nativeEnum(SupplierCategory),
    status: zod_1.z.enum(['draft', 'published', 'bidding', 'evaluation', 'awarded', 'cancelled']),
    request_type: zod_1.z.enum(['rfq', 'rfp', 'tender', 'quote']),
    submission_deadline: zod_1.z.string(),
    evaluation_period: zod_1.z.string(),
    invited_suppliers: zod_1.z.array(zod_1.z.string()),
    public_tender: zod_1.z.boolean(),
    created_at: zod_1.z.string(),
    created_by: zod_1.z.string(),
    clinic_id: zod_1.z.string()
});
// Quality Issue Schema
exports.QualityIssueSchema = zod_1.z.object({
    id: zod_1.z.string(),
    supplier_id: zod_1.z.string(),
    issue_number: zod_1.z.string(),
    title: zod_1.z.string().min(1, 'Título é obrigatório'),
    description: zod_1.z.string().min(1, 'Descrição é obrigatória'),
    type: zod_1.z.nativeEnum(QualityIssueType),
    severity: zod_1.z.enum(['low', 'medium', 'high', 'critical']),
    affected_quantity: zod_1.z.number().min(0),
    status: zod_1.z.nativeEnum(IssueStatus),
    reported_date: zod_1.z.string(),
    reported_by: zod_1.z.string(),
    clinic_id: zod_1.z.string()
});
// Export all schemas for external use
exports.SupplierSchemas = {
    Supplier: exports.SupplierSchema,
    ContactInfo: exports.ContactInfoSchema,
    Address: exports.AddressSchema,
    Certification: exports.CertificationSchema,
    ProcurementRequest: exports.ProcurementRequestSchema,
    QualityIssue: exports.QualityIssueSchema
};
