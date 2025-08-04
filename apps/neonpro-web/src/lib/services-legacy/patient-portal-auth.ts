// ===============================================
// Patient Portal Authentication Service
// Story 4.3: Patient Portal & Self-Service  
// ===============================================

import { createClient } from '@/app/utils/supabase/client'
import type { 
  PatientPortalAuth, 
  PatientPortalSession, 
  PatientLoginForm,
  PortalApiResponse 
} from '@/types/patient-portal'

const supabase = createClient()

export class PatientPortalAuthService {
  /**
   * Authenticate patient using email, phone, or document
   */
  static async authenticatePatient(
    loginData: PatientLoginForm
  ): Promise<PortalApiResponse<PatientPortalAuth>> {
    try {
      // Validate clinic code first
      const { data: clinic, error: clinicError } = await supabase
        .from('clinics')
        .select('id, clinic_name, logo_url, theme_colors')
        .eq('clinic_code', loginData.clinic_code)
        .single()

      if (clinicError || !clinic) {
        return {
          success: false,
          error: {
            code: 'CLINIC_NOT_FOUND',
            message: 'Código da clínica inválido'
          }
        }
      }

      // Find patient based on login type
      let patientQuery = supabase
        .from('patients')
        .select('*')
        .eq('clinic_id', clinic.id)

      switch (loginData.login_type) {
        case 'email':
          if (!loginData.email) {
            return {
              success: false,
              error: {
                code: 'MISSING_EMAIL',
                message: 'Email é obrigatório'
              }
            }
          }
          patientQuery = patientQuery.eq('email', loginData.email.toLowerCase())
          break
          
        case 'phone':
          if (!loginData.phone) {
            return {
              success: false,
              error: {
                code: 'MISSING_PHONE',
                message: 'Telefone é obrigatório'
              }
            }
          }
          patientQuery = patientQuery.eq('phone', loginData.phone)
          break
          
        case 'document':
          if (!loginData.document_number) {
            return {
              success: false,
              error: {
                code: 'MISSING_DOCUMENT',
                message: 'Documento é obrigatório'
              }
            }
          }
          patientQuery = patientQuery.eq('document_number', loginData.document_number)
          break
      }

      const { data: patient, error: patientError } = await patientQuery.single()

      if (patientError || !patient) {
        return {
          success: false,
          error: {
            code: 'PATIENT_NOT_FOUND',
            message: 'Paciente não encontrado nesta clínica'
          }
        }
      }

      // Check if patient has portal access enabled
      if (!patient.portal_access_enabled) {
        return {
          success: false,
          error: {
            code: 'PORTAL_ACCESS_DISABLED',
            message: 'Acesso ao portal não está habilitado para este paciente'
          }
        }
      }

      // Generate session token
      const sessionToken = await this.generateSessionToken()
      const expiresAt = new Date()
      expiresAt.setHours(expiresAt.getHours() + (loginData.remember_me ? 168 : 24)) // 7 days or 24 hours

      // Create portal session
      const sessionData: Partial<PatientPortalSession> = {
        patient_id: patient.id,
        clinic_id: clinic.id,
        session_token: sessionToken,
        expires_at: expiresAt.toISOString(),
        last_activity: new Date().toISOString(),
        ip_address: await this.getClientIP(),
        user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
        is_active: true,
        metadata: {
          login_method: loginData.login_type,
          device_type: this.detectDeviceType(),
          browser: this.detectBrowser(),
        }
      }

      const { data: session, error: sessionError } = await supabase
        .from('patient_portal_sessions')
        .insert(sessionData)
        .select()
        .single()

      if (sessionError) {
        console.error('Session creation error:', sessionError)
        return {
          success: false,
          error: {
            code: 'SESSION_CREATION_FAILED',
            message: 'Erro ao criar sessão'
          }
        }
      }

      // Get patient permissions
      const permissions = await this.getPatientPermissions(patient.id, clinic.id)
      
      // Store session token in localStorage/sessionStorage
      const storage = loginData.remember_me ? localStorage : sessionStorage
      storage.setItem('portal_session_token', sessionToken)
      storage.setItem('portal_patient_id', patient.id)
      storage.setItem('portal_clinic_id', clinic.id)

      // Log authentication event
      await this.logAuthEvent('LOGIN', patient.id, clinic.id, {
        login_method: loginData.login_type,
        device_type: sessionData.metadata?.device_type
      })

      const authData: PatientPortalAuth = {
        patient: {
          id: patient.id,
          full_name: patient.full_name,
          email: patient.email,
          phone: patient.phone,
          document_number: patient.document_number,
          birth_date: patient.birth_date,
          avatar_url: patient.avatar_url
        },
        clinic: {
          id: clinic.id,
          clinic_name: clinic.clinic_name,
          logo_url: clinic.logo_url,
          theme_colors: clinic.theme_colors
        },
        session: session as PatientPortalSession,
        permissions
      }

      return {
        success: true,
        data: authData,
        meta: {
          request_id: crypto.randomUUID(),
          timestamp: new Date().toISOString()
        }
      }

    } catch (error) {
      console.error('Portal authentication error:', error)
      return {
        success: false,
        error: {
          code: 'AUTHENTICATION_ERROR',
          message: 'Erro interno de autenticação'
        }
      }
    }
  }  /**
   * Validate and refresh session
   */
  static async validateSession(sessionToken: string): Promise<PortalApiResponse<PatientPortalAuth>> {
    try {
      const { data: session, error } = await supabase
        .from('patient_portal_sessions')
        .select(`
          *,
          patients (*),
          clinics (*)
        `)
        .eq('session_token', sessionToken)
        .eq('is_active', true)
        .gte('expires_at', new Date().toISOString())
        .single()

      if (error || !session) {
        return {
          success: false,
          error: {
            code: 'INVALID_SESSION',
            message: 'Sessão inválida ou expirada'
          }
        }
      }

      // Update last activity
      await supabase
        .from('patient_portal_sessions')
        .update({ 
          last_activity: new Date().toISOString() 
        })
        .eq('id', session.id)

      const permissions = await this.getPatientPermissions(session.patient_id, session.clinic_id)

      const authData: PatientPortalAuth = {
        patient: {
          id: session.patients.id,
          full_name: session.patients.full_name,
          email: session.patients.email,
          phone: session.patients.phone,
          document_number: session.patients.document_number,
          birth_date: session.patients.birth_date,
          avatar_url: session.patients.avatar_url
        },
        clinic: {
          id: session.clinics.id,
          clinic_name: session.clinics.clinic_name,
          logo_url: session.clinics.logo_url,
          theme_colors: session.clinics.theme_colors
        },
        session: session as PatientPortalSession,
        permissions
      }

      return {
        success: true,
        data: authData
      }

    } catch (error) {
      console.error('Session validation error:', error)
      return {
        success: false,
        error: {
          code: 'SESSION_VALIDATION_ERROR',
          message: 'Erro ao validar sessão'
        }
      }
    }
  }

