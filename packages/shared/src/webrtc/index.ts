/**
 * @fileoverview WebRTC Infrastructure Export Module
 * @version 1.0.0
 * @description Entry point for WebRTC telemedicine infrastructure
 */

// Signaling infrastructure
export { 
  RTCSignalingServerStub, 
  createSignalingServerStub, 
  createSignalingMessage 
} from './signaling-stub';

// Call management
export { 
  RTCCallManagerStub, 
  createCallManagerStub 
} from './call-manager-stub';

// Re-export types for convenience
export type {
  RTCSignalingServer,
  RTCSignalingMessage,
  RTCCallManager,
  TelemedicineCallSession,
  CallParticipant,
  RTCHealthcareConfiguration,
  RTCCallQualityMetrics,
  RTCError,
  RTCConnectionState,
  TelemedicineCallType,
  MedicalDataClassification,
  RTCAuditLogEntry,
  RTCConsentManager
} from '@neonpro/types';