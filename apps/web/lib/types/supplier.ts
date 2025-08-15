// ============================================================================
// Supplier Management Types - Epic 6, Story 6.3
// ============================================================================
// Comprehensive TypeScript types for supplier management, performance tracking,
// and quality assurance system for NeonPro clinic management
// ============================================================================

import { z } from 'zod';

// ============================================================================
// ENUMS
// ============================================================================

export enum SupplierStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING_VERIFICATION = 'pending_verification',
  BLOCKED = 'blocked',
}

export enum SupplierCategory {
  MEDICAL_EQUIPMENT = 'medical_equipment',
  AESTHETIC_SUPPLIES = 'aesthetic_supplies',
  PHARMACEUTICALS = 'pharmaceuticals',
  CONSUMABLES = 'consumables',
  TECHNOLOGY = 'technology',
  SERVICES = 'services',
  MAINTENANCE = 'maintenance',
  OFFICE_SUPPLIES = 'office_supplies',
}

export enum ContractType {
  FIXED_TERM = 'fixed_term',
  INDEFINITE = 'indefinite',
  PROJECT_BASED = 'project_based',
  FRAMEWORK = 'framework',
  SPOT_PURCHASE = 'spot_purchase',
}

export enum PaymentTerms {
  NET_7 = 'net_7',
  NET_15 = 'net_15',
  NET_30 = 'net_30',
  NET_45 = 'net_45',
  NET_60 = 'net_60',
  IMMEDIATE = 'immediate',
  ADVANCE = 'advance',
  COD = 'cod',
}

export enum PerformanceMetric {
  DELIVERY_TIME = 'delivery_time',
  QUALITY_SCORE = 'quality_score',
  PRICING_COMPETITIVENESS = 'pricing_competitiveness',
  SERVICE_QUALITY = 'service_quality',
  COMMUNICATION = 'communication',
  COMPLIANCE = 'compliance',
  INNOVATION = 'innovation',
  SUSTAINABILITY = 'sustainability',
}

export enum RiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum QualityIssueType {
  DEFECTIVE_PRODUCT = 'defective_product',
  WRONG_SPECIFICATION = 'wrong_specification',
  PACKAGING_DAMAGE = 'packaging_damage',
  CONTAMINATION = 'contamination',
  EXPIRY_ISSUES = 'expiry_issues',
  DOCUMENTATION_ERROR = 'documentation_error',
  REGULATORY_NON_COMPLIANCE = 'regulatory_non_compliance',
}

export enum IssueStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  ESCALATED = 'escalated',
  CLOSED = 'closed',
}

// ============================================================================
// CORE INTERFACES
// ============================================================================

export interface Supplier {
  id: string;
  name: string;
  legal_name: string;
  cnpj?: string;
  cpf?: string;
  category: SupplierCategory;
  subcategories: string[];
  status: SupplierStatus;

  // Contact Information
  primary_contact: ContactInfo;
  secondary_contacts: ContactInfo[];

  // Business Information
  website?: string;
  registration_number?: string;
  tax_id?: string;

  // Address Information
  address: Address;
  billing_address?: Address;

  // Performance & Rating
  performance_score: number; // 0-100
  quality_rating: number; // 1-5 stars
  reliability_score: number; // 0-100
  cost_competitiveness: number; // 0-100

  // Financial Information
  credit_rating?: string;
  payment_terms: PaymentTerms;
  currency: string;
  early_payment_discount?: number;

  // Risk Assessment
  risk_level: RiskLevel;
  risk_factors: string[];

  // Certifications & Compliance
  certifications: Certification[];
  regulatory_compliance: boolean;
  anvisa_registration?: string;

  // Metadata
  created_at: string;
  updated_at: string;
  created_by: string;
  last_reviewed_at?: string;
  next_review_date?: string;

  // Relationships
  clinic_id: string;
  tags: string[];
  notes?: string;
}

