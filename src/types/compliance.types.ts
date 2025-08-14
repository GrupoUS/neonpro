// LGPD and Healthcare Compliance Types
export type ConsentType = 
  | 'DATA_PROCESSING' | 'MARKETING' | 'RESEARCH' 
  | 'THIRD_PARTY_SHARING' | 'MEDICAL_TREATMENT' | 'EMERGENCY_CONTACT'

export type ConsentStatus = 'GRANTED' | 'WITHDRAWN' | 'EXPIRED' | 'PENDING'

export interface ConsentRecord {
  id: string
  userId: string
  consentType: ConsentType
  status: ConsentStatus
  purpose: string
  legalBasis: string
  grantedAt?: string
  withdrawnAt?: string
  expiresAt?: string
  consentVersion: string
  ipAddress?: string
  userAgent?: string
  consentMethod?: 'WEB' | 'MOBILE' | 'VERBAL' | 'WRITTEN'
  createdAt: string
  updatedAt: string
}

export interface LGPDConfiguration {
  dataRetentionPeriod: number // days
  consentExpiryPeriod: number // days
  automaticDeletion: boolean
  dataMinimization: boolean
  pseudonymization: boolean
  encryption: {
    enabled: boolean
    algorithm: string
    keyRotationPeriod: number
  }
  rightToForgetting: boolean
  dataPortability: boolean
}

export interface PrivacySettings {
  id: string
  userId: string
  dataProcessingConsent: boolean
  marketingConsent: boolean
  researchConsent: boolean
  thirdPartySharing: boolean
  dataRetentionPeriod?: number
  automaticDeletion: boolean
  updatedAt: string
}

export interface DataSubjectRequest {
  id: string
  userId: string
  requestType: 'access' | 'rectification' | 'erasure' | 'portability' | 'restriction'
  description: string
  status: 'pending' | 'processing' | 'completed' | 'rejected'
  requestedAt: string
  processedAt?: string
  processedBy?: string
  response?: string
  documents?: string[]
}

export interface ANVISACompliance {
  facilityLicense: string
  responsibleTechnician: string
  sanitaryLicense: string
  lastInspection?: string
  nextInspection?: string
  certifications: string[]
  nonCompliantItems: string[]
}

export interface CFMCompliance {
  crmNumber: string
  medicalBoard: string
  licenseStatus: 'active' | 'suspended' | 'revoked'
  ethicsCompliance: boolean
  continuingEducation: {
    required: number
    completed: number
    period: string
  }
}