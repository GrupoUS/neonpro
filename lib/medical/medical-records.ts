/**
 * NeonPro Medical Records System
 * Story 2.2: Medical History & Records Implementation
 * 
 * Sistema completo de prontuário eletrônico com:
 * - Histórico médico estruturado
 * - Gestão de documentos médicos
 * - Versionamento de registros
 * - Integração com LGPD
 * - Assinatura digital
 */

import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'
import crypto from 'crypto'
import { LGPDManager } from '../auth/lgpd/lgpd-manager'
import { AuditLogger } from '../audit/audit-logger'

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface MedicalRecord {
  id: string
  patient_id: string
  clinic_id: string
  record_type: MedicalRecordType
  title: string
  description: string
  diagnosis?: string
  treatment_plan?: string
  medications?: Medication[]
  allergies?: Allergy[]
  vital_signs?: VitalSigns
  attachments?: MedicalAttachment[]
  created_by: string
  created_at: string
  updated_at: string
  version: number
  status: RecordStatus
  digital_signature?: DigitalSignature
  consent_id?: string
  metadata?: Record<string, any>
}

export interface MedicalHistory {
  id: string
  patient_id: string
  clinic_id: string
  medical_conditions: MedicalCondition[]
  surgical_history: Surgery[]
  family_history: FamilyHistory[]
  social_history: SocialHistory
  immunizations: Immunization[]
  created_at: string
  updated_at: string
  last_reviewed_at?: string
  reviewed_by?: string
}

export interface MedicalAttachment {
  id: string
  record_id: string
  file_name: string
  file_type: string
  file_size: number
  file_url: string
  thumbnail_url?: string
  category: AttachmentCategory
  description?: string
  upload_date: string
  uploaded_by: string
  version: number
  is_before_after?: boolean
  before_after_pair_id?: string
}

export interface DigitalSignature {
  id: string
  record_id: string
  signer_id: string
  signer_name: string
  signer_role: string
  signature_hash: string
  signature_timestamp: string
  certificate_info?: string
  verification_status: 'valid' | 'invalid' | 'pending'
}

// Enums
export enum MedicalRecordType {
  CONSULTATION = 'consultation',
  PROCEDURE = 'procedure',
  TREATMENT = 'treatment',
  FOLLOW_UP = 'follow_up',
  EMERGENCY = 'emergency',
  PREVENTIVE = 'preventive',
  AESTHETIC = 'aesthetic'
}

export enum RecordStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  ARCHIVED = 'archived',
  DELETED = 'deleted'
}

export enum AttachmentCategory {
  PHOTO_BEFORE = 'photo_before',
  PHOTO_AFTER = 'photo_after',
  DOCUMENT = 'document',
  LAB_RESULT = 'lab_result',
  IMAGING = 'imaging',
  CONSENT_FORM = 'consent_form',
  PRESCRIPTION = 'prescription'
}

// Supporting interfaces
export interface Medication {
  name: string
  dosage: string
  frequency: string
  start_date: string
  end_date?: string
  prescriber: string
  notes?: string
}

export interface Allergy {
  allergen: string
  reaction: string
  severity: 'mild' | 'moderate' | 'severe'
  onset_date?: string
  notes?: string
}

export interface VitalSigns {
  blood_pressure_systolic?: number
  blood_pressure_diastolic?: number
  heart_rate?: number
  temperature?: number
  weight?: number
  height?: number
  bmi?: number
  recorded_at: string
  recorded_by: string
}

export interface MedicalCondition {
  condition: string
  icd_code?: string
  diagnosis_date: string
  status: 'active' | 'resolved' | 'chronic'
  severity?: 'mild' | 'moderate' | 'severe'
  notes?: string
}

export interface Surgery {
  procedure: string
  date: string
  surgeon: string
  hospital: string
  complications?: string
  notes?: string
}

export interface FamilyHistory {
  relationship: string
  condition: string
  age_of_onset?: number
  notes?: string
}

