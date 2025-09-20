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
export { ConsentDialog } from "./ConsentDialog";
export { SchedulingUI } from "./SchedulingUI";
export { VideoConsultation } from "./VideoConsultation";
export { WaitingRoom } from "./WaitingRoom";

// T042: Phase 3.5 New Components
export { EmergencyEscalation } from "./EmergencyEscalation";
export { RealTimeChat } from "./RealTimeChat";
export { SessionConsent } from "./SessionConsent";

// Types and Utilities (to be created)
export type {
  ChatMessage,
  ConsentFormData,
  EmergencyData,
  SessionConsentData,
  TelemedicineSessionData,
} from "./types";
export {
  formatSessionTime,
  getEmergencyPriorityColor,
  processAITranscription,
  telemedicineUtils,
  validateMedicalTerms,
} from "./utils";

// Re-export hooks for convenience
export {
  useEmergencyEscalation,
  useMedicalTranscription,
  useRealTimeChat,
  useSessionAnalytics,
  useSessionAuditLog,
  useSessionConsent,
  useSessionRecording,
  useTelemedicineAvailability,
  useTelemedicineSession,
  useVideoCall,
} from "@/hooks/use-telemedicine"; /**
 * Usage Examples:
 *
 * // Video consultation with medical protocols
 * import { VideoConsultation } from '@/components/telemedicine';
 *
 * <VideoConsultation
 *   sessionId="session-123"
 *   patientId="pat-456"
 *   professionalId="prof-789"
 *   onSessionEnd={(data) => console.log('Session ended:', data)}
 * />
 *
 * // Waiting room with LGPD consent
 * import { WaitingRoom } from '@/components/telemedicine';
 *
 * <WaitingRoom
 *   appointmentId="apt-123"
 *   patientName="Maria Silva"
 *   estimatedWaitTime={15}
 *   onConsentComplete={(consent) => console.log('Consent:', consent)}
 * />
 *
 * // Real-time medical chat with AI transcription
 * import { RealTimeChat } from '@/components/telemedicine';
 *
 * <RealTimeChat
 *   sessionId="session-123"
 *   participantId="user-456"
 *   participantType="patient"
 *   language="pt-BR"
 *   enableAITranscription={true}
 *   enableVoiceInput={true}
 * />
 *
 * // Pre-consultation consent with CFM compliance
 * import { SessionConsent } from '@/components/telemedicine';
 *
 * <SessionConsent
 *   sessionId="session-123"
 *   patientId="pat-456"
 *   professionalId="prof-789"
 *   consultationType="video"
 *   onConsentComplete={(data) => console.log('Consent completed:', data)}
 * />
 *
 * // Emergency escalation with Brazilian protocols
 * import { EmergencyEscalation } from '@/components/telemedicine';
 *
 * <EmergencyEscalation
 *   sessionId="session-123"
 *   patientId="pat-456"
 *   patientLocation="São Paulo, SP"
 *   visible={emergencyVisible}
 *   onEscalationComplete={(data) => console.log('Emergency escalated:', data)}
 * />
 *
 * // LGPD consent dialog
 * import { ConsentDialog } from '@/components/telemedicine';
 *
 * <ConsentDialog
 *   open={consentOpen}
 *   onOpenChange={setConsentOpen}
 *   patientId="pat-456"
 *   onConsentGiven={(consent) => console.log('Consent given:', consent)}
 * />
 *
 * // Telemedicine scheduling interface
 * import { SchedulingUI } from '@/components/telemedicine';
 *
 * <SchedulingUI
 *   professionalId="prof-789"
 *   availableSlots={slots}
 *   onSchedule={(appointment) => console.log('Scheduled:', appointment)}
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

export default {
  VideoConsultation,
  WaitingRoom,
  ConsentDialog,
  SchedulingUI,
  RealTimeChat,
  SessionConsent,
  EmergencyEscalation,
};
