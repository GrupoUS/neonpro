/**
 * Enhanced Telemedicine Service for Aesthetic Clinics
 *
 * Focused telemedicine service for aesthetic procedures with proper database integration
 * Following KISS/YAGNI principles and avoiding overengineering
 */

import { logger } from '@/utils/healthcare-errors.js'
import { z } from 'zod'
import { createAdminClient } from '../clients/supabase.js'
import { aiSecurityService } from './ai-security-service'

// Mock audit logger for startup - TODO: Replace with actual auditLogger
const auditLogger = {
  log: (..._args: any[]) => {},
  info: (..._args: any[]) => {},
  warn: (..._args: any[]) => {},
  error: (..._args: any[]) => {},
  logError: (..._args: any[]) => {},
  logSecurityEvent: (..._args: any[]) => {},
}

// Zod schemas for validation
const TelemedicineSessionSchema = z.object({
  id: z.string().uuid(),
  patientId: z.string().uuid(),
  professionalId: z.string().uuid(),
  clinicId: z.string().uuid(),
  sessionType: z.enum('consultation', 'follow_up', 'emergency']),
  status: z.enum('scheduled', 'active', 'ended', 'cancelled', 'no_show']),
  scheduledFor: z.string().datetime(),
  estimatedDuration: z.number().positive().max(120), // max 2 hours
  specialty: z.string().max(100),
  notes: z.string().optional(),
  videoProvider: z.enum('zoom', 'teams', 'meet', 'custom']).default('meet'),
  recordingEnabled: z.boolean().default(false),
  requiresPrescription: z.boolean().default(false),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

const TelemedicineMessageSchema = z.object({
  id: z.string().uuid(),
  sessionId: z.string().uuid(),
  senderId: z.string().uuid(),
  senderRole: z.enum('patient', 'professional', 'admin']),
  messageType: z.enum('text', 'image', 'file', 'system']),
  content: z.string().max(5000),
  encrypted: z.boolean().default(true),
  timestamp: z.string().datetime(),
  readAt: z.string().datetime().optional(),
})

const TelemedicinePrescriptionSchema = z.object({
  id: z.string().uuid(),
  sessionId: z.string().uuid(),
  patientId: z.string().uuid(),
  professionalId: z.string().uuid(),
  medications: z.array(z.object({
    name: z.string().max(100),
    dosage: z.string().max(50),
    frequency: z.string().max(50),
    duration: z.string().max(50),
    instructions: z.string().max(500),
  })),
  notes: z.string().max(1000).optional(),
  issuedAt: z.string().datetime(),
  expiresAt: z.string().datetime(),
  digitalSignature: z.string().optional(),
})

// Type definitions
export type TelemedicineSession = z.infer<typeof TelemedicineSessionSchema>
export type TelemedicineMessage = z.infer<typeof TelemedicineMessageSchema>
export type TelemedicinePrescription = z.infer<typeof TelemedicinePrescriptionSchema>

export interface CreateTelemedicineSessionInput {
  patientId: string
  professionalId: string
  clinicId: string
  sessionType: 'consultation' | 'follow_up' | 'emergency'
  scheduledFor: Date
  estimatedDuration: number
  specialty: string
  notes?: string
  videoProvider?: 'zoom' | 'teams' | 'meet' | 'custom'
  recordingEnabled?: boolean
}

export interface SendMessageInput {
  sessionId: string
  senderId: string
  senderRole: 'patient' | 'professional' | 'admin'
  messageType: 'text' | 'image' | 'file' | 'system'
  content: string
}

export interface CreatePrescriptionInput {
  sessionId: string
  patientId: string
  professionalId: string
  medications: Array<{
    name: string
    dosage: string
    frequency: string
    duration: string
    instructions: string
  }>
  notes?: string
}

export class EnhancedTelemedicineService {
  private supabase = createAdminClient()