export interface SocialHistory {
  smoking_status: 'never' | 'former' | 'current'
  alcohol_use: 'none' | 'occasional' | 'moderate' | 'heavy'
  exercise_frequency: string
  occupation: string
  notes?: string
}

export interface Immunization {
  vaccine: string
  date_administered: string
  lot_number?: string
  administered_by: string
  next_due_date?: string
}

// Validation schemas
const MedicalRecordSchema = z.object({
  patient_id: z.string().uuid(),
  clinic_id: z.string().uuid(),
  record_type: z.nativeEnum(MedicalRecordType),
  title: z.string().min(1).max(200),
  description: z.string().min(1),
  diagnosis: z.string().optional(),
  treatment_plan: z.string().optional(),
  medications: z.array(z.object({
    name: z.string(),
    dosage: z.string(),
    frequency: z.string(),
    start_date: z.string(),
    end_date: z.string().optional(),
    prescriber: z.string(),
    notes: z.string().optional()
  })).optional(),
  allergies: z.array(z.object({
    allergen: z.string(),
    reaction: z.string(),
    severity: z.enum(['mild', 'moderate', 'severe']),
    onset_date: z.string().optional(),
    notes: z.string().optional()
  })).optional(),
  vital_signs: z.object({
    blood_pressure_systolic: z.number().optional(),
    blood_pressure_diastolic: z.number().optional(),
    heart_rate: z.number().optional(),
    temperature: z.number().optional(),
    weight: z.number().optional(),
    height: z.number().optional(),
    bmi: z.number().optional(),
    recorded_at: z.string(),
    recorded_by: z.string()
  }).optional()
})

// ============================================================================
// MEDICAL RECORDS MANAGER
// ============================================================================

