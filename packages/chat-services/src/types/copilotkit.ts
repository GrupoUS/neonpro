/**
 * CopilotKit Integration Types
 */

import { EnhancedChatMessage, EnhancedChatSession, ChatRole } from './chat';
import { ClinicalChatMessage, AestheticChatMessage, PatientEducationChatMessage, EmergencyChatMessage } from './healthcare-chat';

// CopilotKit Agent Types
export interface CopilotKitAgent {
  id: string;
  name: string;
  type: AgentType;
  description: string;
  capabilities: AgentCapability[];
  config: AgentConfig;
  state: AgentState;
  hooks: AgentHooks;
}

export type AgentType = 
  | 'clinical_assistant' 
  | 'aesthetic_advisor' 
  | 'patient_educator' 
  | 'emergency_responder' 
  | 'general_assistant';

export interface AgentCapability {
  type: CapabilityType;
  description: string;
  enabled: boolean;
  config: Record<string, unknown>;
}

export type CapabilityType = 
  | 'text_generation' 
  | 'image_analysis' 
  | 'document_analysis' 
  | 'appointment_scheduling' 
  | 'prescription_management' 
  | 'emergency_triage' 
  | 'patient_education' 
  | 'clinical_decision_support';

export interface AgentConfig {
  model: string;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
  tools: Tool[];
  actions: Action[];
  memory: MemoryConfig;
  safety: SafetyConfig;
}

export interface Tool {
  name: string;
  description: string;
  parameters: ToolParameters;
  handler: ToolHandler;
}

export interface ToolParameters {
  type: 'object';
  properties: Record<string, ParameterProperty>;
  required: string[];
}

export interface ParameterProperty {
  type: string;
  description: string;
  enum?: string[];
  default?: unknown;
}

export type ToolHandler = (parameters: Record<string, unknown>) => Promise<ToolResult>;

export interface ToolResult {
  success: boolean;
  result: unknown;
  error?: string;
  metadata?: Record<string, unknown>;
}

export interface Action {
  name: string;
  description: string;
  parameters: ActionParameters;
  handler: ActionHandler;
  ui?: ActionUI;
}

export interface ActionParameters {
  type: 'object';
  properties: Record<string, ParameterProperty>;
  required: string[];
}

export type ActionHandler = (parameters: Record<string, unknown>, context: ActionContext) => Promise<ActionResult>;

export interface ActionResult {
  success: boolean;
  message: string;
  data?: unknown;
  error?: string;
  nextActions?: string[];
}

export interface ActionContext {
  sessionId: string;
  userId: string;
  patientId?: string;
  messageHistory: EnhancedChatMessage[];
  currentMessage: EnhancedChatMessage;
  metadata: Record<string, unknown>;
}

export interface ActionUI {
  type: 'button' | 'form' | 'modal' | 'select' | 'input';
  label: string;
  placeholder?: string;
  options?: UIOption[];
  validation?: UIValidation;
}

export interface UIOption {
  value: string;
  label: string;
  description?: string;
}

export interface UIValidation {
  required: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
}

export interface MemoryConfig {
  enabled: boolean;
  maxMessages: number;
  retention: 'session' | 'user' | 'permanent';
  summarization: boolean;
}

export interface SafetyConfig {
  enabled: boolean;
  contentFilter: boolean;
  piiDetection: boolean;
  emergencyDetection: boolean;
  humanReview: boolean;
}

export interface AgentState {
  status: 'idle' | 'processing' | 'error' | 'completed';
  currentTask?: string;
  progress: number;
  error?: string;
  lastUpdate: string;
  metrics: AgentMetrics;
}

export interface AgentMetrics {
  messagesProcessed: number;
  averageResponseTime: number;
  successRate: number;
  errorRate: number;
  userSatisfaction: number;
}

export interface AgentHooks {
  useCoAgent: UseCoAgentHook;
  useChatState: UseChatStateHook;
  useActions: UseActionsHook;
  useMemory: UseMemoryHook;
}

