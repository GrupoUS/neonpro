// Brazilian Healthcare Compliance Type Definitions
// Complete type system for CFM, ANVISA, LGPD, and Emergency Protocol compliance

import { z } from "zod";

// =============================================================================
// CFM PROFESSIONAL REGISTRATION TYPES
// =============================================================================

export const BrazilianStates = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", 
  "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", 
  "RS", "RO", "RR", "SC", "SP", "SE", "TO"
] as const;

export type BrazilianState = typeof BrazilianStates[number];

export const HealthcareCouncils = [
  "CFM",    // Conselho Federal de Medicina
  "COREN",  // Conselho Regional de Enfermagem  
  "CRF",    // Conselho Regional de Farmácia
  "CREFITO", // Conselho Regional de Fisioterapia
  "CRO",    // Conselho Regional de Odontologia
  "CRP",    // Conselho Regional de Psicologia
  "CRBM",   // Conselho Regional de Biomedicina
] as const;

export type HealthcareCouncil = typeof HealthcareCouncils[number];

export const ProfessionalStatus = [
  "active",     // Ativo
  "suspended",  // Suspenso
  "revoked",    // Cassado
  "inactive",   // Inativo
  "pending",    // Pendente renovação
] as const;

export type ProfessionalStatus = typeof ProfessionalStatus[number];

export const MedicalSpecialties = [
  "CARDIOLOGIA", "DERMATOLOGIA", "NEUROLOGIA", "PEDIATRIA", "GINECOLOGIA",
  "ORTOPEDIA", "PSIQUIATRIA", "ENDOCRINOLOGIA", "MEDICINA_ESTETICA",
  "CIRURGIA_PLASTICA", "ANESTESIOLOGIA", "MEDICINA_INTENSIVA",
  "MEDICINA_FAMILIA", "MEDICINA_TRABALHO", "RADIOLOGIA", "PATOLOGIA",
] as const;

export type MedicalSpecialty = typeof MedicalSpecialties[number];

export interface CFMRegistration {
  id: string;
  crm: string; // Format: CRM-SP-123456
  state: BrazilianState;
  doctorName: string;
  cpf: string;
  status: ProfessionalStatus;
  registrationDate: string;
  renewalDate: string;
  specialties: MedicalSpecialty[];
  additionalQualifications?: string[];
  emergencyQualified: boolean;
  prescriptionRights: {
    controlled: boolean;
    classes: ANVISAControlClass[];
  };
  lastValidated: string;
  validationSource: 'cfm_api' | 'manual' | 'scraping';
}

export interface ProfessionalValidationRequest {
  crm: string;
  state: BrazilianState;
  doctorName?: string;
  validateSpecialties?: boolean;
  checkEmergencyQualification?: boolean;
}

export interface ProfessionalValidationResponse {
  valid: boolean;
  registration?: CFMRegistration;
  errors?: string[];
  confidence: number; // 0.0 to 1.0
  validatedAt: string;
  nextValidationDate: string;
}

// =============================================================================
// ANVISA CONTROLLED SUBSTANCES TYPES  
// =============================================================================

export const ANVISAControlClasses = [
  "A1", "A2", "A3", // Narcóticos
  "B1", "B2",       // Psicotrópicos 
  "C1", "C2", "C3", "C4", "C5", // Outras substâncias controladas
] as const;

export type ANVISAControlClass = typeof ANVISAControlClasses[number];

export const PrescriptionTypes = [
  "receituario_amarelo",      // A1, A2, A3 (Narcóticos)
  "receituario_azul",         // B1, B2 (Psicotrópicos)
  "receituario_branco",       // C1, C2, C3, C4, C5
  "notificacao_receita",      // Receita de Notificação
] as const;

export type PrescriptionType = typeof PrescriptionTypes[number];

export interface ControlledSubstance {
  id: string;
  anvisaCode: string;
  name: string;
  activeIngredient: string;
  controlClass: ANVISAControlClass;
  prescriptionType: PrescriptionType;
  maxQuantity: number;
  validityDays: number;
  requiresNotification: boolean;
  restrictions: string[];
  contraindications: string[];
  lastUpdated: string;
}

export interface PrescriptionRecord {
  id: string;
  patientId: string;
  doctorId: string;
  pharmacyId?: string;
  substanceId: string;
  prescriptionNumber: string;
  prescriptionType: PrescriptionType;
  quantity: number;
  instructions: string;
  prescribedAt: string;
  validUntil: string;
  dispensedAt?: string;
  status: 'prescribed' | 'dispensed' | 'expired' | 'cancelled';
  anvisaReportRequired: boolean;
  auditTrail: AuditTrailEntry[];
}

export interface StockEntry {
  id: string;
  substanceId: string;
  clinicId: string;
  currentStock: number;
  minimumStock: number;
  lastRestocked: string;
  expirationDate: string;
  batchNumber: string;
  supplierId: string;
  anvisaLicense: string;
  auditTrail: AuditTrailEntry[];
}

// =============================================================================
// LGPD COMPLIANCE TYPES
// =============================================================================

