/**
 * Telemedicine Service
 * Integrates WebRTC functionality with healthcare compliance and license verification
 */

import { WebRTCSessionService } from '../../../packages/database/src/services/webrtc-session.service';
import { createAdminClient } from '../clients/supabase';
import { logger } from '../lib/logger';
import {
  validateCFMLicense,
  validateWithDatabaseRules,
} from './healthcare-professional-authorization';

export interface TelemedicineSessionInput {
  patientId: string;
  physicianId: string;
  sessionType: string;
  specialty: string;
  scheduledFor: Date;
  estimatedDuration: number;
  notes?: string;
  clinicId: string;
}

export interface TelemedicineSession {
  sessionId: string;
  roomId: string;
  patientId: string;
  physicianId: string;
  sessionType: string;
  specialty: string;
  status: 'scheduled' | 'active' | 'ended' | 'cancelled';
  scheduledFor: Date;
  startedAt?: Date;
  endedAt?: Date;
  estimatedDuration: number;
  actualDuration?: number;
  notes?: string;
  clinicId: string;
  recordingEnabled: boolean;
  compliance: {
    licenseVerified: boolean;
    telemedicineCompliant: boolean;
    consentObtained: boolean;
  };
}

export interface SessionEndInput {
  sessionId: string;
  endReason: string;
  endedBy: string;
  recordingStopped?: boolean;
}

export class TelemedicineService {
  private webrtcService: WebRTCSessionService;
  private supabase = createAdminClient();

  constructor() {
    this.webrtcService = new WebRTCSessionService();
  }

