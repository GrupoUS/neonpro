// Regulatory Documents API Types
// Based on Story 12.1 - Gestão de Documentação Regulatória

export interface RegulationCategory {
  id: string
  name: string
  authority_name: string
  authority_code: string
  description: string | null
  requirements: string | null
  renewal_period_months: number | null
  is_mandatory: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface RegulatoryDocument {
  id: string
  clinic_id: string
  document_type: string
  document_category: string
  authority: string
  document_number: string | null
  issue_date: string
  expiration_date: string | null
  status: 'valid' | 'expiring' | 'expired' | 'pending'
  file_url: string | null
  file_name: string | null
  file_size: number | null
  version: string
  associated_professional_id: string | null
  associated_equipment_id: string | null
  created_by: string
  updated_by: string
  created_at: string
  updated_at: string
  // Relations
  regulation_categories?: RegulationCategory
  document_versions?: DocumentVersion[]
  compliance_alerts?: ComplianceAlert[]
}

export interface DocumentVersion {
  id: string
  document_id: string
  version: string
  file_url: string
  change_reason: string | null
  created_by: string
  created_at: string
  // Relations
  profiles?: { full_name: string }
}

export interface ComplianceAlert {
  id: string
  document_id: string | null
  alert_type: '90_days_before' | '30_days_before' | '7_days_before' | 'expired' | 'training_due' | 'document_review'
  alert_date: string
  message: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  target_department: string | null
  is_automated: boolean
  sent_at: string | null
  acknowledged_at: string | null
  acknowledged_by: string | null
  acknowledgment_note: string | null
  created_at: string
  // Relations
  regulatory_documents?: RegulatoryDocument
}

// API Request/Response Types

export interface CreateDocumentRequest {
  document_type: string
  document_category: string
  authority: string
  document_number?: string
  issue_date: string
  expiration_date?: string
  status?: 'valid' | 'expiring' | 'expired' | 'pending'
  file_url?: string
  file_name?: string
  file_size?: number
  version?: string
  associated_professional_id?: string
  associated_equipment_id?: string
}

export interface UpdateDocumentRequest {
  document_type?: string
  document_category?: string
  authority?: string
  document_number?: string
  issue_date?: string
  expiration_date?: string
  status?: 'valid' | 'expiring' | 'expired' | 'pending'
  file_url?: string
  file_name?: string
  file_size?: number
  version?: string
  associated_professional_id?: string
  associated_equipment_id?: string
  change_reason?: string
}

export interface ListDocumentsRequest {
  page?: number
  limit?: number
  category?: string
  status?: 'valid' | 'expiring' | 'expired' | 'pending'
  search?: string
}

export interface ListDocumentsResponse {
  documents: RegulatoryDocument[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

export interface ListCategoriesRequest {
  authority?: string
  search?: string
}

export interface ListCategoriesResponse {
  categories: RegulationCategory[]
  groupedCategories: Record<string, RegulationCategory[]>
}

export interface ListAlertsRequest {
  page?: number
  limit?: number
  alert_type?: '90_days_before' | '30_days_before' | '7_days_before' | 'expired' | 'training_due' | 'document_review'
  status?: 'pending' | 'sent' | 'acknowledged'
  priority?: 'low' | 'medium' | 'high' | 'critical'
}

export interface ListAlertsResponse {
  alerts: ComplianceAlert[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

export interface AcknowledgeAlertRequest {
  alert_id: string
  acknowledgment_note?: string
}

export interface FileUploadRequest {
  file: File
  document_id?: string
  category?: string
}

export interface FileUploadResponse {
  success: boolean
  file: {
    name: string
    size: number
    type: string
    url: string
    path: string
  }
  message: string
}

export interface FileDeleteRequest {
  filePath: string
  documentId?: string
}

// Client-side hooks types
export interface UseDocumentsOptions {
  page?: number
  limit?: number
  category?: string
  status?: 'valid' | 'expiring' | 'expired' | 'pending'
  search?: string
}

export interface UseAlertsOptions {
  page?: number
  limit?: number
  alert_type?: '90_days_before' | '30_days_before' | '7_days_before' | 'expired' | 'training_due' | 'document_review'
  status?: 'pending' | 'sent' | 'acknowledged'
  priority?: 'low' | 'medium' | 'high' | 'critical'
}

// Dashboard summary types
export interface ComplianceSummary {
  total_documents: number
  valid_documents: number
  expiring_documents: number
  expired_documents: number
  pending_documents: number
  total_alerts: number
  critical_alerts: number
  high_priority_alerts: number
  unacknowledged_alerts: number
  compliance_rate: number
}

// Document status helpers
export const DocumentStatusLabels = {
  valid: 'Válido',
  expiring: 'Expirando',
  expired: 'Expirado',
  pending: 'Pendente'
} as const

export const AlertTypeLabels = {
  '90_days_before': '90 dias para expirar',
  '30_days_before': '30 dias para expirar',
  '7_days_before': '7 dias para expirar',
  expired: 'Documento expirado',
  training_due: 'Treinamento pendente',
  document_review: 'Revisão de documento'
} as const

export const PriorityLabels = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
  critical: 'Crítica'
} as const

// Utility functions for status checks
export const isDocumentExpiring = (doc: RegulatoryDocument): boolean => {
  if (!doc.expiration_date) return false
  const expirationDate = new Date(doc.expiration_date)
  const now = new Date()
  const daysUntilExpiration = Math.ceil((expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  return daysUntilExpiration <= 30 && daysUntilExpiration > 0
}

export const isDocumentExpired = (doc: RegulatoryDocument): boolean => {
  if (!doc.expiration_date) return false
  const expirationDate = new Date(doc.expiration_date)
  const now = new Date()
  return expirationDate < now
}

export const getDocumentStatusColor = (status: RegulatoryDocument['status']): string => {
  switch (status) {
    case 'valid': return 'text-green-600'
    case 'expiring': return 'text-yellow-600'
    case 'expired': return 'text-red-600'
    case 'pending': return 'text-gray-600'
    default: return 'text-gray-600'
  }
}

export const getAlertPriorityColor = (priority: ComplianceAlert['priority']): string => {
  switch (priority) {
    case 'low': return 'text-blue-600'
    case 'medium': return 'text-yellow-600'
    case 'high': return 'text-orange-600'
    case 'critical': return 'text-red-600'
    default: return 'text-gray-600'
  }
}