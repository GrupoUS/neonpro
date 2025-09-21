/**
 * Enhanced Telemedicine Components - Export Module
 *
 * T042: Create Telemedicine Interface Components
 *
 * Features:
 * - VideoConsultation: Complete video consultation interface with Brazilian medical protocols
 * - WaitingRoom: Patient waiting room with real-time status updates and LGPD consent
 * - RealTimeChat: Medical chat with AI transcription and Portuguese terminology support
 * - SessionConsent: Pre-consultation consent documentation with CFM compliance
 * - EmergencyEscalation: Emergency services escalation with Brazilian emergency protocols
 * - ConsentDialog: LGPD compliant consent management dialog
 * - SchedulingUI: Telemedicine scheduling interface
 * - Integration with tRPC hooks from T037-T039
 * - CFM Resolution 2,314/2022 compliance
 * - LGPD compliance with audit logging
 * - Mobile-first Brazilian healthcare design
 * - Real-time WebSocket subscriptions
 * - ICP-Brasil digital certificate validation
 */

// Main Existing Components
export { ConsentDialog } from './ConsentDialog';
export { SchedulingUI } from './SchedulingUI';

// Enhanced T042 Components
export { EmergencyEscalation } from './EmergencyEscalation';
export { RealTimeChat } from './RealTimeChat';
export { SessionConsent } from './SessionConsent';
export { VideoConsultation } from './VideoConsultation';
export { WaitingRoom } from './WaitingRoom';

// Telemedicine Route Components
export { TelemedicineDashboard } from './routes/TelemedicineDashboard';

// Telemedicine Types and Interfaces
export type {
  AuditTrail,
  ComplianceReport,
  ConsentData,
  ConsultationNotes,
  EmergencyEscalationType,
  FollowUpSchedule,
  MedicalProtocol,
  PatientVitals,
  PrescriptionData,
  RealTimeChatMessage,
  SessionRecording,
  SessionStatus,
  TelemedicineMetrics,
  TelemedicineSession,
  VideoQualityMetrics,
} from './types/telemedicine-types';

// Telemedicine Hooks
export {
  useComplianceReporting,
  useConsultationNotes,
  useEmergencyEscalation,
  useFollowUpScheduling,
  useMedicalProtocols,
  usePatientVitals,
  usePrescriptionManagement,
  useRealTimeChat,
  useSessionConsent,
  useSessionRecording,
  useTelemedicineMetrics,
  useTelemedicineSession,
  useVideoConsultation,
} from './hooks';

// Utility Functions
export {
  checkCFMCompliance,
  encryptSessionData,
  escalateEmergency,
  formatMedicalData,
  generateComplianceReport,
  generateSessionAuditLog,
  sanitizePatientInfo,
  scheduleFollowUp,
  validatePrescription,
  validateSessionConsent,
} from './utils/telemedicine-utils';

/**
 * Usage Examples:
 *
 * // Basic video consultation
 * import { VideoConsultation } from '@/components/telemedicine';
 *
 * <VideoConsultation
 *   sessionId="session-123"
 *   patientId="pat-456"
 *   professionalId="prof-789"
 *   onSessionEnd={() => console.log('Session ended')}
 * />
 *
 * // Patient waiting room
 * import { WaitingRoom } from '@/components/telemedicine';
 *
 * <WaitingRoom
 *   sessionId="session-123"
 *   patientName="João Silva"
 *   estimatedWaitTime={15}
 *   onJoinSession={() => console.log('Joining session')}
 * />
 *
 * // Real-time chat interface
 * import { RealTimeChat } from '@/components/telemedicine';
 *
 * <RealTimeChat
 *   sessionId="session-123"
 *   participantId="part-456"
 *   enableAI={true}
 *   onMessageSent={(_message) => console.log('Message sent:', message)}
 * />
 *
 * // Session consent dialog
 * import { SessionConsent } from '@/components/telemedicine';
 *
 * <SessionConsent
 *   open={consentOpen}
 *   onOpenChange={setConsentOpen}
 *   patientId="pat-456"
 *   sessionType="consultation"
 *   onConsentGiven={(_consent) => console.log('Consent given:', consent)}
 * />
 *
 * // Emergency escalation interface
 * import { EmergencyEscalation } from '@/components/telemedicine';
 *
 * <EmergencyEscalation
 *   sessionId="session-123"
 *   escalationType="medical"
 *   onEscalationComplete={(_details) => console.log('Escalated:', details)}
 * />
 *
 * // LGPD consent dialog
 * import { ConsentDialog } from '@/components/telemedicine';
 *
 * <ConsentDialog
 *   open={consentOpen}
 *   onOpenChange={setConsentOpen}
 *   patientId="pat-456"
 *   onConsentGiven={(_consent) => console.log('Consent given:', consent)}
 * />
 *
 * // Telemedicine scheduling interface
 * import { SchedulingUI } from '@/components/telemedicine';
 *
 * <SchedulingUI
 *   professionalId="prof-789"
 *   availableSlots={slots}
 *   onSchedule={(_appointment) => console.log('Scheduled:', appointment)}
 * />
 *
 * // With tRPC hooks
 * import { useTelemedicineSession, useRealTimeChat } from '@/components/telemedicine';
 *
 * const { data: session } = useTelemedicineSession({
 *   sessionId: "session-123",
 *   includeConsent: true
 * });
 *
 * const { sendMessage, messages } = useRealTimeChat({
 *   sessionId: "session-123",
 *   enableAI: true
 * });
 */
