// Healthcare-specific types for Brazilian market
// Consolidated from @neonpro/brazilian-healthcare-ui

export interface PatientInfo {
  id: string;
  name: string;
  cpf: string;
  sus?: string; // Sistema Único de Saúde number
  phone: string;
  email?: string;
  birthDate: string;
  gender: "M" | "F" | "O";
  address: Address;
  emergencyContact: EmergencyContact;
  lgpdConsent: LGPDConsent;
  isActive: boolean;
}

export interface Address {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  cep: string;
  region: "Norte" | "Nordeste" | "Centro-Oeste" | "Sudeste" | "Sul";
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  alternativePhone?: string;
}

export interface LGPDConsent {
  dataProcessing: boolean;
  marketing: boolean;
  dataSharing: boolean;
  consentDate: string;
  consentVersion: string;
  ipAddress: string;
  userAgent: string;
}

export interface HealthcareProfessional {
  id: string;
  name: string;
  crm: string; // Conselho Regional de Medicina
  specialty: string;
  phone: string;
  email: string;
  isActive: boolean;
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  professionalId: string;
  date: string;
  type: "consultation" | "exam" | "procedure" | "prescription";
  description: string;
  attachments?: MedicalAttachment[];
  lgpdClassification: "public" | "internal" | "confidential" | "restricted";
}

export interface MedicalAttachment {
  id: string;
  filename: string;
  type: string;
  size: number;
  url: string;
  uploadDate: string;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  anvisaCode?: string; // ANVISA registration code
}

export interface EmergencyAlert {
  id: string;
  title: string;
  message: string;
  severity: "low" | "medium" | "high" | "critical";
  timestamp: string;
  patientId?: string;
  acknowledged: boolean;
}

export interface ConnectivityLevel {
  type: "2G" | "3G" | "4G" | "5G" | "wifi";
  strength: "weak" | "fair" | "good" | "excellent";
  latency?: number;
  bandwidth?: number;
}

export interface RegionalSettings {
  region: string;
  language: string;
  timezone: string;
  currency: string;
  flag: string;
  textDirection?: "ltr" | "rtl";
  highContrast?: boolean;
  accessibility?: AccessibilityOptions;
}

export interface AccessibilityOptions {
  screenReader: boolean;
  highContrast: boolean;
  largeText: boolean;
  reducedMotion: boolean;
  keyboardNavigation: boolean;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  action: string;
  userId: string;
  details: Record<string, any>;
  ipAddress: string;
  userAgent: string;
}

export interface LGPDCompliance {
  consentStatus: "granted" | "denied" | "pending" | "expired";
  dataCategories: string[];
  processingPurposes: string[];
  retentionPeriod: string;
  lastReview: string;
  nextReview: string;
}

// Brazilian healthcare-specific enums
export enum BrazilianStates {
  AC = "Acre",
  AL = "Alagoas",
  AP = "Amapá",
  AM = "Amazonas",
  BA = "Bahia",
  CE = "Ceará",
  DF = "Distrito Federal",
  ES = "Espírito Santo",
  GO = "Goiás",
  MA = "Maranhão",
  MT = "Mato Grosso",
  MS = "Mato Grosso do Sul",
  MG = "Minas Gerais",
  PA = "Pará",
  PB = "Paraíba",
  PR = "Paraná",
  PE = "Pernambuco",
  PI = "Piauí",
  RJ = "Rio de Janeiro",
  RN = "Rio Grande do Norte",
  RS = "Rio Grande do Sul",
  RO = "Rondônia",
  RR = "Roraima",
  SC = "Santa Catarina",
  SP = "São Paulo",
  SE = "Sergipe",
  TO = "Tocantins",
}

export enum MedicalSpecialties {
  CARDIOLOGIA = "Cardiologia",
  DERMATOLOGIA = "Dermatologia",
  ENDOCRINOLOGIA = "Endocrinologia",
  GASTROENTEROLOGIA = "Gastroenterologia",
  GINECOLOGIA = "Ginecologia",
  NEUROLOGIA = "Neurologia",
  OFTALMOLOGIA = "Oftalmologia",
  ORTOPEDIA = "Ortopedia",
  PEDIATRIA = "Pediatria",
  PSIQUIATRIA = "Psiquiatria",
  UROLOGIA = "Urologia",
  CLINICA_GERAL = "Clínica Geral",
}

export enum LGPDDataCategories {
  PERSONAL_DATA = "Dados Pessoais",
  SENSITIVE_DATA = "Dados Sensíveis",
  HEALTH_DATA = "Dados de Saúde",
  BIOMETRIC_DATA = "Dados Biométricos",
  GENETIC_DATA = "Dados Genéticos",
}

// Utility types
export type BrazilianCPF = string; // Format: XXX.XXX.XXX-XX
export type BrazilianCEP = string; // Format: XXXXX-XXX
export type BrazilianPhone = string; // Format: (XX) XXXXX-XXXX
export type SUSID = string; // Sistema Único de Saúde ID
export type CRMNumber = string; // Conselho Regional de Medicina number
