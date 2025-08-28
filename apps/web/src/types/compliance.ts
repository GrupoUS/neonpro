/**
 * Brazilian Healthcare Compliance Types
 * Comprehensive type definitions for CFM, ANVISA, LGPD, ANS, and Emergency Protocols
 * Compliant with Brazilian healthcare regulations and standards
 */

// =============================================================================
// CFM (Conselho Federal de Medicina) Types
// =============================================================================

export type CFMState =
  | "SP"
  | "RJ"
  | "MG"
  | "RS"
  | "PR"
  | "SC"
  | "BA"
  | "GO"
  | "ES"
  | "PE"
  | "CE"
  | "PA"
  | "MA"
  | "PB"
  | "RN"
  | "AL"
  | "PI"
  | "SE"
  | "RO"
  | "AC"
  | "AM"
  | "RR"
  | "AP"
  | "TO"
  | "MS"
  | "MT"
  | "DF";

export type CFMLicenseStatus =
  | "active"
  | "pending"
  | "expired"
  | "suspended"
  | "cancelled";

export type MedicalSpecialty =
  | "cirurgia-plastica"
  | "dermatologia"
  | "anestesiologia"
  | "cardiologia"
  | "endocrinologia"
  | "ginecologia"
  | "neurologia"
  | "oftalmologia"
  | "ortopedia"
  | "pediatria"
  | "psiquiatria"
  | "urologia"
  | "oncologia"
  | "radiologia"
  | "patologia"
  | "medicina-geral"
  | "medicina-estetica";

export interface CFMValidationBadgeProps {
  license: string; // e.g., "CRM-SP 123456"
  specialty: MedicalSpecialty;
  validUntil: Date;
  status: CFMLicenseStatus;
  automaticValidation?: boolean;
  onStatusChange?: (status: CFMLicenseStatus) => void;
  showTooltip?: boolean;
  className?: string;
}

export interface CFMValidationResult {
  isValid: boolean;
  license: string;
  doctorName: string;
  specialty: MedicalSpecialty;
  state: CFMState;
  validUntil: Date;
  status: CFMLicenseStatus;
  restrictions: string[];
  lastVerified: Date;
  verificationSource: "cfm-api" | "local-cache" | "manual";
}

export interface CFMProfessional {
  id: string;
  crmNumber: string;
  state: CFMState;
  fullName: string;
  cpf: string;
  specialties: MedicalSpecialty[];
  status: CFMLicenseStatus;
  registrationDate: Date;
  validUntil: Date;
  restrictions: string[];
  contactInfo?: {
    email?: string;
    phone?: string;
    address?: BrazilianAddress;
  };
}

// =============================================================================
// ANVISA (Agência Nacional de Vigilância Sanitária) Types
// =============================================================================

export type ANVISAControlledClass =
  | "A1"
  | "A2"
  | "A3"
  | "B1"
  | "B2"
  | "C1"
  | "C2"
  | "C3";

export type PrescriptionType =
  | "receituario-a" // Yellow prescription (A1, A2, A3)
  | "receituario-b" // Blue prescription (B1, B2)
  | "receituario-c" // White prescription (C1, C2)
  | "receituario-especial" // Special prescription
  | "notificacao-receita"; // Prescription notification

export interface ANVISASubstance {
  id: string;
  substanceName: string;
  commercialName: string;
  controlledClass: ANVISAControlledClass;
  prescriptionType: PrescriptionType;
  activeIngredient: string;
  concentration: string;
  pharmaceuticalForm: string;
  restrictions: string[];
  maxDailyDose?: number;
  maxTreatmentDays?: number;
  requiresSpecialHandling: boolean;
  storageRequirements: string[];
  disposalRequirements: string[];
}

export interface ANVISATrackerProps {
  clinicId: string;
  substances: ANVISASubstance[];
  prescriptions: ControlledPrescription[];
  onSubstanceSelect?: (substance: ANVISASubstance) => void;
  onPrescriptionView?: (prescription: ControlledPrescription) => void;
  showAlerts?: boolean;
  autoRefresh?: boolean;
  className?: string;
}