export interface ContactInfo {
  id: string;
  name: string;
  title?: string;
  email: string;
  phone: string;
  mobile?: string;
  department?: string;
  is_primary: boolean;
  preferred_contact_method: 'email' | 'phone' | 'whatsapp';
}

export interface Address {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

export interface Certification {
  id: string;
  name: string;
  issuing_authority: string;
  certificate_number: string;
  issue_date: string;
  expiry_date?: string;
  document_url?: string;
  verification_status: 'verified' | 'pending' | 'expired' | 'invalid';
}

// ============================================================================
// CONTRACT MANAGEMENT
// ============================================================================

export interface SupplierContract {
  id: string;
  supplier_id: string;
  contract_number: string;
  title: string;
  type: ContractType;

  // Terms & Conditions
  start_date: string;
  end_date?: string;
  renewal_terms?: string;
  payment_terms: PaymentTerms;
  delivery_terms: string;

  // Financial Terms
  total_value?: number;
  currency: string;
  price_adjustment_clause?: string;
  penalty_clauses: string[];

  // Performance Requirements
  sla_requirements: SLARequirement[];
  quality_standards: QualityStandard[];
  delivery_schedule: DeliverySchedule[];

  // Legal & Compliance
  governing_law: string;
  dispute_resolution: string;
  confidentiality_clause: boolean;

  // Documents
  contract_document_url?: string;
  amendments: ContractAmendment[];

  // Alerts & Notifications
  renewal_alert_days: number;
  auto_renewal: boolean;

  // Status & Tracking
  status: 'draft' | 'active' | 'expired' | 'terminated' | 'suspended';
  created_at: string;
  updated_at: string;
  signed_date?: string;
  clinic_id: string;
}

export interface SLARequirement {
  metric: string;
  target_value: number;
  unit: string;
  measurement_period: string;
  penalty_for_breach?: number;
}

export interface QualityStandard {
  parameter: string;
  specification: string;
  tolerance: string;
  testing_method?: string;
  compliance_required: boolean;
}

export interface DeliverySchedule {
  item_category: string;
  lead_time_days: number;
  delivery_window: string;
  priority_level: 'standard' | 'urgent' | 'emergency';
}

export interface ContractAmendment {
  id: string;
  amendment_number: number;
  description: string;
  effective_date: string;
  document_url?: string;
  approved_by: string;
}

// ============================================================================
// PERFORMANCE TRACKING
// ============================================================================

export interface SupplierPerformance {
  id: string;
  supplier_id: string;
  evaluation_period: string; // YYYY-MM format

  // Core Metrics
  delivery_performance: PerformanceDetail;
  quality_performance: PerformanceDetail;
  pricing_performance: PerformanceDetail;
  service_performance: PerformanceDetail;

  // Calculated Scores
  overall_score: number; // 0-100 weighted average
  previous_score?: number;
  score_trend: 'improving' | 'declining' | 'stable';

  // Benchmarking
  industry_benchmark?: number;
  peer_ranking?: number;
  category_average?: number;

  // Recommendations
  strengths: string[];
  improvement_areas: string[];
  recommended_actions: string[];

  // Metadata
  evaluated_at: string;
  evaluated_by: string;
  next_evaluation_date: string;
  clinic_id: string;
}

export interface PerformanceDetail {
  metric: PerformanceMetric;
  score: number; // 0-100
  weight: number; // Weight in overall calculation
  target: number;
  actual: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  details: PerformanceDataPoint[];
}

export interface PerformanceDataPoint {
  date: string;
  value: number;
  notes?: string;
  verified: boolean;
}

// ============================================================================
// BIDDING & PROCUREMENT
// ============================================================================

export interface ProcurementRequest {
  id: string;
  request_number: string;
  title: string;
  description: string;
  category: SupplierCategory;

  // Requirements
  items: ProcurementItem[];
  specifications: ItemSpecification[];
  delivery_requirements: DeliveryRequirement;
  quality_requirements: QualityRequirement[];

