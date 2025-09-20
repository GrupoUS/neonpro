// Centralized compliance/telemedicine event type unions used across services
// Keep consistent with DB audit tables and socket events. Prefer kebab-case for API actions.

export type ComplianceEventType =
  | "session-start"
  | "session-end"
  | "participant-join"
  | "participant-leave"
  | "recording-start"
  | "recording-stop"
  | "data-access"
  | "consent-given"
  | "consent-revoked"
  | "error-occurred"
  // server-internal/legacy variants found in services
  | "session_created"
  | "session_started"
  | "session_ended"
  | "session_cancelled"
  | "compliance_check"
  | "violation"
  | "api_request"
  | "consent_updated"
  // additional legacy/Socket events used in services
  | "participant_joined"
  | "participant_left"
  | "participant_timeout"
  | "connection_issue"
  | "webrtc_offer"
  | "webrtc_answer";

export type WebRTCSignalType =
  | "offer"
  | "answer"
  | "ice-candidate"
  | "connection-state";