export interface ControlledPrescription {
  id: string;
  prescriptionNumber: string;
  prescriptionType: PrescriptionType;
  substanceId: string;
  patientId: string;
  doctorCRM: string;
  prescriptionDate: Date;
  quantity: number;
  dosage: string;
  treatmentDays: number;
  dispensedDate?: Date;
  dispensedQuantity?: number;
  pharmacyId?: string;
  status:
    | "prescribed"
    | "dispensed"
    | "partially-dispensed"
    | "expired"
    | "cancelled";
  validUntil: Date;
  specialInstructions?: string;
}

// =============================================================================
// LGPD (Lei Geral de Proteção de Dados) Types
// =============================================================================

export type LGPDConsentType =
  | "tratamento-medico" // Medical treatment
  | "dados-biometricos" // Biometric data
  | "imagens-procedimentos" // Procedure images
  | "marketing-promocional" // Marketing/promotional
  | "pesquisa-satisfacao" // Satisfaction research
  | "compartilhamento-terceiros" // Third-party sharing
  | "historico-medico" // Medical history
  | "dados-financeiros" // Financial data
  | "contato-emergencia" // Emergency contact
  | "telemedicina" // Telemedicine
  | "dados-sensivel-saude"; // Sensitive health data

export type LGPDConsentStatus =
  | "given"
  | "withdrawn"
  | "pending"
  | "expired"
  | "revoked";

export interface LGPDConsentRecord {
  id: string;
  patientId: string;
  consentType: LGPDConsentType;
  status: LGPDConsentStatus;
  consentDate?: Date;
  withdrawalDate?: Date;
  expirationDate?: Date;
  purposes: string[];
  dataCategories: string[];
  retentionPeriod: number; // months
  consentMethod:
    | "digital-signature"
    | "written-form"
    | "verbal-recorded"
    | "online-form";
  legalBasis:
    | "consent"
    | "legitimate-interest"
    | "legal-obligation"
    | "vital-interest";
  auditTrail: LGPDAuditEntry[];
}

export interface LGPDAuditEntry {
  timestamp: Date;
  action:
    | "consent-given"
    | "consent-withdrawn"
    | "data-accessed"
    | "data-modified"
    | "data-deleted";
  userId: string;
  userRole: string;
  ipAddress: string;
  details: string;
  dataCategory?: string;
}

export interface LGPDConsentManagerProps {
  patientId: string;
  consentTypes: LGPDConsentType[];
  granularControls?: boolean;
  auditTrailEnabled?: boolean;
  withdrawalWorkflow?: boolean;
  onConsentChange?: (consent: LGPDConsentRecord) => void;
  showAuditTrail?: boolean;
  className?: string;
}

export interface LGPDDataSubjectRights {
  patientId: string;
  rightType:
    | "access"
    | "rectification"
    | "erasure"
    | "portability"
    | "restriction"
    | "objection";
  requestDate: Date;
  completionDate?: Date;
  status: "pending" | "in-progress" | "completed" | "rejected";
  rejectionReason?: string;
  requestDetails: string;
  responseDetails?: string;
  documentsProvided: string[];
}

// =============================================================================
// ANS (Agência Nacional de Saúde Suplementar) Types
// =============================================================================

export type ANSPlanType =
  | "ambulatorial" // Outpatient
  | "hospitalar" // Hospital
  | "odontologico" // Dental
  | "referencia" // Reference
  | "basico" // Basic
  | "essencial" // Essential
  | "completo"; // Complete

export type ANSCoverageStatus =
  | "covered"
  | "partial"
  | "denied"
  | "pre-authorization-required";

export interface ANSBeneficiaryData {
  cardNumber: string;
  beneficiaryName: string;
  cpf: string;
  planType: ANSPlanType;
  operatorName: string;
  operatorCode: string;
  isActive: boolean;
  planStartDate: Date;
  planEndDate?: Date;
  coverageArea: string[];
  coparticipation: boolean;
  carencyPeriods: {
    procedure: string;
    carencyDays: number;
    completedDate?: Date;
  }[];
  networkProviders: string[];
  preAuthorizationRequired: string[];
}

export interface ANSInsuranceCheckerProps {
  cardNumber: string;
  patientId: string;
  automaticVerification?: boolean;
  coverageValidation?: boolean;
  onVerificationComplete?: (result: ANSVerificationResult) => void;
  showCoverageDetails?: boolean;
  className?: string;
}