  /**
   * Creates a new telemedicine session with proper license verification
   */
  async createSession(input: TelemedicineSessionInput): Promise<TelemedicineSession> {
    try {
      logger.info('Creating telemedicine session', {
        patientId: input.patientId,
        physicianId: input.physicianId,
        specialty: input.specialty,
        sessionType: input.sessionType,
      });

      // Step 1: Verify physician license and telemedicine compliance
      const licenseVerification = await this.verifyPhysicianLicense(
        input.physicianId,
        input.specialty,
      );

      if (!licenseVerification.complianceStatus.telemedicineCompliant) {
        throw new Error('Physician not authorized for telemedicine practice');
      }

      // Step 2: Verify clinic access permissions
      await this.verifyClinicAccess(input.physicianId, input.clinicId);

      // Step 3: Create WebRTC session
      const webrtcSession = await this.webrtcService.createSession({
        patientId: input.patientId,
        physicianId: input.physicianId,
        sessionType: input.sessionType,
        specialtyCode: input.specialty,
      });

      // Step 4: Create telemedicine session record
      const { data: session, error } = await this.supabase
        .from('telemedicine_sessions')
        .insert({
          patient_id: input.patientId,
          physician_id: input.physicianId,
          session_type: input.sessionType,
          specialty: input.specialty,
          scheduled_for: input.scheduledFor.toISOString(),
          estimated_duration: input.estimatedDuration,
          notes: input.notes,
          clinic_id: input.clinicId,
          room_id: webrtcSession.roomId,
          status: 'scheduled',
          license_verified: true,
          telemedicine_compliant: licenseVerification.complianceStatus.telemedicineCompliant,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create telemedicine session: ${error.message}`);
      }

      logger.info('Telemedicine session created successfully', {
        sessionId: session.id,
        roomId: webrtcSession.roomId,
        physicianId: input.physicianId,
      });

      return {
        sessionId: session.id,
        roomId: webrtcSession.roomId,
        patientId: session.patient_id,
        physicianId: session.physician_id,
        sessionType: session.session_type,
        specialty: session.specialty,
        status: session.status,
        scheduledFor: new Date(session.scheduled_for),
        estimatedDuration: session.estimated_duration,
        notes: session.notes,
        clinicId: session.clinic_id,
        recordingEnabled: session.recording_enabled || false,
        compliance: {
          licenseVerified: session.license_verified,
          telemedicineCompliant: session.telemedicine_compliant,
          consentObtained: session.recording_consent || false,
        },
      };
    } catch (error) {
      logger.error('Error creating telemedicine session', {
        error: error instanceof Error ? error.message : String(error),
        physicianId: input.physicianId,
        patientId: input.patientId,
      });
      throw error;
    }
  }

  /**
   * Starts a telemedicine session
   */
  async startSession(sessionId: string): Promise<void> {
    try {
      logger.info('Starting telemedicine session', { sessionId });

      // Verify session exists and is in scheduled state
      const { data: session, error } = await this.supabase
        .from('telemedicine_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (error || !session) {
        throw new Error('Telemedicine session not found');
      }

      if (session.status !== 'scheduled') {
        throw new Error('Session can only be started from scheduled state');
      }

      // Start WebRTC session
      await this.webrtcService.startSession(sessionId);

      // Update session status
      await this.supabase
        .from('telemedicine_sessions')
        .update({
          status: 'active',
          started_at: new Date().toISOString(),
        })
        .eq('id', sessionId);

      logger.info('Telemedicine session started successfully', { sessionId });
    } catch (error) {
      logger.error('Error starting telemedicine session', {
        error: error instanceof Error ? error.message : String(error),
        sessionId,
      });
      throw error;
    }
  }

  /**
   * Ends a telemedicine session with proper duration calculation
   */
  async endSession(input: SessionEndInput): Promise<{
    sessionId: string;
    endReason: string;
    endedAt: Date;
    duration: number;
    recordingSummary?: any;
  }> {
    try {
      logger.info('Ending telemedicine session', {
        sessionId: input.sessionId,
        endReason: input.endReason,
        endedBy: input.endedBy,
      });

      // Get session details
      const { data: session, error } = await this.supabase
        .from('telemedicine_sessions')
        .select('*')
        .eq('id', input.sessionId)
        .single();

      if (error || !session) {
        throw new Error('Telemedicine session not found');
      }

      // Calculate actual duration
      const startTime = new Date(session.started_at || session.scheduled_for);
      const endTime = new Date();
      const duration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);

      // Stop recording if enabled
      let recordingSummary;
      if (session.recording_enabled && input.recordingStopped) {
        try {
          const recordingResult = await this.webrtcService.stopRecording(session.room_id);
          recordingSummary = {
            recordingId: recordingResult.recordingId,
            fileHash: recordingResult.fileHash,
            duration: recordingResult.duration,
          };
        } catch (recordingError) {
          logger.warn('Failed to stop recording', {
            error: recordingError instanceof Error
              ? recordingError.message
              : String(recordingError),
            sessionId: input.sessionId,
          });
        }
      }

      // End WebRTC session
      await this.webrtcService.endSession(input.sessionId, input.endReason);

      // Update session record
      await this.supabase
        .from('telemedicine_sessions')
        .update({
          status: 'ended',
          ended_at: endTime.toISOString(),
          end_reason: input.endReason,
          ended_by: input.endedBy,
          actual_duration: duration,
          recording_summary: recordingSummary,
        })
        .eq('id', input.sessionId);

      logger.info('Telemedicine session ended successfully', {
        sessionId: input.sessionId,
        duration,
        endReason: input.endReason,
      });

      return {
        sessionId: input.sessionId,
        endReason: input.endReason,
        endedAt: endTime,
        duration,
        recordingSummary,
      };
    } catch (error) {
      logger.error('Error ending telemedicine session', {
        error: error instanceof Error ? error.message : String(error),
        sessionId: input.sessionId,
      });
      throw error;
    }
  }

  /**
   * Gets session status with detailed information
   */
  async getSessionStatus(sessionId: string): Promise<{
    session: TelemedicineSession;
    webrtcStatus: any;
    participants: any[];
    qualityMetrics: any;
    recording: any;
  }> {
    try {
      // Get session details
      const { data: session, error } = await this.supabase
        .from('telemedicine_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (error || !session) {
        throw new Error('Telemedicine session not found');
      }

      // Get WebRTC status
      const webrtcStatus = await this.webrtcService.getSessionStatus(session.room_id);

      // Format response
      const telemedicineSession: TelemedicineSession = {
        sessionId: session.id,
        roomId: session.room_id,
        patientId: session.patient_id,
        physicianId: session.physician_id,
        sessionType: session.session_type,
        specialty: session.specialty,
        status: session.status,
        scheduledFor: new Date(session.scheduled_for),
        startedAt: session.started_at ? new Date(session.started_at) : undefined,
        endedAt: session.ended_at ? new Date(session.ended_at) : undefined,
        estimatedDuration: session.estimated_duration,
        actualDuration: session.actual_duration,
        notes: session.notes,
        clinicId: session.clinic_id,
        recordingEnabled: session.recording_enabled || false,
        compliance: {
          licenseVerified: session.license_verified,
          telemedicineCompliant: session.telemedicine_compliant,
          consentObtained: session.recording_consent || false,
        },
      };

      return {
        session: telemedicineSession,
        webrtcStatus,
        participants: webrtcStatus.participants || [],
        qualityMetrics: webrtcStatus.qualityMetrics || {},
        recording: webrtcStatus.recording || {},
      };
    } catch (error) {
      logger.error('Error getting session status', {
        error: error instanceof Error ? error.message : String(error),
        sessionId,
      });
      throw error;
    }
  }

  /**
   * Verifies physician license for telemedicine practice
   */
  private async verifyPhysicianLicense(
    physicianId: string,
    specialty: string,
  ): Promise<any> {
    try {
      // Get physician details
      const { data: physician, error } = await this.supabase
        .from('professionals')
        .select('*')
        .eq('id', physicianId)
        .eq('role', 'physician')
        .single();

      if (error || !physician) {
        throw new Error('Physician not found');
      }

      // Validate CFM license
      const licenseVerification = await validateCFMLicense(
        physician.cfm_number,
        physician.state,
        specialty,
      );

      return licenseVerification;
    } catch (error) {
      logger.error('Error verifying physician license', {
        error: error instanceof Error ? error.message : String(error),
        physicianId,
        specialty,
      });
      throw error;
    }
  }

  /**
   * Verifies clinic access permissions
   */
  private async verifyClinicAccess(physicianId: string, clinicId: string): Promise<void> {
    try {
      const { data: physician, error } = await this.supabase
        .from('professionals')
        .select('clinic_id')
        .eq('id', physicianId)
        .single();

      if (error || !physician) {
        throw new Error('Physician not found');
      }

      if (physician.clinic_id !== clinicId) {
        throw new Error('Physician does not have access to this clinic');
      }
    } catch (error) {
      logger.error('Error verifying clinic access', {
        error: error instanceof Error ? error.message : String(error),
        physicianId,
        clinicId,
      });
      throw error;
    }
  }

  /**
   * Starts session recording with proper consent verification
   */
  async startRecording(
    sessionId: string,
    consentMethod: 'verbal' | 'digital' | 'written',
    consentEvidence?: any,
  ): Promise<{ recordingId: string; storageLocation: string }> {
    try {
      // Get session details
      const { data: session, error } = await this.supabase
        .from('telemedicine_sessions')
        .select('room_id')
        .eq('id', sessionId)
        .single();

      if (error || !session) {
        throw new Error('Telemedicine session not found');
      }

      // Start recording via WebRTC service
      const result = await this.webrtcService.startRecording(
        session.room_id,
        consentMethod,
        consentEvidence,
      );

      // Update session record
      await this.supabase
        .from('telemedicine_sessions')
        .update({
          recording_enabled: true,
          recording_consent: true,
          recording_consent_method: consentMethod,
        })
        .eq('id', sessionId);

      logger.info('Recording started for telemedicine session', { sessionId });

      return result;
    } catch (error) {
      logger.error('Error starting recording', {
        error: error instanceof Error ? error.message : String(error),
        sessionId,
      });
      throw error;
    }
  }

  /**
   * Stops session recording
   */
  async stopRecording(sessionId: string): Promise<{
    recordingId: string;
    fileHash: string;
    duration: number;
  }> {
    try {
      // Get session details
      const { data: session, error } = await this.supabase
        .from('telemedicine_sessions')
        .select('room_id')
        .eq('id', sessionId)
        .single();

      if (error || !session) {
        throw new Error('Telemedicine session not found');
      }

      // Stop recording via WebRTC service
      const result = await this.webrtcService.stopRecording(session.room_id);

      // Update session record
      await this.supabase
        .from('telemedicine_sessions')
        .update({
          recording_enabled: false,
        })
        .eq('id', sessionId);

      logger.info('Recording stopped for telemedicine session', { sessionId });

      return result;
    } catch (error) {
      logger.error('Error stopping recording', {
        error: error instanceof Error ? error.message : String(error),
        sessionId,
      });
      throw error;
    }
  }
}

// Export singleton instance
export const telemedicineService = new TelemedicineService();