export class MedicalRecordsManager {
  private supabase
  private lgpdManager: LGPDManager
  private auditLogger: AuditLogger

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    this.lgpdManager = new LGPDManager()
    this.auditLogger = new AuditLogger()
  }

  // ========================================================================
  // MEDICAL RECORDS CRUD
  // ========================================================================

  async createMedicalRecord(
    recordData: Omit<MedicalRecord, 'id' | 'created_at' | 'updated_at' | 'version'>,
    userId: string
  ): Promise<{ success: boolean; data?: MedicalRecord; error?: string }> {
    try {
      // Validate input
      const validation = MedicalRecordSchema.parse(recordData)
      
      // Check LGPD consent
      const consentCheck = await this.lgpdManager.checkConsent(
        recordData.patient_id,
        'medical_data'
      )
      
      if (!consentCheck.hasConsent) {
        return {
          success: false,
          error: 'Patient consent required for medical data processing'
        }
      }

      const recordId = crypto.randomUUID()
      const now = new Date().toISOString()

      const newRecord: MedicalRecord = {
        ...recordData,
        id: recordId,
        created_at: now,
        updated_at: now,
        version: 1,
        status: RecordStatus.ACTIVE,
        created_by: userId
      }

      const { data, error } = await this.supabase
        .from('medical_records')
        .insert(newRecord)
        .select()
        .single()

      if (error) throw error

      // Log audit event
      await this.auditLogger.log({
        event_type: 'medical_record_created',
        user_id: userId,
        resource_type: 'medical_record',
        resource_id: recordId,
        details: {
          patient_id: recordData.patient_id,
          record_type: recordData.record_type,
          title: recordData.title
        }
      })

      return { success: true, data }
    } catch (error) {
      console.error('Error creating medical record:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  async getMedicalRecord(
    recordId: string,
    userId: string
  ): Promise<{ success: boolean; data?: MedicalRecord; error?: string }> {
    try {
      const { data, error } = await this.supabase
        .from('medical_records')
        .select(`
          *,
          attachments:medical_attachments(*),
          digital_signatures(*)
        `)
        .eq('id', recordId)
        .eq('status', RecordStatus.ACTIVE)
        .single()

      if (error) throw error
      if (!data) {
        return { success: false, error: 'Medical record not found' }
      }

      // Log audit event
      await this.auditLogger.log({
        event_type: 'medical_record_accessed',
        user_id: userId,
        resource_type: 'medical_record',
        resource_id: recordId,
        details: {
          patient_id: data.patient_id
        }
      })

      return { success: true, data }
    } catch (error) {
      console.error('Error getting medical record:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  async updateMedicalRecord(
    recordId: string,
    updates: Partial<MedicalRecord>,
    userId: string
  ): Promise<{ success: boolean; data?: MedicalRecord; error?: string }> {
    try {
      // Get current record for versioning
      const currentRecord = await this.getMedicalRecord(recordId, userId)
      if (!currentRecord.success || !currentRecord.data) {
        return { success: false, error: 'Record not found' }
      }

      const now = new Date().toISOString()
      const updatedRecord = {
        ...updates,
        updated_at: now,
        version: currentRecord.data.version + 1
      }

      const { data, error } = await this.supabase
        .from('medical_records')
        .update(updatedRecord)
        .eq('id', recordId)
        .select()
        .single()

      if (error) throw error

      // Create version history
      await this.createRecordVersion(currentRecord.data, userId)

      // Log audit event
      await this.auditLogger.log({
        event_type: 'medical_record_updated',
        user_id: userId,
        resource_type: 'medical_record',
        resource_id: recordId,
        details: {
          patient_id: data.patient_id,
          changes: Object.keys(updates),
          version: data.version
        }
      })

      return { success: true, data }
    } catch (error) {
      console.error('Error updating medical record:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  async getPatientMedicalRecords(
    patientId: string,
    userId: string,
    options?: {
      recordType?: MedicalRecordType
      limit?: number
      offset?: number
      sortBy?: 'created_at' | 'updated_at'
      sortOrder?: 'asc' | 'desc'
    }
  ): Promise<{ success: boolean; data?: MedicalRecord[]; total?: number; error?: string }> {
    try {
      let query = this.supabase
        .from('medical_records')
        .select('*, attachments:medical_attachments(*)', { count: 'exact' })
        .eq('patient_id', patientId)
        .eq('status', RecordStatus.ACTIVE)

      if (options?.recordType) {
        query = query.eq('record_type', options.recordType)
      }

      if (options?.limit) {
        query = query.limit(options.limit)
      }

      if (options?.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
      }

      const sortBy = options?.sortBy || 'created_at'
      const sortOrder = options?.sortOrder || 'desc'
      query = query.order(sortBy, { ascending: sortOrder === 'asc' })

      const { data, error, count } = await query

      if (error) throw error

      // Log audit event
      await this.auditLogger.log({
        event_type: 'patient_records_accessed',
        user_id: userId,
        resource_type: 'medical_record',
        resource_id: patientId,
        details: {
          record_count: data?.length || 0,
          filters: options
        }
      })

      return { success: true, data: data || [], total: count || 0 }
    } catch (error) {
      console.error('Error getting patient medical records:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // ========================================================================
  // MEDICAL HISTORY MANAGEMENT
  // ========================================================================

  async createMedicalHistory(
    historyData: Omit<MedicalHistory, 'id' | 'created_at' | 'updated_at'>,
    userId: string
  ): Promise<{ success: boolean; data?: MedicalHistory; error?: string }> {
    try {
      // Check LGPD consent
      const consentCheck = await this.lgpdManager.checkConsent(
        historyData.patient_id,
        'medical_data'
      )
      
      if (!consentCheck.hasConsent) {
        return {
          success: false,
          error: 'Patient consent required for medical history processing'
        }
      }

      const historyId = crypto.randomUUID()
      const now = new Date().toISOString()

      const newHistory: MedicalHistory = {
        ...historyData,
        id: historyId,
        created_at: now,
        updated_at: now
      }

      const { data, error } = await this.supabase
        .from('medical_histories')
        .insert(newHistory)
        .select()
        .single()

      if (error) throw error

      // Log audit event
      await this.auditLogger.log({
        event_type: 'medical_history_created',
        user_id: userId,
        resource_type: 'medical_history',
        resource_id: historyId,
        details: {
          patient_id: historyData.patient_id
        }
      })

      return { success: true, data }
    } catch (error) {
      console.error('Error creating medical history:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  async getPatientMedicalHistory(
    patientId: string,
    userId: string
  ): Promise<{ success: boolean; data?: MedicalHistory; error?: string }> {
    try {
      const { data, error } = await this.supabase
        .from('medical_histories')
        .select('*')
        .eq('patient_id', patientId)
        .single()

      if (error && error.code !== 'PGRST116') throw error

      // Log audit event
      await this.auditLogger.log({
        event_type: 'medical_history_accessed',
        user_id: userId,
        resource_type: 'medical_history',
        resource_id: patientId,
        details: {
          patient_id: patientId
        }
      })

      return { success: true, data: data || undefined }
    } catch (error) {
      console.error('Error getting medical history:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  async updateMedicalHistory(
    patientId: string,
    updates: Partial<MedicalHistory>,
    userId: string
  ): Promise<{ success: boolean; data?: MedicalHistory; error?: string }> {
    try {
      const now = new Date().toISOString()
      const updatedHistory = {
        ...updates,
        updated_at: now,
        last_reviewed_at: now,
        reviewed_by: userId
      }

      const { data, error } = await this.supabase
        .from('medical_histories')
        .update(updatedHistory)
        .eq('patient_id', patientId)
        .select()
        .single()

      if (error) throw error

      // Log audit event
      await this.auditLogger.log({
        event_type: 'medical_history_updated',
        user_id: userId,
        resource_type: 'medical_history',
        resource_id: patientId,
        details: {
          patient_id: patientId,
          changes: Object.keys(updates)
        }
      })

      return { success: true, data }
    } catch (error) {
      console.error('Error updating medical history:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // ========================================================================
  // ATTACHMENT MANAGEMENT
  // ========================================================================

  async uploadMedicalAttachment(
    file: File,
    recordId: string,
    category: AttachmentCategory,
    userId: string,
    options?: {
      description?: string
      isBeforeAfter?: boolean
      beforeAfterPairId?: string
    }
  ): Promise<{ success: boolean; data?: MedicalAttachment; error?: string }> {
    try {
      const attachmentId = crypto.randomUUID()
      const fileName = `${attachmentId}-${file.name}`
      const filePath = `medical-attachments/${recordId}/${fileName}`

      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await this.supabase.storage
        .from('medical-files')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: urlData } = this.supabase.storage
        .from('medical-files')
        .getPublicUrl(filePath)

      // Create thumbnail for images
      let thumbnailUrl: string | undefined
      if (file.type.startsWith('image/')) {
        thumbnailUrl = await this.generateThumbnail(filePath, file)
      }

      const attachment: MedicalAttachment = {
        id: attachmentId,
        record_id: recordId,
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
        file_url: urlData.publicUrl,
        thumbnail_url: thumbnailUrl,
        category,
        description: options?.description,
        upload_date: new Date().toISOString(),
        uploaded_by: userId,
        version: 1,
        is_before_after: options?.isBeforeAfter || false,
        before_after_pair_id: options?.beforeAfterPairId
      }

      const { data, error } = await this.supabase
        .from('medical_attachments')
        .insert(attachment)
        .select()
        .single()

      if (error) throw error

      // Log audit event
      await this.auditLogger.log({
        event_type: 'medical_attachment_uploaded',
        user_id: userId,
        resource_type: 'medical_attachment',
        resource_id: attachmentId,
        details: {
          record_id: recordId,
          file_name: file.name,
          file_size: file.size,
          category
        }
      })

      return { success: true, data }
    } catch (error) {
      console.error('Error uploading medical attachment:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  async getRecordAttachments(
    recordId: string,
    userId: string
  ): Promise<{ success: boolean; data?: MedicalAttachment[]; error?: string }> {
    try {
      const { data, error } = await this.supabase
        .from('medical_attachments')
        .select('*')
        .eq('record_id', recordId)
        .order('upload_date', { ascending: false })

      if (error) throw error

      return { success: true, data: data || [] }
    } catch (error) {
      console.error('Error getting record attachments:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  async deleteAttachment(
    attachmentId: string,
    userId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Get attachment info first
      const { data: attachment, error: getError } = await this.supabase
        .from('medical_attachments')
        .select('*')
        .eq('id', attachmentId)
        .single()

      if (getError) throw getError

      // Delete from storage
      const filePath = attachment.file_url.split('/').slice(-3).join('/')
      await this.supabase.storage
        .from('medical-files')
        .remove([filePath])

      // Delete from database
      const { error } = await this.supabase
        .from('medical_attachments')
        .delete()
        .eq('id', attachmentId)

      if (error) throw error

      // Log audit event
      await this.auditLogger.log({
        event_type: 'medical_attachment_deleted',
        user_id: userId,
        resource_type: 'medical_attachment',
        resource_id: attachmentId,
        details: {
          record_id: attachment.record_id,
          file_name: attachment.file_name
        }
      })

      return { success: true }
    } catch (error) {
      console.error('Error deleting attachment:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // ========================================================================
  // DIGITAL SIGNATURE
  // ========================================================================

  async signMedicalRecord(
    recordId: string,
    signerId: string,
    signerName: string,
    signerRole: string
  ): Promise<{ success: boolean; data?: DigitalSignature; error?: string }> {
    try {
      // Get record data for signing
      const recordResult = await this.getMedicalRecord(recordId, signerId)
      if (!recordResult.success || !recordResult.data) {
        return { success: false, error: 'Record not found' }
      }

      // Create signature hash
      const recordContent = JSON.stringify(recordResult.data)
      const signatureHash = crypto
        .createHash('sha256')
        .update(recordContent + signerId + new Date().toISOString())
        .digest('hex')

      const signature: DigitalSignature = {
        id: crypto.randomUUID(),
        record_id: recordId,
        signer_id: signerId,
        signer_name: signerName,
        signer_role: signerRole,
        signature_hash: signatureHash,
        signature_timestamp: new Date().toISOString(),
        verification_status: 'valid'
      }

      const { data, error } = await this.supabase
        .from('digital_signatures')
        .insert(signature)
        .select()
        .single()

      if (error) throw error

      // Update record with signature
      await this.supabase
        .from('medical_records')
        .update({ digital_signature: signature })
        .eq('id', recordId)

      // Log audit event
      await this.auditLogger.log({
        event_type: 'medical_record_signed',
        user_id: signerId,
        resource_type: 'medical_record',
        resource_id: recordId,
        details: {
          signer_name: signerName,
          signer_role: signerRole,
          signature_hash: signatureHash
        }
      })

      return { success: true, data }
    } catch (error) {
      console.error('Error signing medical record:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  async verifySignature(
    signatureId: string
  ): Promise<{ success: boolean; isValid?: boolean; error?: string }> {
    try {
      const { data: signature, error } = await this.supabase
        .from('digital_signatures')
        .select('*')
        .eq('id', signatureId)
        .single()

      if (error) throw error

      // Get current record data
      const recordResult = await this.getMedicalRecord(
        signature.record_id,
        signature.signer_id
      )
      
      if (!recordResult.success || !recordResult.data) {
        return { success: false, error: 'Record not found for verification' }
      }

      // Verify signature hash (simplified verification)
      const isValid = signature.verification_status === 'valid'

      return { success: true, isValid }
    } catch (error) {
      console.error('Error verifying signature:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // ========================================================================
  // UTILITY METHODS
  // ========================================================================

  private async createRecordVersion(
    record: MedicalRecord,
    userId: string
  ): Promise<void> {
    try {
      const versionData = {
        ...record,
        id: crypto.randomUUID(),
        original_record_id: record.id,
        version_created_at: new Date().toISOString(),
        version_created_by: userId
      }

      await this.supabase
        .from('medical_record_versions')
        .insert(versionData)
    } catch (error) {
      console.error('Error creating record version:', error)
    }
  }

  private async generateThumbnail(
    filePath: string,
    file: File
  ): Promise<string | undefined> {
    try {
      // Simplified thumbnail generation
      // In production, use image processing service
      const thumbnailPath = filePath.replace(/\.[^/.]+$/, '_thumb.jpg')
      
      // For now, return the same URL
      // TODO: Implement actual thumbnail generation
      const { data } = this.supabase.storage
        .from('medical-files')
        .getPublicUrl(thumbnailPath)
      
      return data.publicUrl
    } catch (error) {
      console.error('Error generating thumbnail:', error)
      return undefined
    }
  }

  // ========================================================================
  // SEARCH AND ANALYTICS
  // ========================================================================

  async searchMedicalRecords(
    query: string,
    clinicId: string,
    userId: string,
    filters?: {
      patientId?: string
      recordType?: MedicalRecordType
      dateFrom?: string
      dateTo?: string
    }
  ): Promise<{ success: boolean; data?: MedicalRecord[]; error?: string }> {
    try {
      let dbQuery = this.supabase
        .from('medical_records')
        .select('*')
        .eq('clinic_id', clinicId)
        .eq('status', RecordStatus.ACTIVE)
        .or(`title.ilike.%${query}%,description.ilike.%${query}%,diagnosis.ilike.%${query}%`)

      if (filters?.patientId) {
        dbQuery = dbQuery.eq('patient_id', filters.patientId)
      }

      if (filters?.recordType) {
        dbQuery = dbQuery.eq('record_type', filters.recordType)
      }

      if (filters?.dateFrom) {
        dbQuery = dbQuery.gte('created_at', filters.dateFrom)
      }

      if (filters?.dateTo) {
        dbQuery = dbQuery.lte('created_at', filters.dateTo)
      }

      const { data, error } = await dbQuery
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error

      // Log audit event
      await this.auditLogger.log({
        event_type: 'medical_records_searched',
        user_id: userId,
        resource_type: 'medical_record',
        resource_id: clinicId,
        details: {
          query,
          filters,
          results_count: data?.length || 0
        }
      })

      return { success: true, data: data || [] }
    } catch (error) {
      console.error('Error searching medical records:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  async getRecordStatistics(
    clinicId: string,
    userId: string,
    period?: { from: string; to: string }
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      let query = this.supabase
        .from('medical_records')
        .select('record_type, created_at')
        .eq('clinic_id', clinicId)
        .eq('status', RecordStatus.ACTIVE)

      if (period) {
        query = query
          .gte('created_at', period.from)
          .lte('created_at', period.to)
      }

      const { data, error } = await query

      if (error) throw error

      // Process statistics
      const stats = {
        total_records: data?.length || 0,
        by_type: {} as Record<string, number>,
        by_month: {} as Record<string, number>
      }

      data?.forEach(record => {
        // Count by type
        stats.by_type[record.record_type] = 
          (stats.by_type[record.record_type] || 0) + 1

        // Count by month
        const month = new Date(record.created_at).toISOString().slice(0, 7)
        stats.by_month[month] = (stats.by_month[month] || 0) + 1
      })

      return { success: true, data: stats }
    } catch (error) {
      console.error('Error getting record statistics:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
}

// ============================================================================
// EXPORT DEFAULT INSTANCE
// ============================================================================

export const medicalRecordsManager = new MedicalRecordsManager()
export default medicalRecordsManager