export interface ANSVerificationResult {
  isValid: boolean;
  beneficiaryData?: ANSBeneficiaryData;
  coverageStatus: ANSCoverageStatus;
  coveredProcedures: string[];
  excludedProcedures: string[];
  requiresPreAuthorization: string[];
  copaymentRequired: boolean;
  copaymentValue?: number;
  networkStatus: "in-network" | "out-network" | "partial-network";
  verificationDate: Date;
  errors?: string[];
}

// =============================================================================
// Emergency Medical Protocols Types
// =============================================================================

export type EmergencyProtocolType =
  | "samu" // SAMU protocols
  | "cbmr" // Military Fire Department
  | "manchester" // Manchester Triage
  | "clinica-interna" // Internal clinic
  | "transferencia" // Transfer protocols
  | "reanimacao" // Resuscitation
  | "intoxicacao" // Intoxication
  | "trauma" // Trauma
  | "cardiovascular" // Cardiovascular
  | "respiratorio" // Respiratory
  | "neurologico"; // Neurological

export type TriageLevel = "azul" | "verde" | "amarelo" | "laranja" | "vermelho";

export interface EmergencyProtocol {
  id: string;
  protocolName: string;
  protocolType: EmergencyProtocolType;
  triageLevel: TriageLevel;
  description: string;
  indications: string[];
  contraindications: string[];
  protocolSteps: EmergencyProtocolStep[];
  estimatedTime: number; // minutes
  requiredEquipment: string[];
  requiredMedications: string[];
  specialConsiderations: string[];
  followUpActions: string[];
  documentationRequired: string[];
}

export interface EmergencyProtocolStep {
  stepNumber: number;
  title: string;
  description: string;
  timeLimit?: number; // seconds
  criticalStep: boolean;
  verificationRequired: boolean;
  mediaUrls?: string[]; // images, videos
  alternatives?: string[];
}

export interface EmergencyProtocolsProps {
  protocols: EmergencyProtocol[];
  selectedProtocol?: string;
  triageLevel?: TriageLevel;
  onProtocolSelect?: (protocol: EmergencyProtocol) => void;
  onStepComplete?: (protocolId: string, stepNumber: number) => void;
  showTimer?: boolean;
  allowModification?: boolean;
  className?: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  alternativePhone?: string;
  email?: string;
  priority: 1 | 2 | 3; // 1 = primary
  canAuthorizeEmergency: boolean;
  specialInstructions?: string;
}

// =============================================================================
// Brazilian Address Types (ViaCEP Integration)
// =============================================================================

export interface BrazilianAddress {
  cep: string;
  logradouro: string; // Street
  numero?: string;
  complemento?: string;
  bairro: string; // Neighborhood
  localidade: string; // City
  uf: CFMState; // State
  region: "Norte" | "Nordeste" | "Centro-Oeste" | "Sudeste" | "Sul";
  ibge?: string;
  gia?: string;
  ddd?: string;
  siafi?: string;
}

export interface BrazilianAddressInputProps {
  value?: Partial<BrazilianAddress>;
  onChange?: (address: BrazilianAddress) => void;
  onCEPValidation?: (cep: string, isValid: boolean) => void;
  autoComplete?: boolean;
  requiredFields?: (keyof BrazilianAddress)[];
  showValidationStatus?: boolean;
  className?: string;
}

// =============================================================================
// Compliance Dashboard Types
// =============================================================================

export interface ComplianceMetrics {
  cfmValidationRate: number; // 0-100%
  lgpdCompliantRecords: number; // count
  anvisaControlledTracked: number; // count
  ansVerificationAccuracy: number; // 0-100%
  emergencyProtocolsUpdated: number; // count
  auditTrailIntegrity: number; // 0-100%
  lastComplianceAudit: Date;
  nextComplianceDeadline: Date;
  criticalViolations: number;
  warningAlerts: number;
}

export interface ComplianceAlert {
  id: string;
  type: "cfm" | "anvisa" | "lgpd" | "ans" | "emergency" | "audit";
  severity: "low" | "medium" | "high" | "critical";
  title: string;
  description: string;
  createdAt: Date;
  resolvedAt?: Date;
  assignedTo?: string;
  actions: ComplianceAction[];
  affectedRecords?: string[];
  complianceDeadline?: Date;
}

