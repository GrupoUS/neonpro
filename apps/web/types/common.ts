// Placeholder file
export const placeholder = true;
// =============================================================================
// 🤖 AI AGENT TYPES - Healthcare Specialized Chat System
// =============================================================================
// Sistema de Chat AI com Agente Inteligente Healthcare
// Integrado com Archon MCP e base de dados específica do cliente
// =============================================================================

export interface AgentMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  metadata?: {
    audioTranscription?: boolean;
    confidence?: number;
    clientContext?: string;
    archonQuery?: boolean;
    tokens?: number;
    processingTime?: number;
  };
}

export interface ClientContext {
  clinicId: string;
  userId: string;
  userRole: "admin" | "doctor" | "nurse" | "staff" | "patient";
  userName: string;
  currentPage: string;
  sessionId: string;
  recentActivities: string[];

  // Healthcare Metrics
  patientCount: number;
  todayAppointments: number;
  pendingTasks: number;

  // Compliance Status
  complianceStatus: {
    lgpd: "compliant" | "warning" | "violation";
    anvisa: "compliant" | "warning" | "violation";
    cfm: "compliant" | "warning" | "violation";
    lastAudit: Date;
  };

  // ML Pipeline Integration
  mlPipelineMetrics?: {
    noShowAccuracy: number;
    driftStatus: "stable" | "warning" | "critical";
    lastModelUpdate: Date;
    predictionsToday: number;
    systemHealth: "optimal" | "degraded" | "critical";
  };

  // Recent Data Points for Context
  recentPatients: string[];
  recentAlerts: string[];
  systemNotifications: string[];
}

export interface AgentCapabilities {
  dataAnalysis: boolean;
  voiceInput: boolean;
  archonIntegration: boolean;
  mlPipelineAccess: boolean;
  complianceMonitoring: boolean;
  reportGeneration: boolean;
  patientDataAccess: boolean;
  appointmentManagement: boolean;
  financialInsights: boolean;
  predictiveAnalytics: boolean;
}

export interface VoiceInputState {
  isListening: boolean;
  isProcessing: boolean;
  transcript: string;
  confidence: number;
  error?: string;
  language: "pt-BR" | "en-US";
  autoStop: boolean;
}

export interface AgentChatState {
  isOpen: boolean;
  isLoading: boolean;
  isInitializing: boolean;
  messages: AgentMessage[];
  clientContext: ClientContext | null;
  voiceInput: VoiceInputState;
  capabilities: AgentCapabilities;
  error?: string;
  lastActivity: Date;
}

export interface ArchonQueryResult {
  success: boolean;
  data: any;
  source: "rag" | "code_examples" | "task_data" | "project_data";
  confidence: number;
  timestamp: Date;
  query: string;
  tokens: number;
}

export interface AgentResponse {
  content: string;
  metadata: {
    archonQueries?: ArchonQueryResult[];
    dataSourcesUsed: string[];
    confidence: number;
    processingTime: number;
    tokens: number;
    suggestedActions?: string[];
  };
  followUpQuestions?: string[];
}

// =============================================================================
// SPEECH RECOGNITION TYPES
// =============================================================================

declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

export interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

export interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
  length: number;
  isFinal: boolean;
}

export interface SpeechRecognitionAlternative {
  confidence: number;
  transcript: string;
}

export interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
}

export interface SpeechRecognitionConfig {
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  lang: string;
  grammars?: SpeechGrammarList;
}

// =============================================================================
// HEALTHCARE-SPECIFIC AGENT CONTEXT
// =============================================================================

export interface HealthcarePromptContext {
  userRole: string;
  clinicSpecialty: string;
  clinicName: string;
  currentPatientCount: number;

  // Compliance & Alerts
  complianceAlerts: {
    type: "lgpd" | "anvisa" | "cfm";
    severity: "low" | "medium" | "high" | "critical";
    message: string;
    timestamp: Date;
  }[];

  // Performance Metrics
  recentMetrics: {
    noShowRate: number;
    patientSatisfaction: number;
    systemUptime: number;
    averageResponseTime: number;
    dailyActiveUsers: number;
  };

  // Intelligent Suggestions
  suggestedActions: {
    action: string;
    priority: "low" | "medium" | "high";
    category: "efficiency" | "compliance" | "patient_care" | "revenue";
    estimatedImpact: string;
  }[];

  // System Status
  systemStatus: {
    mlPipeline: "operational" | "degraded" | "down";
    database: "operational" | "degraded" | "down";
    backups: "current" | "delayed" | "failed";
    integrations: "operational" | "partial" | "down";
  };
}

// =============================================================================
// AGENT CONFIGURATION & SETTINGS
// =============================================================================

export interface AgentConfig {
  model: "anthropic" | "openai" | "google";
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
  enableVoice: boolean;
  enableArchonIntegration: boolean;
  enableMLPipelineAccess: boolean;
  autoSuggestions: boolean;
  contextMemoryLength: number;
  debugMode: boolean;
}

export interface AgentAnalytics {
  totalInteractions: number;
  averageResponseTime: number;
  userSatisfactionScore: number;
  mostUsedFeatures: string[];
  errorRate: number;
  voiceUsagePercentage: number;
  peakUsageHours: number[];
  commonQueries: {
    query: string;
    frequency: number;
    averageResponseTime: number;
  }[];
}

// =============================================================================
// UI & COMPONENT TYPES
// =============================================================================

export interface ChatPopupPosition {
  bottom: number;
  right: number;
  width: number;
  height: number;
}

export interface ChatUIState {
  isMinimized: boolean;
  isExpanded: boolean;
  showVoiceButton: boolean;
  showSettings: boolean;
  theme: "light" | "dark" | "healthcare";
  fontSize: "small" | "medium" | "large";
}

export interface AgentPersonality {
  name: string;
  avatar: string;
  greeting: string;
  expertise: string[];
  tone: "professional" | "friendly" | "clinical" | "adaptive";
  language: "pt-BR" | "en-US" | "multi";
}
export default placeholder;