  /**
   * Logout and invalidate session
   */
  static async logout(sessionToken: string): Promise<PortalApiResponse<void>> {
    try {
      // Get session info for logging
      const { data: session } = await supabase
        .from('patient_portal_sessions')
        .select('patient_id, clinic_id')
        .eq('session_token', sessionToken)
        .single()

      // Deactivate session
      await supabase
        .from('patient_portal_sessions')
        .update({ 
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('session_token', sessionToken)

      // Clear storage
      localStorage.removeItem('portal_session_token')
      localStorage.removeItem('portal_patient_id')
      localStorage.removeItem('portal_clinic_id')
      sessionStorage.removeItem('portal_session_token')
      sessionStorage.removeItem('portal_patient_id')
      sessionStorage.removeItem('portal_clinic_id')

      // Log logout event
      if (session) {
        await this.logAuthEvent('LOGOUT', session.patient_id, session.clinic_id)
      }

      return {
        success: true
      }

    } catch (error) {
      console.error('Logout error:', error)
      return {
        success: false,
        error: {
          code: 'LOGOUT_ERROR',
          message: 'Erro ao fazer logout'
        }
      }
    }
  }

  /**
   * Get current session from storage
   */
  static getCurrentSession(): { sessionToken: string; patientId: string; clinicId: string } | null {
    if (typeof window === 'undefined') return null

    const sessionToken = localStorage.getItem('portal_session_token') || 
                        sessionStorage.getItem('portal_session_token')
    const patientId = localStorage.getItem('portal_patient_id') || 
                     sessionStorage.getItem('portal_patient_id')
    const clinicId = localStorage.getItem('portal_clinic_id') || 
                    sessionStorage.getItem('portal_clinic_id')

    if (!sessionToken || !patientId || !clinicId) return null

    return { sessionToken, patientId, clinicId }
  }

  // Private helper methods
  private static async generateSessionToken(): Promise<string> {
    const array = new Uint8Array(32)
    crypto.getRandomValues(array)
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
  }

  private static async getClientIP(): Promise<string> {
    try {
      // In a real implementation, you might use a service to get the actual IP
      // For now, we'll use a placeholder
      return '0.0.0.0'
    } catch {
      return '0.0.0.0'
    }
  }

  private static detectDeviceType(): 'mobile' | 'desktop' | 'tablet' {
    if (typeof navigator === 'undefined') return 'desktop'
    
    const userAgent = navigator.userAgent.toLowerCase()
    if (/mobile|android|iphone|ipod|blackberry|opera mini|iemobile|wpdesktop/.test(userAgent)) {
      return 'mobile'
    } else if (/tablet|ipad|playbook|silk/.test(userAgent)) {
      return 'tablet'
    }
    return 'desktop'
  }

  private static detectBrowser(): string {
    if (typeof navigator === 'undefined') return 'Unknown'
    
    const userAgent = navigator.userAgent
    if (userAgent.includes('Chrome')) return 'Chrome'
    if (userAgent.includes('Firefox')) return 'Firefox'
    if (userAgent.includes('Safari')) return 'Safari'
    if (userAgent.includes('Edge')) return 'Edge'
    return 'Unknown'
  }

  private static async getPatientPermissions(patientId: string, clinicId: string) {
    // Get patient-specific permissions from database
    const { data: patient } = await supabase
      .from('patients')
      .select('portal_permissions')
      .eq('id', patientId)
      .eq('clinic_id', clinicId)
      .single()

    const defaultPermissions = {
      can_book_appointments: true,
      can_view_history: true,
      can_upload_files: true,
      can_view_progress: true,
      can_submit_evaluations: true
    }

    return patient?.portal_permissions || defaultPermissions
  }

  private static async logAuthEvent(
    event: 'LOGIN' | 'LOGOUT' | 'SESSION_REFRESH',
    patientId: string,
    clinicId: string,
    metadata?: any
  ) {
    try {
      await supabase
        .from('audit_logs')
        .insert({
          table_name: 'patient_portal_sessions',
          operation: event.toLowerCase(),
          old_values: null,
          new_values: metadata,
          user_id: null, // Portal doesn't use user_id
          patient_id: patientId,
          clinic_id: clinicId,
          metadata: {
            source: 'patient_portal',
            event_type: event,
            ...metadata
          }
        })
    } catch (error) {
      console.error('Failed to log auth event:', error)
    }
  }
}