// Hook Types
export interface UseCoAgentHook {
  agent: CopilotKitAgent;
  sendMessage: (message: string) => Promise<void>;
  sendAction: (action: string, parameters: Record<string, unknown>) => Promise<void>;
  state: AgentState;
  isProcessing: boolean;
  error: string | null;
}

export interface UseChatStateHook {
  messages: EnhancedChatMessage[];
  session: EnhancedChatSession | null;
  isLoading: boolean;
  error: string | null;
  addMessage: (message: EnhancedChatMessage) => void;
  updateSession: (updates: Partial<EnhancedChatSession>) => void;
  clearMessages: () => void;
}

export interface UseActionsHook {
  actions: Action[];
  executeAction: (action: string, parameters: Record<string, unknown>) => Promise<ActionResult>;
  isExecuting: boolean;
  lastResult: ActionResult | null;
}

export interface UseMemoryHook {
  memories: Memory[];
  addMemory: (memory: Memory) => void;
  searchMemories: (query: string) => Memory[];
  clearMemories: () => void;
}

export interface Memory {
  id: string;
  content: string;
  type: MemoryType;
  timestamp: string;
  context: string;
  importance: number;
  tags: string[];
}

export type MemoryType = 'fact' | 'preference' | 'history' | 'medical' | 'personal';

// Healthcare-specific CopilotKit Actions
export interface HealthcareActions {
  clinical: ClinicalActions;
  aesthetic: AestheticActions;
  education: EducationActions;
  emergency: EmergencyActions;
  administrative: AdministrativeActions;
}

export interface ClinicalActions {
  assessSymptoms: ClinicalAction;
  recommendTreatment: ClinicalAction;
  prescribeMedication: ClinicalAction;
  orderTests: ClinicalAction;
  referSpecialist: ClinicalAction;
  provideDiagnosis: ClinicalAction;
  createTreatmentPlan: ClinicalAction;
  documentEncounter: ClinicalAction;
}

export interface ClinicalAction {
  name: string;
  description: string;
  parameters: ClinicalActionParameters;
  handler: ClinicalActionHandler;
  validation: ClinicalValidation[];
  requirements: ClinicalRequirement[];
}

export interface ClinicalActionParameters {
  patientId: string;
  symptoms?: SymptomInput[];
  assessment?: ClinicalAssessmentInput;
  treatment?: TreatmentInput;
  prescription?: PrescriptionInput;
  tests?: TestOrder[];
  notes?: string;
}

export interface SymptomInput {
  symptom: string;
  severity: 'mild' | 'moderate' | 'severe';
  duration: string;
  location?: string;
  description?: string;
}

export interface ClinicalAssessmentInput {
  primaryDiagnosis?: string;
  differentialDiagnoses?: string[];
  severity: 'mild' | 'moderate' | 'severe';
  urgency: 'low' | 'medium' | 'high' | 'urgent';
  requiresImmediateAttention: boolean;
}

export interface TreatmentInput {
  procedure: string;
  description: string;
  timeline: string;
  risks: string[];
  benefits: string[];
  alternatives: string[];
}

export interface PrescriptionInput {
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  indications: string;
  contraindications: string[];
}

export interface TestOrder {
  test: string;
  reason: string;
  urgency: 'routine' | 'urgent' | 'stat';
  instructions?: string;
}

export interface ClinicalValidation {
  type: 'required' | 'recommended' | 'conditional';
  field: string;
  condition: string;
  message: string;
}

export interface ClinicalRequirement {
  type: 'license' | 'specialty' | 'training' | 'certification';
  value: string;
  description: string;
}

export type ClinicalActionHandler = (parameters: ClinicalActionParameters, context: ActionContext) => Promise<ActionResult>;

export interface AestheticActions {
  analyzeSkin: AestheticAction;
  recommendTreatments: AestheticAction;
  assessSuitability: AestheticAction;
  provideConsultation: AestheticAction;
  createTreatmentPlan: AestheticAction;
  trackResults: AestheticAction;
}

