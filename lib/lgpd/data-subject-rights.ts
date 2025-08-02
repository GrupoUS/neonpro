import { z } from 'zod'
import { AuditLogger, DataProcessingActivity } from './audit-logger'

/**
 * LGPD Data Subject Rights Implementation
 * Implements all rights guaranteed to data subjects under LGPD Articles 18-22
 */

// Types of rights requests under LGPD
export enum DataSubjectRight {
  ACCESS = 'access',                           // Art. 18, I - Right to access data
  RECTIFICATION = 'rectification',             // Art. 18, III - Right to correct data
  ERASURE = 'erasure',                         // Art. 18, VI - Right to be forgotten
  PORTABILITY = 'portability',                 // Art. 18, V - Right to data portability
  RESTRICT_PROCESSING = 'restrict_processing', // Art. 18, IV - Right to restrict processing
  OBJECT_PROCESSING = 'object_processing',     // Art. 18, § 2º - Right to object
  WITHDRAW_CONSENT = 'withdraw_consent',       // Art. 8, § 5º - Right to withdraw consent
  INFORMATION = 'information'                  // Art. 18, II - Right to information about processing
}

// Status of rights requests
export enum RequestStatus {
  SUBMITTED = 'submitted',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  REJECTED = 'rejected',
  PARTIALLY_COMPLETED = 'partially_completed'
}

// Data subject rights request schema
export const dataSubjectRequestSchema = z.object({
  id: z.string().uuid().optional(),
  
  // Request identification
  requestType: z.nativeEnum(DataSubjectRight),
  status: z.nativeEnum(RequestStatus).default(RequestStatus.SUBMITTED),
  
  // Data subject information
  dataSubjectId: z.string().uuid(),
  dataSubjectEmail: z.string().email(),
  dataSubjectName: z.string(),
  
  // Request details
  description: z.string().min(10, 'Descrição da solicitação é obrigatória'),
  specificData: z.array(z.string()).optional(), // Specific data categories requested
  
  // Legal and procedural
  legalBasis: z.string().optional(),
  urgency: z.enum(['normal', 'urgent']).default('normal'),
  
  // Processing information
  submittedAt: z.date().default(() => new Date()),
  processedAt: z.date().optional(),
  completedAt: z.date().optional(),
  deadline: z.date(), // LGPD requires response within reasonable time
  
  // Assignee and processing
  assignedTo: z.string().uuid().optional(),
  processingNotes: z.array(z.object({
    timestamp: z.date(),
    userId: z.string().uuid(),
    note: z.string(),
    action: z.string().optional()
  })).default([]),
  
  // Results
  resultSummary: z.string().optional(),
  documentsGenerated: z.array(z.object({
    type: z.string(),
    filename: z.string(),
    path: z.string(),
    generatedAt: z.date()
  })).default([]),
  
  // Communication
  communicationHistory: z.array(z.object({
    timestamp: z.date(),
    method: z.enum(['email', 'phone', 'letter', 'in_person']),
    direction: z.enum(['inbound', 'outbound']),
    summary: z.string()
  })).default([]),
  
  // Identity verification
  identityVerified: z.boolean().default(false),
  verificationMethod: z.enum(['document', 'biometric', 'knowledge_based', 'in_person']).optional(),
  verificationDate: z.date().optional(),
  
  // Metadata
  ipAddress: z.string().regex(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/, 'IP inválido').optional(),
  userAgent: z.string().optional(),
  source: z.enum(['web', 'email', 'phone', 'letter', 'in_person']).default('web'),
  
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date())
})

export type DataSubjectRequest = z.infer<typeof dataSubjectRequestSchema>

export class DataSubjectRightsManager {
  /**
   * Submit a new data subject rights request
   */
  static async submitRequest(params: {
    requestType: DataSubjectRight
    dataSubjectId: string
    dataSubjectEmail: string
    dataSubjectName: string
    description: string
    specificData?: string[]
    urgency?: 'normal' | 'urgent'
    ipAddress?: string
    userAgent?: string
    source?: 'web' | 'email' | 'phone' | 'letter' | 'in_person'
  }): Promise<DataSubjectRequest> {
    // Calculate deadline based on LGPD requirements (15 days standard, can be extended to 30)
    const deadline = new Date()
    deadline.setDate(deadline.getDate() + (params.urgency === 'urgent' ? 5 : 15))

    const request: DataSubjectRequest = {
      id: crypto.randomUUID(),
      requestType: params.requestType,
      status: RequestStatus.SUBMITTED,
      dataSubjectId: params.dataSubjectId,
      dataSubjectEmail: params.dataSubjectEmail,
      dataSubjectName: params.dataSubjectName,
      description: params.description,
      specificData: params.specificData,
      urgency: params.urgency || 'normal',
      submittedAt: new Date(),
      deadline,
      processingNotes: [],
      documentsGenerated: [],
      communicationHistory: [],
      identityVerified: false,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      source: params.source || 'web',
      createdAt: new Date(),
      updatedAt: new Date()
    }

    // Validate request
    const validated = dataSubjectRequestSchema.parse(request)
    
    // Log the request submission
    await AuditLogger.log({
      activity: DataProcessingActivity.PATIENT_READ, // Will be updated when we add rights-specific activities
      description: `Data subject rights request submitted: ${params.requestType}`,
      actorId: params.dataSubjectId,
      actorType: 'user',
      dataSubjectId: params.dataSubjectId,
      dataSubjectType: 'patient',
      dataCategories: ['personal_data', 'request_metadata'],
      legalBasis: 'legal_obligation',
      purpose: 'Processamento de solicitação de direitos do titular conforme LGPD',
      ipAddress: params.ipAddress || '127.0.0.1',
      userAgent: params.userAgent,
      source: params.source || 'web',
      success: true,
      recordsAffected: 1
    })

    // TODO: Store in database
    console.log('Data subject request submitted:', validated)
    
    // Send confirmation email
    await this.sendConfirmationEmail(validated)
    
    return validated
  }