export const LGPDLegalBases = [
  "consent",           // Consentimento
  "legitimate_interest", // Interesse legítimo
  "legal_obligation",  // Obrigação legal
  "vital_interests",   // Interesses vitais
  "public_task",       // Exercício regular de direitos
  "contract",          // Execução de contrato
] as const;

export type LGPDLegalBasis = typeof LGPDLegalBases[number];

export const DataCategories = [
  "personal_identification", // CPF, RG, Nome
  "health_data",             // Dados de saúde
  "financial_data",          // Dados financeiros
  "contact_information",     // Telefone, email
  "behavioral_data",         // Preferências, histórico
  "sensitive_data",          // Dados sensíveis
  "biometric_data",          // Dados biométricos
  "location_data",           // Dados de localização
] as const;

export type DataCategory = typeof DataCategories[number];

export const ConsentPurposes = [
  "medical_treatment",       // Tratamento médico
  "appointment_scheduling",  // Agendamento
  "financial_processing",    // Processamento financeiro
  "marketing_communication", // Comunicação de marketing
  "service_improvement",     // Melhoria do serviço
  "legal_compliance",        // Conformidade legal
  "emergency_access",        // Acesso emergencial
] as const;

export type ConsentPurpose = typeof ConsentPurposes[number];

export interface LGPDConsent {
  id: string;
  patientId: string;
  legalBasis: LGPDLegalBasis;
  purpose: ConsentPurpose;
  dataCategories: DataCategory[];
  consentGiven: boolean;
  consentDate: string;
  consentMethod: 'digital_signature' | 'checkbox' | 'verbal' | 'written';
  consentText: string;
  withdrawalDate?: string;
  withdrawalReason?: string;
  retentionPeriod: number; // days
  dataMinimization: boolean;
  thirdPartySharing: boolean;
  internationalTransfer: boolean;
  auditTrail: AuditTrailEntry[];
}

export interface DataSubjectRequest {
  id: string;
  patientId: string;
  requestType: 'access' | 'rectification' | 'erasure' | 'portability' | 'restriction' | 'objection';
  requestDate: string;
  requestDescription: string;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  responseDate?: string;
  responseData?: any;
  legalJustification?: string;
  processedBy: string;
  auditTrail: AuditTrailEntry[];
}

// =============================================================================
// EMERGENCY MEDICAL PROTOCOLS TYPES
// =============================================================================

export const EmergencyClassifications = [
  "red",    // Emergência - Risco iminente de vida
  "yellow", // Urgência - Risco de vida se não atendido rapidamente  
  "green",  // Pouco urgente - Pode aguardar
  "blue",   // Não urgente - Consulta eletiva
  "white",  // Não urgente - Orientação
] as const;

export type EmergencyClassification = typeof EmergencyClassifications[number];

export const EmergencyProtocolTypes = [
  "cardiac_arrest",       // Parada cardíaca
  "respiratory_failure",  // Insuficiência respiratória
  "trauma",              // Trauma
  "stroke",              // AVC
  "anaphylaxis",         // Anafilaxia
  "poisoning",           // Intoxicação
  "burn",                // Queimadura
  "psychiatric_emergency", // Emergência psiquiátrica
  "obstetric_emergency",  // Emergência obstétrica
  "pediatric_emergency",  // Emergência pediátrica
] as const;

export type EmergencyProtocolType = typeof EmergencyProtocolTypes[number];

export interface EmergencyProtocol {
  id: string;
  type: EmergencyProtocolType;
  name: string;
  description: string;
  classification: EmergencyClassification;
  responseTime: number; // minutes
  requiredPersonnel: string[];
  requiredEquipment: string[];
  medications: string[];
  steps: EmergencyStep[];
  contraindications: string[];
  followUpRequired: boolean;
  samuProtocol: boolean;
  lastUpdated: string;
  approvedBy: string;
}

export interface EmergencyStep {
  order: number;
  instruction: string;
  timeLimit?: number; // minutes
  criticalStep: boolean;
  requiredSkill?: string;
  documentation: string;
}

export interface EmergencyAccess {
  id: string;
  patientId: string;
  requestingUserId: string;
  emergencyType: EmergencyProtocolType;
  classification: EmergencyClassification;
  justification: string;
  location: string;
  requestedAt: string;
  approvedAt?: string;
  approvedBy?: string;
  expiresAt: string;
  status: 'pending' | 'approved' | 'denied' | 'expired' | 'used';
  accessLog: EmergencyAccessLog[];
}

export interface EmergencyAccessLog {
  timestamp: string;
  userId: string;
  action: string;
  dataAccessed: string[];
  justification: string;
  ipAddress: string;
  deviceInfo: string;
}

// =============================================================================
// COMPLIANCE MONITORING & REPORTING TYPES
// =============================================================================

export const ComplianceAreas = [
  "cfm_registration",    // Registro CFM
  "anvisa_controlled",   // Substâncias controladas ANVISA
  "lgpd_privacy",        // Privacidade LGPD
  "emergency_protocols", // Protocolos emergência
  "audit_trail",         // Trilha de auditoria
  "data_security",       // Segurança de dados
] as const;