export interface AestheticAction {
  name: string;
  description: string;
  parameters: AestheticActionParameters;
  handler: AestheticActionHandler;
  validation: AestheticValidation[];
  requirements: AestheticRequirement[];
}

export interface AestheticActionParameters {
  patientId: string;
  skinType: string;
  concerns: AestheticConcern[];
  goals: AestheticGoal[];
  budget?: BudgetRange;
  previousTreatments?: PreviousTreatment[];
  photos?: string[];
}

export interface AestheticConcern {
  concern: string;
  severity: 'mild' | 'moderate' | 'severe';
  area: string;
  duration: string;
}

export interface AestheticGoal {
  area: string;
  desiredOutcome: string;
  priority: 'low' | 'medium' | 'high';
  timeline: string;
}

export interface BudgetRange {
  minimum: number;
  maximum: number;
  currency: string;
  flexible: boolean;
}

export interface PreviousTreatment {
  procedure: string;
  date: string;
  results: string;
  satisfaction: number;
}

export interface AestheticValidation {
  type: 'required' | 'recommended' | 'conditional';
  field: string;
  condition: string;
  message: string;
}

export interface AestheticRequirement {
  type: 'license' | 'training' | 'certification' | 'experience';
  value: string;
  description: string;
}

export type AestheticActionHandler = (parameters: AestheticActionParameters, context: ActionContext) => Promise<ActionResult>;

export interface EducationActions {
  provideEducation: EducationAction;
  assessUnderstanding: EducationAction;
  createLearningPlan: EducationAction;
  trackProgress: EducationAction;
  recommendResources: EducationAction;
}

export interface EducationAction {
  name: string;
  description: string;
  parameters: EducationActionParameters;
  handler: EducationActionHandler;
  validation: EducationValidation[];
}

export interface EducationActionParameters {
  patientId: string;
  topic: string;
  literacyLevel: 'basic' | 'intermediate' | 'advanced';
  language: string;
  format: 'text' | 'video' | 'interactive' | 'audio';
  assessment: boolean;
}

export interface EducationValidation {
  type: 'required' | 'recommended';
  field: string;
  condition: string;
  message: string;
}

export type EducationActionHandler = (parameters: EducationActionParameters, context: ActionContext) => Promise<ActionResult>;

export interface EmergencyActions {
  triagePatient: EmergencyAction;
  provideEmergencyGuidance: EmergencyAction;
  activateEmergencyProtocol: EmergencyAction;
  coordinateCare: EmergencyAction;
}

export interface EmergencyAction {
  name: string;
  description: string;
  parameters: EmergencyActionParameters;
  handler: EmergencyActionHandler;
  validation: EmergencyValidation[];
  urgency: 'immediate' | 'urgent' | 'delayed';
}

export interface EmergencyActionParameters {
  patientId: string;
  chiefComplaint: string;
  symptoms: EmergencySymptom[];
  vitalSigns?: VitalSigns;
  currentLocation: string;
  contactInfo: EmergencyContact;
}

export interface EmergencySymptom {
  symptom: string;
  severity: 'mild' | 'moderate' | 'severe' | 'life_threatening';
  duration: string;
  onset: string;
}