  /**
   * Process right to access request (most common)
   */
  static async processAccessRequest(requestId: string, processorId: string): Promise<{
    personalData: Record<string, any>
    processingActivities: Array<{
      purpose: string
      legalBasis: string
      dataCategories: string[]
      retentionPeriod: string
      thirdParties?: string[]
    }>
    consentStatus: Record<string, any>
    auditTrail: Array<{
      timestamp: Date
      activity: string
      purpose: string
    }>
  }> {
    // TODO: Retrieve comprehensive data for the subject
    const personalData = await this.getPersonalData(requestId)
    const processingActivities = await this.getProcessingActivities(requestId)
    const consentStatus = await this.getConsentStatus(requestId)
    const auditTrail = await this.getAuditTrail(requestId)

    // Generate data access report
    const report = {
      personalData,
      processingActivities,
      consentStatus,
      auditTrail
    }

    // Update request status
    await this.updateRequestStatus(requestId, RequestStatus.COMPLETED, processorId)
    
    // Log completion
    await AuditLogger.log({
      activity: DataProcessingActivity.DATA_PORTABILITY,
      description: 'Data access request completed',
      actorId: processorId,
      actorType: 'user',
      dataCategories: ['all_personal_data'],
      legalBasis: 'legal_obligation',
      purpose: 'Atendimento ao direito de acesso do titular',
      ipAddress: '127.0.0.1', // System IP
      source: 'system',
      success: true,
      recordsAffected: 1
    })

    return report
  }

  /**
   * Process right to erasure ("right to be forgotten")
   */
  static async processErasureRequest(
    requestId: string,
    processorId: string,
    justification: string
  ): Promise<{
    success: boolean
    itemsErased: number
    itemsRetained: number
    retentionReasons: Array<{
      item: string
      reason: string
      legalBasis: string
    }>
  }> {
    const request = await this.getRequest(requestId)
    if (!request) throw new Error('Request not found')

    // Determine what can be erased vs what must be retained
    const erasureAnalysis = await this.analyzeErasureRequest(request.dataSubjectId)
    
    let itemsErased = 0
    let itemsRetained = 0
    const retentionReasons: Array<{ item: string; reason: string; legalBasis: string }> = []

    // Process erasure for items that can be deleted
    for (const item of erasureAnalysis.canErase) {
      try {
        await this.eraseDataItem(item.id, item.type)
        itemsErased++
      } catch (error) {
        console.error('Failed to erase item:', item, error)
      }
    }

    // Document items that must be retained
    for (const item of erasureAnalysis.mustRetain) {
      itemsRetained++
      retentionReasons.push({
        item: item.description,
        reason: item.retentionReason,
        legalBasis: item.legalBasis
      })
    }

    const success = itemsErased > 0 || erasureAnalysis.canErase.length === 0

    // Update request status
    await this.updateRequestStatus(
      requestId, 
      success ? RequestStatus.COMPLETED : RequestStatus.PARTIALLY_COMPLETED,
      processorId
    )

    // Log erasure completion
    await AuditLogger.log({
      activity: DataProcessingActivity.RIGHT_TO_BE_FORGOTTEN,
      description: `Right to erasure processed: ${itemsErased} items erased, ${itemsRetained} retained`,
      actorId: processorId,
      actorType: 'user',
      dataSubjectId: request.dataSubjectId,
      dataSubjectType: 'patient',
      dataCategories: ['personal_data'],
      legalBasis: 'legal_obligation',
      purpose: 'Atendimento ao direito de eliminação do titular',
      ipAddress: '127.0.0.1',
      source: 'system',
      success,
      recordsAffected: itemsErased,
      metadata: { 
        justification,
        itemsRetained,
        retentionReasons: retentionReasons.length
      }
    })

    return {
      success,
      itemsErased,
      itemsRetained,
      retentionReasons
    }
  }

  /**
   * Process data portability request
   */
  static async processPortabilityRequest(
    requestId: string,
    processorId: string,
    format: 'json' | 'xml' | 'csv' = 'json'
  ): Promise<{
    downloadUrl: string
    expiresAt: Date
    fileSize: number
    recordsIncluded: number
  }> {
    const request = await this.getRequest(requestId)
    if (!request) throw new Error('Request not found')

    // Extract portable data (machine-readable format)
    const portableData = await this.extractPortableData(request.dataSubjectId, format)
    
    // Generate secure download link (expires in 7 days)
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)
    