export type ComplianceArea = typeof ComplianceAreas[number];

export const ComplianceStatus = [
  "compliant",     // Conforme
  "non_compliant", // Não conforme
  "pending",       // Pendente
  "warning",       // Aviso
  "critical",      // Crítico
] as const;

export type ComplianceStatus = typeof ComplianceStatus[number];

export interface ComplianceScore {
  id: string;
  clinicId: string;
  area: ComplianceArea;
  score: number; // 0.0 to 100.0
  status: ComplianceStatus;
  findings: ComplianceFinding[];
  lastAssessed: string;
  nextAssessment: string;
  assessedBy: string;
  improvementPlan?: string[];
}

export interface ComplianceFinding {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  regulation: string; // CFM, ANVISA, LGPD, etc.
  recommendation: string;
  deadline?: string;
  status: 'open' | 'in_progress' | 'resolved' | 'accepted_risk';
  assignedTo?: string;
  evidence: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AuditTrailEntry {
  id: string;
  timestamp: string;
  userId: string;
  userType: 'patient' | 'staff' | 'system' | 'external';
  action: string;
  resource: string;
  resourceId?: string;
  details: Record<string, any>;
  ipAddress?: string;
  deviceInfo?: string;
  legalBasis?: LGPDLegalBasis;
  dataCategories?: DataCategory[];
  success: boolean;
  errorMessage?: string;
}

export interface ComplianceReport {
  id: string;
  clinicId: string;
  reportType: 'monthly' | 'quarterly' | 'annual' | 'ad_hoc';
  period: {
    startDate: string;
    endDate: string;
  };
  overallScore: number;
  areaScores: ComplianceScore[];
  findings: ComplianceFinding[];
  recommendations: string[];
  generatedAt: string;
  generatedBy: string;
  approvedBy?: string;
  regulatoryBodies: string[]; // CFM, ANVISA, ANPD
  submittedAt?: string;
  acknowledgmentReceived?: boolean;
}

// =============================================================================
// MOBILE COMPLIANCE INTERFACE TYPES
// =============================================================================

export interface MobileComplianceAlert {
  id: string;
  type: 'validation_needed' | 'renewal_due' | 'stock_low' | 'audit_required' | 'emergency_access';
  severity: 'info' | 'warning' | 'error' | 'critical';
  title: string;
  message: string;
  actionRequired: boolean;
  actionUrl?: string;
  expiresAt?: string;
  acknowledged: boolean;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  createdAt: string;
}

export interface QuickComplianceCheck {
  cfmRegistrations: {
    total: number;
    active: number;
    expiringSoon: number; // within 30 days
    suspended: number;
  };
  anvisaCompliance: {
    controlledSubstances: number;
    expiredPrescriptions: number;
    lowStockItems: number;
    auditDue: boolean;
  };
  lgpdCompliance: {
    pendingConsents: number;
    dataSubjectRequests: number;
    retentionViolations: number;
    overallScore: number;
  };
  emergencyProtocols: {
    activeAccesses: number;
    expiredAccesses: number;
    protocolsOutdated: number;
  };
  lastUpdated: string;
}

// =============================================================================
// ZOD SCHEMAS FOR VALIDATION
// =============================================================================

export const CFMRegistrationSchema = z.object({
  id: z.string(),
  crm: z.string().regex(/^CRM-[A-Z]{2}-\d{6}$/, "Invalid CRM format"),
  state: z.enum(BrazilianStates),
  doctorName: z.string().min(3),
  cpf: z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, "Invalid CPF format"),
  status: z.enum(ProfessionalStatus),
  registrationDate: z.string(),
  renewalDate: z.string(),
  specialties: z.array(z.enum(MedicalSpecialties)),
  emergencyQualified: z.boolean(),
});

export const LGPDConsentSchema = z.object({
  id: z.string(),
  patientId: z.string(),
  legalBasis: z.enum(LGPDLegalBases),
  purpose: z.enum(ConsentPurposes),
  dataCategories: z.array(z.enum(DataCategories)),
  consentGiven: z.boolean(),
  consentDate: z.string(),
  retentionPeriod: z.number().min(1),
});

export const EmergencyAccessSchema = z.object({
  id: z.string(),
  patientId: z.string(),
  requestingUserId: z.string(),
  emergencyType: z.enum(EmergencyProtocolTypes),
  classification: z.enum(EmergencyClassifications),
  justification: z.string().min(20),
  location: z.string().min(3),
});

// =============================================================================
// UTILITY TYPES
// =============================================================================

export interface ComplianceContextProvider {
  children: React.ReactNode;
  clinicId: string;
  userId: string;
  userRole: 'admin' | 'doctor' | 'nurse' | 'staff';
}

export interface ComplianceHookOptions {
  autoRefresh?: boolean;
  refreshInterval?: number; // seconds
  enableNotifications?: boolean;
}