/**
 * @fileoverview WebRTC Infrastructure Export Module
 * @version 1.0.0
 * @description Entry point for WebRTC telemedicine infrastructure
 */

// Signaling infrastructure
export {
  createSignalingMessage,
  createSignalingServerStub,
  RTCSignalingServerStub,
} from './signaling-stub'

// Call management
export { createCallManagerStub, RTCCallManagerStub } from './call-manager-stub'

// Re-export types for convenience
export type {
  CallParticipant,
  MedicalDataClassification,
  RTCAuditLogEntry,
  RTCCallManager,
  RTCCallQualityMetrics,
  RTCConnectionState,
  RTCConsentManager,
  RTCError,
  RTCHealthcareConfiguration,
  RTCSignalingMessage,
  RTCSignalingServer,
  TelemedicineCallSession,
  TelemedicineCallType,
} from '@neonpro/types'