  /**
   * Create a new telemedicine session
   */
  async createSession(input: CreateTelemedicineSessionInput): Promise<TelemedicineSession> {
    try {
      logger.info('Creating telemedicine session', {
        patientId: input.patientId,
        professionalId: input.professionalId,
        sessionType: input.sessionType,
      })

      // Validate professional authorization
      const isAuthorized = await this.validateProfessionalAuthorization(
        input.professionalId,
        input.clinicId,
      )

      if (!isAuthorized) {
        throw new Error('Professional not authorized for telemedicine')
      }

      // Create session record
      const sessionData = {
        patientId: input.patientId,
        professionalId: input.professionalId,
        clinicId: input.clinicId,
        sessionType: input.sessionType,
        status: 'scheduled',
        scheduledFor: input.scheduledFor.toISOString(),
        estimatedDuration: input.estimatedDuration,
        specialty: input.specialty,
        notes: input.notes,
        videoProvider: input.videoProvider || 'meet',
        recordingEnabled: input.recordingEnabled || false,
        requiresPrescription: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      const { data: session, error } = await this.supabase
        .from('telemedicine_sessions')
        .insert(sessionData)
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to create telemedicine session: ${error.message}`)
      }

      const validatedSession = TelemedicineSessionSchema.parse(session)

      // Log for compliance
      auditLogger.logSecurityEvent({
        event: 'telemedicine_session_created',
        sessionId: validatedSession.id,
        patientId: validatedSession.patientId,
        professionalId: validatedSession.professionalId,
        timestamp: new Date().toISOString(),
      })

      return validatedSession
    } catch (error) {
      logger.error('Error creating telemedicine session', { error })
      throw error
    }
  }

  /**
   * Get telemedicine session by ID
   */
  async getSession(sessionId: string): Promise<TelemedicineSession | null> {
    try {
      const { data: session, error } = await this.supabase
        .from('telemedicine_sessions')
        .select('*')
        .eq('id', sessionId)
        .single()

      if (error) {
        return null
      }

      return TelemedicineSessionSchema.parse(session)
    } catch (error) {
      logger.error('Error getting telemedicine session', { error, sessionId })
      return null
    }
  }

  /**
   * Get sessions for a professional
   */
  async getProfessionalSessions(
    professionalId: string,
    status?: TelemedicineSession['status'],
  ): Promise<TelemedicineSession[]> {
    try {
      let query = this.supabase
        .from('telemedicine_sessions')
        .select('*')
        .eq('professionalId', professionalId)

      if (status) {
        query = query.eq('status', status)
      }

      const { data: sessions, error } = await query.order('scheduledFor', { ascending: true })

      if (error) {
        throw new Error(`Failed to get sessions: ${error.message}`)
      }

      return sessions.map(session => TelemedicineSessionSchema.parse(session))
    } catch (error) {
      logger.error('Error getting professional sessions', { error, professionalId })
      throw error
    }
  }

  /**
   * Get sessions for a patient
   */
  async getPatientSessions(
    patientId: string,
    status?: TelemedicineSession['status'],
  ): Promise<TelemedicineSession[]> {
    try {
      let query = this.supabase
        .from('telemedicine_sessions')
        .select('*')
        .eq('patientId', patientId)

      if (status) {
        query = query.eq('status', status)
      }

      const { data: sessions, error } = await query.order('scheduledFor', { ascending: true })

      if (error) {
        throw new Error(`Failed to get sessions: ${error.message}`)
      }

      return sessions.map(session => TelemedicineSessionSchema.parse(session))
    } catch (error) {
      logger.error('Error getting patient sessions', { error, patientId })
      throw error
    }
  }

  /**
   * Start a telemedicine session
   */
  async startSession(sessionId: string, professionalId: string): Promise<void> {
    try {
      // Verify session ownership
      const session = await this.getSession(sessionId)
      if (!session || session.professionalId !== professionalId) {
        throw new Error('Session not found or access denied')
      }

      if (session.status !== 'scheduled') {
        throw new Error('Session cannot be started')
      }

      const { error } = await this.supabase
        .from('telemedicine_sessions')
        .update({
          status: 'active',
          updatedAt: new Date().toISOString(),
        })
        .eq('id', sessionId)

      if (error) {
        throw new Error(`Failed to start session: ${error.message}`)
      }

      auditLogger.logSecurityEvent({
        event: 'telemedicine_session_started',
        sessionId,
        professionalId,
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      logger.error('Error starting telemedicine session', { error, sessionId })
      throw error
    }
  }

  /**
   * End a telemedicine session
   */
  async endSession(
    sessionId: string,
    professionalId: string,
    endReason: string = 'completed',
  ): Promise<void> {
    try {
      // Verify session ownership
      const session = await this.getSession(sessionId)
      if (!session || session.professionalId !== professionalId) {
        throw new Error('Session not found or access denied')
      }

      if (session.status !== 'active') {
        throw new Error('Session is not active')
      }

      const { error } = await this.supabase
        .from('telemedicine_sessions')
        .update({
          status: 'ended',
          updatedAt: new Date().toISOString(),
        })
        .eq('id', sessionId)

      if (error) {
        throw new Error(`Failed to end session: ${error.message}`)
      }

      auditLogger.logSecurityEvent({
        event: 'telemedicine_session_ended',
        sessionId,
        professionalId,
        endReason,
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      logger.error('Error ending telemedicine session', { error, sessionId })
      throw error
    }
  }

  /**
   * Send a message in a telemedicine session
   */
  async sendMessage(input: SendMessageInput): Promise<TelemedicineMessage> {
    try {
      // Validate session access
      const session = await this.getSession(input.sessionId)
      if (!session) {
        throw new Error('Session not found')
      }

      if (session.status !== 'active') {
        throw new Error('Session is not active')
      }

      // Sanitize message content
      const sanitizedContent = aiSecurityService.sanitizeForAI(input.content)

      const messageData = {
        sessionId: input.sessionId,
        senderId: input.senderId,
        senderRole: input.senderRole,
        messageType: input.messageType,
        content: sanitizedContent,
        encrypted: true,
        timestamp: new Date().toISOString(),
      }

      const { data: message, error } = await this.supabase
        .from('telemedicine_messages')
        .insert(messageData)
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to send message: ${error.message}`)
      }

      const validatedMessage = TelemedicineMessageSchema.parse(message)

      auditLogger.logSecurityEvent({
        event: 'telemedicine_message_sent',
        sessionId: input.sessionId,
        senderId: input.senderId,
        messageType: input.messageType,
        timestamp: new Date().toISOString(),
      })

      return validatedMessage
    } catch (error) {
      logger.error('Error sending telemedicine message', { error, sessionId: input.sessionId })
      throw error
    }
  }

  /**
   * Get messages for a session
   */
  async getSessionMessages(sessionId: string): Promise<TelemedicineMessage[]> {
    try {
      const { data: messages, error } = await this.supabase
        .from('telemedicine_messages')
        .select('*')
        .eq('sessionId', sessionId)
        .order('timestamp', { ascending: true })

      if (error) {
        throw new Error(`Failed to get messages: ${error.message}`)
      }

      return messages.map(message => TelemedicineMessageSchema.parse(message))
    } catch (error) {
      logger.error('Error getting session messages', { error, sessionId })
      throw error
    }
  }

  /**
   * Create a prescription from a telemedicine session
   */
  async createPrescription(input: CreatePrescriptionInput): Promise<TelemedicinePrescription> {
    try {
      // Validate session access and status
      const session = await this.getSession(input.sessionId)
      if (!session || session.professionalId !== input.professionalId) {
        throw new Error('Session not found or access denied')
      }

      if (session.status !== 'active' && session.status !== 'ended') {
        throw new Error('Session must be active or ended to create prescription')
      }

      const prescriptionData = {
        sessionId: input.sessionId,
        patientId: input.patientId,
        professionalId: input.professionalId,
        medications: input.medications,
        notes: input.notes,
        issuedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      }

      const { data: prescription, error } = await this.supabase
        .from('telemedicine_prescriptions')
        .insert(prescriptionData)
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to create prescription: ${error.message}`)
      }

      const validatedPrescription = TelemedicinePrescriptionSchema.parse(prescription)

      auditLogger.logSecurityEvent({
        event: 'telemedicine_prescription_created',
        sessionId: input.sessionId,
        patientId: input.patientId,
        professionalId: input.professionalId,
        timestamp: new Date().toISOString(),
      })

      return validatedPrescription
    } catch (error) {
      logger.error('Error creating telemedicine prescription', {
        error,
        sessionId: input.sessionId,
      })
      throw error
    }
  }

  /**
   * Validate professional authorization for telemedicine
   */
  private async validateProfessionalAuthorization(
    professionalId: string,
    clinicId: string,
  ): Promise<boolean> {
    try {
      // Check if professional is active and has telemedicine authorization
      const { data: professional, error } = await this.supabase
        .from('professionals')
        .select('active, telemedicine_authorized')
        .eq('id', professionalId)
        .single()

      if (error || !professional) {
        return false
      }

      // Check if professional is associated with the clinic
      const { data: clinicAssociation, error: associationError } = await this.supabase
        .from('clinic_professionals')
        .select('id')
        .eq('professional_id', professionalId)
        .eq('clinic_id', clinicId)
        .single()

      if (associationError || !clinicAssociation) {
        return false
      }

      return professional.active && professional.telemedicine_authorized
    } catch (error) {
      logger.error('Error validating professional authorization', { error, professionalId })
      return false
    }
  }

  /**
   * Get upcoming sessions for a clinic
   */
  async getUpcomingSessions(clinicId: string): Promise<TelemedicineSession[]> {
    try {
      const { data: sessions, error } = await this.supabase
        .from('telemedicine_sessions')
        .select('*')
        .eq('clinicId', clinicId)
        .eq('status', 'scheduled')
        .gte('scheduledFor', new Date().toISOString())
        .order('scheduledFor', { ascending: true })
        .limit(50)

      if (error) {
        throw new Error(`Failed to get upcoming sessions: ${error.message}`)
      }

      return sessions.map(session => TelemedicineSessionSchema.parse(session))
    } catch (error) {
      logger.error('Error getting upcoming sessions', { error, clinicId })
      throw error
    }
  }
}

// Export singleton instance
export const enhancedTelemedicineService = new EnhancedTelemedicineService()
