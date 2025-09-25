/**
 * CopilotKit integration types for unified AI services
 * @package @neonpro/ai-services
 */

// CopilotKit integration types
export * from './hooks';
export * from './actions';
export * from './state';

// CopilotKit specific type exports
export type {
  CopilotKitHook,
  UseAgentState,
  UseClinicalActions,
  UseAestheticActions,
  UseComplianceActions,
  UseRealtimeActions,
  AgentState,
  ClinicalActions,
  AestheticActions,
  ComplianceActions,
  RealtimeActions,
  HookConfig,
  HookOptions
} from './hooks';

export type {
  ClinicalAction,
  AestheticAction,
  ComplianceAction,
  RealtimeAction,
  ActionContext,
  ActionResult,
  ActionError,
  ActionMetadata,
  ActionValidation,
  ActionExecution,
  ActionResponse,
  PatientAssessmentAction,
  TreatmentPlanningAction,
  ClinicalDecisionAction,
  AestheticConsultationAction,
  OutcomePredictionAction,
  DataProtectionAction,
  ConsentManagementAction
} from './actions';

export type {
  SessionState,
  PatientState,
  AgentState as CopilotAgentState,
  ServiceState,
  ComplianceState,
  RealtimeState,
  StateContext,
  StateTransition,
  StateValidation,
  StatePersistence,
  StateSynchronization,
  StateConfig
} from './state';