export interface VitalSigns {
  temperature?: number;
  bloodPressure?: { systolic: number; diastolic: number };
  heartRate?: number;
  respiratoryRate?: number;
  oxygenSaturation?: number;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

export interface EmergencyValidation {
  type: 'required' | 'critical';
  field: string;
  condition: string;
  message: string;
}

export type EmergencyActionHandler = (parameters: EmergencyActionParameters, context: ActionContext) => Promise<ActionResult>;

export interface AdministrativeActions {
  scheduleAppointment: AdministrativeAction;
  manageRecords: AdministrativeAction;
  handleBilling: AdministrativeAction;
  managePrescriptions: AdministrativeAction;
  coordinateReferrals: AdministrativeAction;
}

export interface AdministrativeAction {
  name: string;
  description: string;
  parameters: AdministrativeActionParameters;
  handler: AdministrativeActionHandler;
  validation: AdministrativeValidation[];
}

export interface AdministrativeActionParameters {
  patientId: string;
  actionType: string;
  details: Record<string, unknown>;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export interface AdministrativeValidation {
  type: 'required' | 'recommended';
  field: string;
  condition: string;
  message: string;
}

export type AdministrativeActionHandler = (parameters: AdministrativeActionParameters, context: ActionContext) => Promise<ActionResult>;

// CopilotKit UI Components
export interface CopilotKitUI {
  ChatComponent: React.ComponentType<CopilotKitChatProps>;
  ActionButton: React.ComponentType<CopilotKitActionButtonProps>;
  AgentSelector: React.ComponentType<CopilotKitAgentSelectorProps>;
  MessageList: React.ComponentType<CopilotKitMessageListProps>;
  InputForm: React.ComponentType<CopilotKitInputFormProps>;
}

export interface CopilotKitChatProps {
  agent: CopilotKitAgent;
  sessionId: string;
  userId: string;
  patientId?: string;
  theme?: 'light' | 'dark';
  className?: string;
  onMessage?: (message: EnhancedChatMessage) => void;
  onAction?: (action: ActionResult) => void;
  onError?: (error: string) => void;
}

export interface CopilotKitActionButtonProps {
  action: string;
  label: string;
  parameters?: Record<string, unknown>;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
}

export interface CopilotKitAgentSelectorProps {
  agents: CopilotKitAgent[];
  selectedAgent: CopilotKitAgent;
  onAgentChange: (agent: CopilotKitAgent) => void;
  className?: string;
}

export interface CopilotKitMessageListProps {
  messages: EnhancedChatMessage[];
  isLoading: boolean;
  className?: string;
  renderMessage?: (message: EnhancedChatMessage) => React.ReactNode;
}

export interface CopilotKitInputFormProps {
  onSendMessage: (message: string) => void;
  onSendAction: (action: string, parameters: Record<string, unknown>) => void;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
}

// CopilotKit Configuration
export interface CopilotKitConfig {
  agents: CopilotKitAgent[];
  ui: CopilotKitUIConfig;
  realtime: RealtimeConfig;
  storage: StorageConfig;
  security: SecurityConfig;
  analytics: AnalyticsConfig;
}

export interface CopilotKitUIConfig {
  theme: 'light' | 'dark' | 'auto';
  components: ComponentConfig;
  localization: LocalizationConfig;
  accessibility: AccessibilityConfig;
}

export interface ComponentConfig {
  showAgentSelector: boolean;
  showActionButtons: boolean;
  showTypingIndicator: boolean;
  showTimestamps: boolean;
  messageLimit: number;
  autoScroll: boolean;
}

export interface LocalizationConfig {
  language: string;
  dateFormat: string;
  timeFormat: string;
  messages: Record<string, string>;
}

export interface AccessibilityConfig {
  highContrast: boolean;
  largeText: boolean;
  screenReader: boolean;
  keyboardNavigation: boolean;
}

// CopilotKit State Management
export interface CopilotKitState {
  sessions: Map<string, EnhancedChatSession>;
  messages: Map<string, EnhancedChatMessage[]>;
  agents: Map<string, CopilotKitAgent>;
  actions: Map<string, Action>;
  memories: Map<string, Memory[]>;
  userPreferences: Map<string, UserPreferences>;
}

export interface UserPreferences {
  language: string;
  theme: 'light' | 'dark' | 'auto';
  fontSize: 'small' | 'medium' | 'large';
  agentPreferences: Record<string, string>;
  notificationSettings: NotificationSettings;
}

export interface NotificationSettings {
  messages: boolean;
  actions: boolean;
  system: boolean;
  sound: boolean;
  desktop: boolean;
}