  // Process Management
  status:
    | 'draft'
    | 'published'
    | 'bidding'
    | 'evaluation'
    | 'awarded'
    | 'cancelled';
  request_type: 'rfq' | 'rfp' | 'tender' | 'quote';

  // Timeline
  published_date?: string;
  submission_deadline: string;
  evaluation_period: string;
  award_date?: string;

  // Invited Suppliers
  invited_suppliers: string[]; // supplier_ids
  public_tender: boolean;

  // Evaluation Criteria
  evaluation_criteria: EvaluationCriteria[];

  // Metadata
  created_at: string;
  created_by: string;
  clinic_id: string;
}

export interface ProcurementItem {
  id: string;
  item_name: string;
  description: string;
  quantity: number;
  unit: string;
  estimated_unit_price?: number;
  total_estimated_value?: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface ItemSpecification {
  parameter: string;
  requirement: string;
  mandatory: boolean;
  preferred_value?: string;
  testing_required: boolean;
}

export interface DeliveryRequirement {
  delivery_location: Address;
  required_delivery_date: string;
  preferred_delivery_window: string;
  special_handling?: string[];
  packaging_requirements?: string;
}

export interface QualityRequirement {
  standard: string;
  certification_required: boolean;
  testing_protocol?: string;
  acceptance_criteria: string;
}

export interface EvaluationCriteria {
  criterion: string;
  weight: number; // Percentage weight
  scoring_method: 'price' | 'technical' | 'qualitative' | 'pass_fail';
  max_score: number;
}

// ============================================================================
// SUPPLIER BIDS
// ============================================================================

export interface SupplierBid {
  id: string;
  procurement_request_id: string;
  supplier_id: string;
  bid_number: string;

  // Bid Details
  bid_items: BidItem[];
  total_value: number;
  currency: string;
  validity_period: string;

  // Terms & Conditions
  payment_terms: PaymentTerms;
  delivery_terms: string;
  warranty_terms?: string;
  special_conditions?: string[];

  // Compliance & Documentation
  compliance_checklist: ComplianceItem[];
  supporting_documents: BidDocument[];

  // Evaluation
  technical_score?: number;
  commercial_score?: number;
  overall_score?: number;
  evaluation_notes?: string;

  // Status & Timeline
  status:
    | 'draft'
    | 'submitted'
    | 'under_evaluation'
    | 'shortlisted'
    | 'rejected'
    | 'awarded';
  submitted_at?: string;
  evaluated_at?: string;

  // Metadata
  created_at: string;
  clinic_id: string;
}

export interface BidItem {
  procurement_item_id: string;
  offered_quantity: number;
  unit_price: number;
  total_price: number;
  brand?: string;
  model?: string;
  specification_compliance: boolean;
  alternative_offered: boolean;
  notes?: string;
}

export interface ComplianceItem {
  requirement: string;
  status: 'compliant' | 'non_compliant' | 'partially_compliant';
  evidence_provided: boolean;
  notes?: string;
}

export interface BidDocument {
  id: string;
  document_type: string;
  file_name: string;
  file_url: string;
  uploaded_at: string;
  verified: boolean;
}

// ============================================================================
// QUALITY MANAGEMENT
// ============================================================================

export interface QualityIssue {
  id: string;
  supplier_id: string;
  issue_number: string;
  title: string;
  description: string;
  type: QualityIssueType;
  severity: 'low' | 'medium' | 'high' | 'critical';

  // Related Information
  purchase_order_id?: string;
  product_batch?: string;
  affected_quantity: number;

  // Impact Assessment
  financial_impact?: number;
  operational_impact: string;
  patient_safety_impact: boolean;

  // Resolution
  status: IssueStatus;
  root_cause?: string;
  corrective_actions: CorrectiveAction[];
  preventive_actions: PreventiveAction[];

  // Timeline
  reported_date: string;
  acknowledged_date?: string;
  resolved_date?: string;
  closure_date?: string;

  // Stakeholders
  reported_by: string;
  assigned_to?: string;
  supplier_representative?: string;