    const downloadUrl = await this.generateSecureDownloadLink(portableData, expiresAt)

    await this.updateRequestStatus(requestId, RequestStatus.COMPLETED, processorId)

    // Log portability completion
    await AuditLogger.log({
      activity: DataProcessingActivity.DATA_PORTABILITY,
      description: `Data portability request completed in ${format} format`,
      actorId: processorId,
      actorType: 'user',
      dataSubjectId: request.dataSubjectId,
      dataSubjectType: 'patient',
      dataCategories: ['portable_data'],
      legalBasis: 'legal_obligation',
      purpose: 'Atendimento ao direito de portabilidade do titular',
      ipAddress: '127.0.0.1',
      source: 'system',
      success: true,
      recordsAffected: portableData.recordsIncluded,
      metadata: { format, fileSize: portableData.fileSize }
    })

    return {
      downloadUrl,
      expiresAt,
      fileSize: portableData.fileSize,
      recordsIncluded: portableData.recordsIncluded
    }
  }

  /**
   * Get all pending requests that are approaching deadline
   */
  static async getOverdueRequests(): Promise<Array<{
    request: DataSubjectRequest
    daysOverdue: number
    escalationLevel: 'warning' | 'critical'
  }>> {
    // TODO: Query database for overdue requests
    return []
  }

  /**
   * Generate monthly compliance report
   */
  static async generateComplianceReport(month: Date): Promise<{
    totalRequests: number
    requestsByType: Record<DataSubjectRight, number>
    averageResponseTime: number
    overdueRequests: number
    completionRate: number
    commonIssues: string[]
    recommendations: string[]
  }> {
    // TODO: Generate comprehensive compliance report
    return {
      totalRequests: 0,
      requestsByType: {} as Record<DataSubjectRight, number>,
      averageResponseTime: 0,
      overdueRequests: 0,
      completionRate: 0,
      commonIssues: [],
      recommendations: []
    }
  }

  // Private helper methods
  private static async getRequest(requestId: string): Promise<DataSubjectRequest | null> {
    // TODO: Query database
    return null
  }

  private static async getPersonalData(requestId: string): Promise<Record<string, any>> {
    // TODO: Compile all personal data for the subject
    return {}
  }

  private static async getProcessingActivities(requestId: string): Promise<Array<{
    purpose: string
    legalBasis: string
    dataCategories: string[]
    retentionPeriod: string
    thirdParties?: string[]
  }>> {
    // TODO: Get all processing activities
    return []
  }

  private static async getConsentStatus(requestId: string): Promise<Record<string, any>> {
    // TODO: Get current consent status
    return {}
  }

  private static async getAuditTrail(requestId: string): Promise<Array<{
    timestamp: Date
    activity: string
    purpose: string
  }>> {
    // TODO: Get relevant audit trail
    return []
  }

  private static async updateRequestStatus(
    requestId: string,
    status: RequestStatus,
    processorId: string
  ): Promise<void> {
    // TODO: Update request in database
    console.log(`Request ${requestId} updated to ${status} by ${processorId}`)
  }

  private static async analyzeErasureRequest(dataSubjectId: string): Promise<{
    canErase: Array<{ id: string; type: string; description: string }>
    mustRetain: Array<{ 
      id: string
      type: string
      description: string
      retentionReason: string
      legalBasis: string
    }>
  }> {
    // TODO: Analyze what data can be erased vs retained
    return { canErase: [], mustRetain: [] }
  }

  private static async eraseDataItem(id: string, type: string): Promise<void> {
    // TODO: Safely erase data item
    console.log(`Erasing ${type} item ${id}`)
  }

  private static async extractPortableData(
    dataSubjectId: string,
    format: string
  ): Promise<{ fileSize: number; recordsIncluded: number; data: any }> {
    // TODO: Extract data in portable format
    return { fileSize: 0, recordsIncluded: 0, data: {} }
  }

  private static async generateSecureDownloadLink(
    data: any,
    expiresAt: Date
  ): Promise<string> {
    // TODO: Generate secure, temporary download link
    return `https://secure.clinic.com/download/${crypto.randomUUID()}`
  }

  private static async sendConfirmationEmail(request: DataSubjectRequest): Promise<void> {
    // TODO: Send confirmation email to data subject
    console.log(`Confirmation email sent for request ${request.id}`)
  }
}

/**
 * Standard response times for different request types (in days)
 */
export const STANDARD_RESPONSE_TIMES = {
  [DataSubjectRight.ACCESS]: 15,
  [DataSubjectRight.RECTIFICATION]: 15,
  [DataSubjectRight.ERASURE]: 15,
  [DataSubjectRight.PORTABILITY]: 15,
  [DataSubjectRight.RESTRICT_PROCESSING]: 5,
  [DataSubjectRight.OBJECT_PROCESSING]: 10,
  [DataSubjectRight.WITHDRAW_CONSENT]: 1,
  [DataSubjectRight.INFORMATION]: 15
}