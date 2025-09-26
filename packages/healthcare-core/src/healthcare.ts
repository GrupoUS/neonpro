// Healthcare Domain Types
// Common fields: id: string, createdAt: Date, updatedAt: Date, deletedAt?: Date | null

// Treatment-related types are now exported from services/treatment-planning.ts

export interface TreatmentAssessment {
  id: string
  sessionId: string
  score: number
  observations: string
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date | null
}

export interface TreatmentProgressTracking {
  id: string
  planId: string
  milestone: string
  achieved: boolean
  date: Date
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date | null
}

// TreatmentRecommendation is now exported from services/treatment-planning.ts

export interface TreatmentDocument {
  id: string
  planId: string
  type: 'report' | 'consent'
  url: string
  uploadedAt: Date
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date | null
}

export interface TreatmentOutcome {
  id: string
  sessionId: string
  success: boolean
  feedback: string
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date | null
}

export interface TreatmentAssessmentTemplate {
  id: string
  name: string
  questions: string[]
  category: string
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date | null
}

// Compliance-related types
export interface ComplianceCategory {
  id: string
  name: string
  description: string
  framework: string
  regulatoryBody?: string
  isActive?: boolean
  version?: string
  lastUpdated?: Date
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date | null
}

export interface ComplianceRequirement {
  id: string
  categoryId: string
  title?: string
  description: string
  requirementType?: string
  mandatory?: boolean
  frequency?: string
  assessmentMethod?: string
  riskLevel?: string
  status: 'met' | 'pending' | 'failed'
  priority?: string
  dueDate?: Date
  documentationRequired?: boolean
  isActive?: boolean
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date | null
}

export interface ComplianceAssessment {
  id: string
  requirementId: string
  assessorId: string
  clinicId?: string
  score: number
  assessmentType?: string
  status?: string
  assessedAt?: Date
  assessedBy?: string
  nextAssessmentDate?: Date
  findings?: string[]
  recommendations?: string[]
  evidenceUrls?: string[]
  date: Date
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date | null
}

// Data privacy-related types
export interface DataConsentRecord {
  id: string
  userId: string
  type: 'opt-in' | 'opt-out'
  scope: string[]
  grantedAt: Date
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date | null
}

export interface DataSubjectRequest {
  id: string
  userId: string
  clientId?: string
  clinicId?: string
  type: 'access' | 'deletion' | 'correction'
  requestType?: string
  requestText?: string
  requestDescription?: string
  requestedData?: string[]
  status: 'pending' | 'processed' | 'in_progress' | 'completed' | 'rejected'
  responseText?: string
  processedBy?: string
  processedAt?: Date
  requestedAt: Date
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date | null
}

// Inventory-related types are now exported from services/inventory-management.ts