  // Documentation
  evidence_documents: QualityDocument[];
  resolution_documents: QualityDocument[];

  // Follow-up
  follow_up_required: boolean;
  follow_up_date?: string;
  verification_required: boolean;

  // Metadata
  clinic_id: string;
  created_at: string;
  updated_at: string;
}

export interface CorrectiveAction {
  id: string;
  description: string;
  responsible_party: 'supplier' | 'clinic' | 'joint';
  due_date: string;
  completion_date?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  verification_method: string;
  effectiveness_verified: boolean;
}

export interface PreventiveAction {
  id: string;
  description: string;
  implementation_date: string;
  responsible_party: 'supplier' | 'clinic' | 'joint';
  monitoring_plan: string;
  effectiveness_metrics: string[];
}

export interface QualityDocument {
  id: string;
  document_type:
    | 'photo'
    | 'report'
    | 'certificate'
    | 'test_result'
    | 'correspondence';
  file_name: string;
  file_url: string;
  description?: string;
  uploaded_at: string;
  uploaded_by: string;
}

// ============================================================================
// COMMUNICATION & COLLABORATION
// ============================================================================

export interface SupplierCommunication {
  id: string;
  supplier_id: string;
  subject: string;
  message: string;
  type: 'email' | 'phone' | 'meeting' | 'document' | 'system_notification';
  direction: 'inbound' | 'outbound';

  // Participants
  from_contact: string;
  to_contacts: string[];
  cc_contacts?: string[];

  // Content
  attachments: CommunicationAttachment[];
  priority: 'low' | 'normal' | 'high' | 'urgent';

  // Classification
  category:
    | 'order'
    | 'quality'
    | 'payment'
    | 'general'
    | 'complaint'
    | 'inquiry';
  tags: string[];

  // Status & Follow-up
  status: 'sent' | 'delivered' | 'read' | 'replied' | 'archived';
  requires_response: boolean;
  response_deadline?: string;
  follow_up_date?: string;

  // Metadata
  timestamp: string;
  clinic_id: string;
  created_by: string;
}

export interface CommunicationAttachment {
  id: string;
  file_name: string;
  file_url: string;
  file_size: number;
  mime_type: string;
  uploaded_at: string;
}

// ============================================================================
// ANALYTICS & REPORTING
// ============================================================================

export interface SupplierAnalytics {
  supplier_id: string;
  period: string;

  // Performance Summary
  overall_performance: PerformanceSummary;
  trend_analysis: TrendAnalysis;
  comparative_analysis: ComparativeAnalysis;

  // Financial Analytics
  spend_analysis: SpendAnalysis;
  cost_savings: CostSavingsAnalysis;
  payment_analytics: PaymentAnalytics;

  // Operational Analytics
  delivery_analytics: DeliveryAnalytics;
  quality_analytics: QualityAnalytics;
  order_analytics: OrderAnalytics;

  // Risk Analytics
  risk_assessment: RiskAssessment;
  compliance_status: ComplianceStatus;

  // Benchmarking
  industry_benchmarks: IndustryBenchmark[];
  peer_comparison: PeerComparison[];

  // Recommendations
  optimization_opportunities: OptimizationOpportunity[];
  action_items: ActionItem[];

