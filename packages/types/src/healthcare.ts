// Healthcare Domain Types
// Common fields: id: string, createdAt: Date, updatedAt: Date, deletedAt?: Date | null

// Treatment-related types
export interface TreatmentPlan {
  id: string
  patientId: string
  startDate: Date
  endDate?: Date
  status: 'draft' | 'active' | 'completed'
  procedures: TreatmentProcedure[]
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date | null
}

export interface TreatmentSession {
  id: string
  planId: string
  date: Date
  duration: number
  notes?: string
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date | null
}

export interface TreatmentProcedure {
  id: string
  name: string
  description?: string
  duration: number
  cost?: number
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date | null
}

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

export interface TreatmentRecommendation {
  id: string
  patientId: string
  procedureId: string
  reason: string
  priority: 'low' | 'medium' | 'high'
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date | null
}

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
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date | null
}

export interface ComplianceRequirement {
  id: string
  categoryId: string
  description: string
  status: 'met' | 'pending' | 'failed'
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date | null
}

export interface ComplianceAssessment {
  id: string
  requirementId: string
  assessorId: string
  score: number
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
  type: 'access' | 'deletion' | 'correction'
  status: 'pending' | 'processed'
  requestedAt: Date
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date | null
}

// Inventory-related types
export interface InventoryCategory {
  id: string
  name: string
  description: string
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date | null
}

export interface Product {
  id: string
  categoryId: string
  name: string
  sku: string
  price: number
  stock: number
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date | null
}

export interface InventoryBatch {
  id: string
  productId: string
  batchNumber: string
  expiryDate: Date
  quantity: number
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date | null
}