export interface ComplianceAction {
  id: string;
  title: string;
  description: string;
  required: boolean;
  completed: boolean;
  completedAt?: Date;
  completedBy?: string;
  estimatedTime: number; // minutes
  priority: "low" | "medium" | "high";
}

export interface ComplianceDashboardProps {
  clinicId: string;
  metrics: ComplianceMetrics;
  alerts: ComplianceAlert[];
  onAlertResolve?: (alertId: string) => void;
  onActionComplete?: (alertId: string, actionId: string) => void;
  autoRefresh?: boolean;
  refreshInterval?: number; // seconds
  showDetailedMetrics?: boolean;
  className?: string;
}

// =============================================================================
// Audit Trail Types
// =============================================================================

export interface AuditTrailEntry {
  id: string;
  timestamp: Date;
  userId: string;
  userRole: string;
  action: AuditAction;
  entityType:
    | "patient"
    | "professional"
    | "prescription"
    | "consent"
    | "insurance";
  entityId: string;
  oldValue?: any;
  newValue?: any;
  ipAddress: string;
  userAgent: string;
  sessionId: string;
  complianceType: "cfm" | "anvisa" | "lgpd" | "ans" | "emergency";
  riskLevel: "low" | "medium" | "high";
  description: string;
}

export type AuditAction =
  | "create"
  | "read"
  | "update"
  | "delete"
  | "consent-given"
  | "consent-withdrawn"
  | "data-exported"
  | "license-validated"
  | "substance-prescribed"
  | "insurance-verified"
  | "emergency-accessed"
  | "protocol-executed"
  | "audit-trail-accessed"
  | "compliance-report-generated";

// =============================================================================
// Reporting Types
// =============================================================================

export interface ComplianceReport {
  id: string;
  reportType: "cfm" | "anvisa" | "lgpd" | "ans" | "full-compliance";
  generatedAt: Date;
  periodStart: Date;
  periodEnd: Date;
  clinicId: string;
  generatedBy: string;
  metrics: ComplianceMetrics;
  violations: ComplianceAlert[];
  recommendations: string[];
  certificationsRequired: string[];
  nextAuditDate?: Date;
  reportUrl?: string;
  digitalSignature?: string;
}

// =============================================================================
// Utility Types
// =============================================================================

export interface ValidationResponse<T = any> {
  isValid: boolean;
  data?: T;
  errors: string[];
  warnings: string[];
  timestamp: Date;
  source: string;
}

export interface ComplianceAPIResponse<T = any> {
  success: boolean;
  data?: T;
  message: string;
  errors?: string[];
  metadata?: {
    requestId: string;
    processedAt: Date;
    source: string;
    version: string;
  };
}

// =============================================================================
// Export all types
// =============================================================================

export type {
  ANSBeneficiaryData,
  ANSCoverageStatus,
  ANSInsuranceCheckerProps,
  // ANS exports
  ANSPlanType,
  ANSVerificationResult,
  // ANVISA exports
  ANVISAControlledClass,
  ANVISASubstance,
  ANVISATrackerProps,
  AuditAction,
  // Audit exports
  AuditTrailEntry,
  // Address exports
  BrazilianAddress,
  BrazilianAddressInputProps,
  CFMLicenseStatus,
  CFMProfessional,
  // CFM exports
  CFMState,
  CFMValidationBadgeProps,
  CFMValidationResult,
  ComplianceAction,
  ComplianceAlert,
  ComplianceAPIResponse,
  ComplianceDashboardProps,
  // Dashboard exports
  ComplianceMetrics,
  // Reporting exports
  ComplianceReport,
  ControlledPrescription,
  EmergencyContact,
  EmergencyProtocol,
  EmergencyProtocolsProps,
  EmergencyProtocolStep,
  // Emergency exports
  EmergencyProtocolType,
  LGPDAuditEntry,
  LGPDConsentManagerProps,
  LGPDConsentRecord,
  LGPDConsentStatus,
  // LGPD exports
  LGPDConsentType,
  LGPDDataSubjectRights,
  MedicalSpecialty,
  PrescriptionType,
  TriageLevel,
  // Utility exports
  ValidationResponse,
};