  // Metadata
  generated_at: string;
  clinic_id: string;
}

export interface PerformanceSummary {
  current_score: number;
  previous_score: number;
  score_change: number;
  percentile_ranking: number;
  grade: 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F';
}

export interface TrendAnalysis {
  metric: string;
  trend_direction: 'improving' | 'declining' | 'stable';
  trend_strength: 'strong' | 'moderate' | 'weak';
  data_points: { date: string; value: number }[];
  seasonality_detected: boolean;
}

export interface ComparativeAnalysis {
  vs_category_average: number;
  vs_top_performer: number;
  vs_previous_year: number;
  ranking_in_category: number;
  total_suppliers_in_category: number;
}

export interface SpendAnalysis {
  total_spend: number;
  spend_trend: 'increasing' | 'decreasing' | 'stable';
  spend_by_category: { category: string; amount: number; percentage: number }[];
  top_purchase_categories: string[];
  average_order_value: number;
  order_frequency: number;
}

export interface CostSavingsAnalysis {
  total_savings: number;
  savings_sources: { source: string; amount: number }[];
  negotiated_discounts: number;
  volume_discounts: number;
  early_payment_savings: number;
  cost_avoidance: number;
}

export interface PaymentAnalytics {
  average_payment_time: number;
  early_payment_rate: number;
  on_time_payment_rate: number;
  late_payment_rate: number;
  discount_utilization_rate: number;
  payment_method_distribution: { method: string; percentage: number }[];
}

export interface DeliveryAnalytics {
  on_time_delivery_rate: number;
  average_lead_time: number;
  delivery_reliability_score: number;
  delivery_issues_count: number;
  emergency_delivery_rate: number;
  delivery_cost_per_order: number;
}

export interface QualityAnalytics {
  defect_rate: number;
  return_rate: number;
  complaint_rate: number;
  quality_score_trend: TrendAnalysis;
  quality_issues_by_type: { type: string; count: number }[];
  resolution_time_average: number;
}

export interface OrderAnalytics {
  total_orders: number;
  order_fulfillment_rate: number;
  partial_shipment_rate: number;
  order_accuracy_rate: number;
  order_cycle_time: number;
  stockout_incidents: number;
}

export interface RiskAssessment {
  overall_risk_score: number;
  risk_factors: { factor: string; score: number; impact: string }[];
  financial_stability: number;
  operational_reliability: number;
  compliance_risk: number;
  geographic_risk: number;
}

export interface ComplianceStatus {
  overall_compliance_rate: number;
  regulatory_compliance: boolean;
  certification_status: 'current' | 'expiring' | 'expired';
  audit_findings: number;
  corrective_actions_pending: number;
}

export interface IndustryBenchmark {
  metric: string;
  supplier_value: number;
  industry_average: number;
  top_quartile: number;
  bottom_quartile: number;
  percentile_ranking: number;
}

export interface PeerComparison {
  metric: string;
  supplier_value: number;
  peer_average: number;
  best_peer: number;
  ranking: number;
  total_peers: number;
}

export interface OptimizationOpportunity {
  area: string;
  description: string;
  potential_savings: number;
  implementation_effort: 'low' | 'medium' | 'high';
  timeline: string;
  priority: 'low' | 'medium' | 'high';
}

export interface ActionItem {
  id: string;
  description: string;
  responsible_party: 'clinic' | 'supplier' | 'joint';
  due_date: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed';
  impact_area: string;
}

// ============================================================================
// ZOD VALIDATION SCHEMAS
// ============================================================================

// Contact Information Schema
export const ContactInfoSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Nome é obrigatório'),
  title: z.string().optional(),
  email: z.string().email('Email inválido'),
  phone: z.string().min(10, 'Telefone deve ter pelo menos 10 dígitos'),
  mobile: z.string().optional(),
  department: z.string().optional(),
  is_primary: z.boolean(),
  preferred_contact_method: z.enum(['email', 'phone', 'whatsapp']),
});

// Address Schema
export const AddressSchema = z.object({
  street: z.string().min(1, 'Rua é obrigatória'),
  number: z.string().min(1, 'Número é obrigatório'),
  complement: z.string().optional(),
  neighborhood: z.string().min(1, 'Bairro é obrigatório'),
  city: z.string().min(1, 'Cidade é obrigatória'),
  state: z.string().min(2, 'Estado é obrigatório'),
  postal_code: z.string().regex(/^\d{5}-?\d{3}$/, 'CEP inválido'),
  country: z.string().default('Brasil'),
});

