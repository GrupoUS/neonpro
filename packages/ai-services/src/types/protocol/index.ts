/**
 * Protocol integration types for unified AI services
 * @package @neonpro/ai-services
 */

// AG-UI Protocol integration
export * from './agui-events';
export * from './agui-responses';
export * from './websocket';

// AG-UI specific type exports
export type {
  AGUIEvent,
  AGUIResponse,
  AGUIEventType,
  AGUIEventSource,
  AGUIResponseCode,
  HealthcareEvent,
  ClinicalEvent,
  AestheticEvent,
  PatientInquiryEvent,
  ClinicalDecisionRequestEvent,
  AestheticConsultationEvent,
  TreatmentPlanningEvent,
  OutcomePredictionEvent,
  WebSocketMessage,
  WebSocketMessageType,
  WebSocketConnection,
  WebSocketConfig
} from './agui-events';

export type {
  AGUIStandardResponse,
  AGUIErrorResponse,
  AGUISuccessResponse,
  AGUIValidationResponse,
  AGUIStreamingResponse,
  ResponseMetadata,
  ComplianceMetadata,
  PerformanceMetrics,
  ResponseHeaders
} from './agui-responses';

export type {
  RealtimeMessage,
  RealtimeEventType,
  RealtimeSession,
  RealtimeConnection,
  RealtimeConfig,
  MessageDeliveryStatus,
  ConnectionStatus
} from './websocket';