// Certification Schema
export const CertificationSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Nome da certificação é obrigatório'),
  issuing_authority: z.string().min(1, 'Autoridade emissora é obrigatória'),
  certificate_number: z.string().min(1, 'Número do certificado é obrigatório'),
  issue_date: z.string(),
  expiry_date: z.string().optional(),
  document_url: z.string().url().optional(),
  verification_status: z.enum(['verified', 'pending', 'expired', 'invalid']),
});

// Supplier Schema
export const SupplierSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Nome do fornecedor é obrigatório'),
  legal_name: z.string().min(1, 'Razão social é obrigatória'),
  cnpj: z
    .string()
    .regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, 'CNPJ inválido')
    .optional(),
  cpf: z
    .string()
    .regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'CPF inválido')
    .optional(),
  category: z.nativeEnum(SupplierCategory),
  subcategories: z.array(z.string()),
  status: z.nativeEnum(SupplierStatus),

  primary_contact: ContactInfoSchema,
  secondary_contacts: z.array(ContactInfoSchema),

  website: z.string().url().optional(),
  registration_number: z.string().optional(),
  tax_id: z.string().optional(),

  address: AddressSchema,
  billing_address: AddressSchema.optional(),

  performance_score: z.number().min(0).max(100),
  quality_rating: z.number().min(1).max(5),
  reliability_score: z.number().min(0).max(100),
  cost_competitiveness: z.number().min(0).max(100),

  credit_rating: z.string().optional(),
  payment_terms: z.nativeEnum(PaymentTerms),
  currency: z.string().default('BRL'),
  early_payment_discount: z.number().min(0).max(100).optional(),

  risk_level: z.nativeEnum(RiskLevel),
  risk_factors: z.array(z.string()),

  certifications: z.array(CertificationSchema),
  regulatory_compliance: z.boolean(),
  anvisa_registration: z.string().optional(),

  created_at: z.string(),
  updated_at: z.string(),
  created_by: z.string(),
  last_reviewed_at: z.string().optional(),
  next_review_date: z.string().optional(),

  clinic_id: z.string(),
  tags: z.array(z.string()),
  notes: z.string().optional(),
});

// Procurement Request Schema
export const ProcurementRequestSchema = z.object({
  id: z.string(),
  request_number: z.string(),
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().min(1, 'Descrição é obrigatória'),
  category: z.nativeEnum(SupplierCategory),
  status: z.enum([
    'draft',
    'published',
    'bidding',
    'evaluation',
    'awarded',
    'cancelled',
  ]),
  request_type: z.enum(['rfq', 'rfp', 'tender', 'quote']),
  submission_deadline: z.string(),
  evaluation_period: z.string(),
  invited_suppliers: z.array(z.string()),
  public_tender: z.boolean(),
  created_at: z.string(),
  created_by: z.string(),
  clinic_id: z.string(),
});

// Quality Issue Schema
export const QualityIssueSchema = z.object({
  id: z.string(),
  supplier_id: z.string(),
  issue_number: z.string(),
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().min(1, 'Descrição é obrigatória'),
  type: z.nativeEnum(QualityIssueType),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  affected_quantity: z.number().min(0),
  status: z.nativeEnum(IssueStatus),
  reported_date: z.string(),
  reported_by: z.string(),
  clinic_id: z.string(),
});

// Export all schemas for external use
export const SupplierSchemas = {
  Supplier: SupplierSchema,
  ContactInfo: ContactInfoSchema,
  Address: AddressSchema,
  Certification: CertificationSchema,
  ProcurementRequest: ProcurementRequestSchema,
  QualityIssue: QualityIssueSchema,
} as const;

// Export utility types
export type SupplierFormData = z.infer<typeof SupplierSchema>;
export type ContactFormData = z.infer<typeof ContactInfoSchema>;
export type AddressFormData = z.infer<typeof AddressSchema>;
export type CertificationFormData = z.infer<typeof CertificationSchema>;
export type ProcurementFormData = z.infer<typeof ProcurementRequestSchema>;
export type QualityIssueFormData = z.infer<typeof QualityIssueSchema>;
