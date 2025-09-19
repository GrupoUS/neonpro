/**
 * AI Chat Component Types
 * 
 * Comprehensive TypeScript types for AI chat components,
 * healthcare compliance, and integration interfaces.
 */

// =====================================
// BASE TYPES
// =====================================

export interface BaseMessage {
  /** Unique message identifier */
  id: string;
  /** Message content */
  content: string;
  /** Message role */
  role: 'user' | 'assistant' | 'system';
  /** Timestamp */
  timestamp: Date;
  /** Message status */
  status?: 'pending' | 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  /** Additional metadata */
  metadata?: Record<string, unknown>;
}

// =====================================
// AI MODEL TYPES
// =====================================

export interface AIModel {
  /** Unique model identifier */
  id: string;
  /** Display name */
  name: string;
  /** Provider name */
  provider: string;
  /** Model capabilities */
  capabilities: ModelCapability[];
  /** Healthcare optimization status */
  healthcareOptimized: boolean;
  /** Model availability status */
  status: ModelStatus;
  /** Model version */
  version?: string;
  /** Maximum context length */
  maxTokens?: number;
  /** Cost per 1K tokens */
  costPer1kTokens?: {
    input: number;
    output: number;
  };
  /** Custom icon component */
  icon?: React.ReactNode;
  /** Supported languages */
  supportedLanguages?: string[];
  /** Special features */
  features?: string[];
}

export type ModelCapability = 
  | 'chat'
  | 'reasoning'
  | 'healthcare-context'
  | 'multimodal'
  | 'function-calling'
  | 'code-generation'
  | 'translation'
  | 'summarization'
  | 'analysis';

export type ModelStatus = 'available' | 'limited' | 'unavailable' | 'deprecated';

// =====================================
// MESSAGE TYPES
// =====================================

export interface ChatMessage extends BaseMessage {
  /** AI model used for this message */
  model?: string;
  /** Confidence score (0-1) */
  confidence?: number;
  /** Processing time in milliseconds */
  processingTime?: number;
  /** Healthcare context flag */
  healthcareContext?: boolean;
  /** Session type */
  sessionType?: 'client' | 'financial' | 'appointment' | 'general';
  /** Citations and sources */
  sources?: MessageSource[];
  /** Tool calls made during message generation */
  toolCalls?: ToolCall[];
  /** Streaming status */
  isStreaming?: boolean;
  /** Parent message ID (for threading) */
  parentId?: string;
  /** Thread ID */
  threadId?: string;
  /** Message attachments */
  attachments?: MessageAttachment[];
  /** Reaction data */
  reactions?: MessageReaction[];
  /** Edit history */
  editHistory?: MessageEdit[];
  /** Flags for moderation */
  flags?: MessageFlag[];
}

export interface MessageSource {
  /** Source identifier */
  id: string;
  /** Source title */
  title: string;
  /** Source content excerpt */
  content?: string;
  /** Source URL */
  url?: string;
  /** Relevance score (0-1) */
  relevance: number;
  /** Source type */
  type: SourceType;
  /** Source metadata */
  metadata?: Record<string, unknown>;
}

export type SourceType = 
  | 'document'
  | 'database'
  | 'knowledge_base'
  | 'external'
  | 'patient_record'
  | 'medical_guideline'
  | 'research_paper'
  | 'internal_policy';

export interface ToolCall {
  /** Tool call ID */
  id: string;
  /** Tool name */
  name: string;
  /** Tool arguments */
  arguments: Record<string, unknown>;
  /** Tool execution status */
  status: ToolCallStatus;
  /** Tool result */
  result?: unknown;
  /** Execution time */
  executionTime?: number;
  /** Error message if failed */
  error?: string;
}

export type ToolCallStatus = 'pending' | 'executing' | 'completed' | 'failed';

export interface MessageAttachment {
  /** Attachment ID */
  id: string;
  /** File name */
  name: string;
  /** File type (MIME) */
  type: string;
  /** File size in bytes */
  size: number;
  /** File URL */
  url?: string;
  /** Upload status */
  status: AttachmentStatus;
  /** Upload progress (0-100) */
  progress?: number;
  /** Thumbnail URL */
  thumbnailUrl?: string;
  /** File metadata */
  metadata?: Record<string, unknown>;
}

export type AttachmentStatus = 'uploading' | 'uploaded' | 'failed' | 'processing';

export interface MessageReaction {
  /** Emoji or reaction type */
  type: string;
  /** User ID who reacted */
  userId: string;
  /** Reaction timestamp */
  timestamp: Date;
}

export interface MessageEdit {
  /** Edit timestamp */
  timestamp: Date;
  /** Edited by user ID */
  editedBy: string;
  /** Previous content */
  previousContent: string;
  /** Edit reason */
  reason?: string;
}

export interface MessageFlag {
  /** Flag ID */
  id: string;
  /** Flag type */
  type: FlagType;
  /** Flag reason */
  reason: string;
  /** Flagged by user ID */
  flaggedBy: string;
  /** Flag timestamp */
  timestamp: Date;
  /** Flag status */
  status: FlagStatus;
  /** Moderator notes */
  moderatorNotes?: string;
}

export type FlagType = 
  | 'inappropriate'
  | 'spam'
  | 'harassment'
  | 'medical_inaccuracy'
  | 'privacy_violation'
  | 'other';

export type FlagStatus = 'pending' | 'reviewed' | 'resolved' | 'dismissed';

// =====================================
// SESSION TYPES
// =====================================

export interface ChatSession {
  /** Session ID */
  id: string;
  /** Session type */
  type: SessionType;
  /** Session title */
  title?: string;
  /** Session status */
  status: SessionStatus;
  /** Creation timestamp */
  createdAt: Date;
  /** Last update timestamp */
  updatedAt: Date;
  /** Messages in session */
  messages: ChatMessage[];
  /** Session participants */
  participants: SessionParticipant[];
  /** Session settings */
  settings: SessionSettings;
  /** Session metadata */
  metadata: SessionMetadata;
  /** Healthcare context */
  healthcareContext?: HealthcareContext;
}

export type SessionType = 'client' | 'financial' | 'appointment' | 'general' | 'training';

export type SessionStatus = 'active' | 'archived' | 'pending' | 'closed';

export interface SessionParticipant {
  /** Participant ID */
  id: string;
  /** Participant role */
  role: ParticipantRole;
  /** Join timestamp */
  joinedAt: Date;
  /** Leave timestamp */
  leftAt?: Date;
  /** Participant metadata */
  metadata?: Record<string, unknown>;
}

export type ParticipantRole = 
  | 'user'
  | 'assistant'
  | 'healthcare_professional'
  | 'supervisor'
  | 'observer';

export interface SessionSettings {
  /** AI model preference */
  preferredModel?: string;
  /** Language preference */
  language?: string;
  /** Voice input enabled */
  voiceInputEnabled?: boolean;
  /** File attachments enabled */
  fileAttachmentsEnabled?: boolean;
  /** Search enabled */
  searchEnabled?: boolean;
  /** LGPD compliance settings */
  lgpdSettings?: LGPDSettings;
  /** Accessibility settings */
  accessibility?: AccessibilitySettings;
}

export interface SessionMetadata {
  /** Session duration */
  duration?: number;
  /** Message count */
  messageCount: number;
  /** Token usage */
  tokenUsage?: TokenUsage;
  /** Cost estimate */
  costEstimate?: number;
  /** Satisfaction score */
  satisfactionScore?: number;
  /** Tags */
  tags?: string[];
  /** Categories */
  categories?: string[];
}

export interface HealthcareContext {
  /** Patient information */
  patient?: PatientInfo;
  /** Healthcare professional information */
  professional?: ProfessionalInfo;
  /** Medical context */
  medicalContext?: MedicalContext;
  /** Appointment context */
  appointmentContext?: AppointmentContext;
}

export interface PatientInfo {
  /** Patient ID */
  id: string;
  /** Patient name */
  name: string;
  /** CPF (Brazilian ID) */
  cpf?: string;
  /** Date of birth */
  dateOfBirth?: Date;
  /** Gender */
  gender?: string;
  /** Medical conditions */
  medicalConditions?: string[];
  /** Allergies */
  allergies?: string[];
  /** Current medications */
  currentMedications?: string[];
  /** Last visit date */
  lastVisitDate?: Date;
  /** Patient notes */
  notes?: string;
}

export interface ProfessionalInfo {
  /** Professional ID */
  id: string;
  /** Professional name */
  name: string;
  /** Specialty */
  specialty: string;
  /** CRM number */
  crmNumber: string;
  /** License number */
  licenseNumber?: string;
  /** Department */
  department?: string;
  /** Contact information */
  contact?: ContactInfo;
}

export interface ContactInfo {
  /** Email address */
  email?: string;
  /** Phone number */
  phone?: string;
  /** Extension */
  extension?: string;
}

export interface MedicalContext {
  /** Current symptoms */
  symptoms?: string[];
  /** Diagnosis */
  diagnosis?: string[];
  /** Treatment plan */
  treatmentPlan?: string;
  /** Medical history summary */
  medicalHistory?: string;
  /** Risk factors */
  riskFactors?: string[];
  /** Preventive care */
  preventiveCare?: string[];
}

export interface AppointmentContext {
  /** Appointment ID */
  appointmentId?: string;
  /** Appointment type */
  appointmentType?: string;
  /** Scheduled date */
  scheduledDate?: Date;
  /** Appointment status */
  status?: string;
  /** Location */
  location?: string;
  /** Special instructions */
  specialInstructions?: string;
}

// =====================================
// COMPLIANCE TYPES
// =====================================

export interface LGPDSettings {
  /** Data retention period in days */
  dataRetentionDays: number;
  /** Explicit consent required */
  requiresExplicitConsent: boolean;
  /** Consent given */
  consentGiven: boolean;
  /** Consent timestamp */
  consentTimestamp?: Date;
  /** Data processing purposes */
  dataProcessingPurposes: string[];
  /** Data subjects */
  dataSubjects: string[];
  /** Anonymization settings */
  anonymizationSettings?: AnonymizationSettings;
}

export interface AnonymizationSettings {
  /** Enable anonymization */
  enabled: boolean;
  /** Fields to anonymize */
  fieldsToAnonymize: string[];
  /** Anonymization method */
  method: 'masking' | 'generalization' | 'pseudonymization';
  /** Retention policy for original data */
  originalDataRetentionDays?: number;
}

export interface AccessibilitySettings {
  /** High contrast mode */
  highContrastMode: boolean;
  /** Font size */
  fontSize: 'small' | 'medium' | 'large' | 'x-large';
  /** Screen reader optimized */
  screenReaderOptimized: boolean;
  /** Keyboard navigation enabled */
  keyboardNavigationEnabled: boolean;
  /** Reduced motion */
  reducedMotion: boolean;
  /** Text to speech enabled */
  textToSpeechEnabled: boolean;
}

// =====================================
// SEARCH TYPES
// =====================================

export interface SearchQuery {
  /** Search query text */
  query: string;
  /** Search scope */
  scope: SearchScope;
  /** Filters */
  filters?: SearchFilters;
  /** Sort options */
  sortBy?: SearchSortOption;
  /** Pagination */
  pagination?: SearchPagination;
}

export type SearchScope = 
  | 'current_session'
  | 'all_sessions'
  | 'knowledge_base'
  | 'patient_records'
  | 'medical_guidelines'
  | 'documents';

export interface SearchFilters {
  /** Date range */
  dateRange?: {
    start: Date;
    end: Date;
  };
  /** Message types */
  messageTypes?: ('user' | 'assistant' | 'system')[];
  /** Session types */
  sessionTypes?: SessionType[];
  /** Model filters */
  models?: string[];
  /** Healthcare context only */
  healthcareContextOnly?: boolean;
  /** Include archived */
  includeArchived?: boolean;
  /** Minimum confidence score */
  minConfidence?: number;
}

export type SearchSortOption = 
  | 'relevance'
  | 'date_desc'
  | 'date_asc'
  | 'confidence_desc'
  | 'confidence_asc';

export interface SearchPagination {
  /** Page number */
  page: number;
  /** Items per page */
  limit: number;
  /** Total items (response only) */
  total?: number;
}

export interface SearchResult {
  /** Search result ID */
  id: string;
  /** Result type */
  type: SearchResultType;
  /** Title */
  title: string;
  /** Content excerpt */
  excerpt: string;
  /** Relevance score */
  relevance: number;
  /** Source information */
  source: SearchResultSource;
  /** Metadata */
  metadata?: Record<string, unknown>;
  /** Highlighted snippets */
  highlights?: string[];
}

export type SearchResultType = 
  | 'message'
  | 'session'
  | 'knowledge_entry'
  | 'patient_record'
  | 'medical_guideline'
  | 'document';

export interface SearchResultSource {
  /** Source ID */
  id: string;
  /** Source type */
  type: SourceType;
  /** Source name */
  name: string;
  /** Source URL */
  url?: string;
}

export interface SearchResults {
  /** Search results */
  results: SearchResult[];
  /** Total results count */
  total: number;
  /** Search execution time */
  executionTime: number;
  /** Search query */
  query: SearchQuery;
  /** Suggestions */
  suggestions?: string[];
  /** Facets */
  facets?: SearchFacets;
}

export interface SearchFacets {
  /** Message type counts */
  messageTypes: Record<string, number>;
  /** Session type counts */
  sessionTypes: Record<SessionType, number>;
  /** Model counts */
  models: Record<string, number>;
  /** Date distribution */
  dateDistribution: Record<string, number>;
}

// =====================================
// VOICE RECOGNITION TYPES
// =====================================

export interface VoiceRecognitionConfig {
  /** Language code */
  language: string;
  /** Continuous recognition */
  continuous: boolean;
  /** Interim results */
  interimResults: boolean;
  /** Maximum duration */
  maxDuration?: number;
  /** Silence timeout */
  silenceTimeout?: number;
}

export interface VoiceRecognitionResult {
  /** Recognition ID */
  id: string;
  /** Transcribed text */
  transcript: string;
  /** Confidence score */
  confidence: number;
  /** Alternatives */
  alternatives: VoiceRecognitionAlternative[];
  /** Processing time */
  processingTime: number;
  /** Language detected */
  languageDetected?: string;
}

export interface VoiceRecognitionAlternative {
  /** Alternative transcript */
  transcript: string;
  /** Confidence score */
  confidence: number;
}

export type VoiceRecognitionState = 
  | 'idle'
  | 'listening'
  | 'processing'
  | 'error'
  | 'success';

// =====================================
// TOKEN USAGE TYPES
// =====================================

export interface TokenUsage {
  /** Input tokens */
  input: number;
  /** Output tokens */
  output: number;
  /** Total tokens */
  total: number;
  /** Cost calculation */
  cost?: number;
  /** Cache hits */
  cacheHits?: number;
}

// =====================================
// UTILITY TYPES
// =====================================

export interface LoadingState {
  /** Loading status */
  isLoading: boolean;
  /** Loading message */
  message?: string;
  /** Progress (0-100) */
  progress?: number;
  /** Estimated time remaining */
  estimatedTimeRemaining?: number;
}

export interface ErrorState {
  /** Error flag */
  hasError: boolean;
  /** Error message */
  message?: string;
  /** Error code */
  code?: string;
  /** Error details */
  details?: Record<string, unknown>;
}

export interface ComponentState {
  /** Loading states */
  loading: Record<string, LoadingState>;
  /** Error states */
  errors: Record<string, ErrorState>;
  /** Component settings */
  settings: Record<string, unknown>;
  /** Component data */
  data: Record<string, unknown>;
}

// =====================================
// EVENT HANDLER TYPES
// =====================================

export type MessageActionHandler = (action: string, messageId: string) => void;
export type CopyHandler = (content: string) => void;
export type SpeakHandler = (content: string) => void;
export type EditHandler = (messageId: string, newContent: string) => void;
export type DeleteHandler = (messageId: string) => void;
export type FlagHandler = (messageId: string) => void;
export type FileAttachHandler = (files: File[]) => void;
export type FileRemoveHandler = (fileId: string) => void;
export type SearchHandler = (query: string) => void;
export type ModelChangeHandler = (model: string) => void;
export type VoiceToggleHandler = () => void;
export type SessionActionHandler = (action: string, sessionId: string) => void;

// =====================================
// COMPONENT PROPS TYPES
// =====================================

export interface ChatComponentProps {
  /** Patient context */
  patientContext?: PatientInfo;
  /** Healthcare professional context */
  healthcareProfessional?: ProfessionalInfo;
  /** Default AI model */
  defaultModel?: string;
  /** Show model selection */
  showModelSelection?: boolean;
  /** Show voice input */
  showVoiceInput?: boolean;
  /** Show file attachments */
  showFileAttachment?: boolean;
  /** Show search functionality */
  showSearch?: boolean;
  /** LGPD consent settings */
  lgpdConsent?: LGPDSettings;
  /** Mobile optimization */
  mobileOptimized?: boolean;
  /** Maximum height */
  maxHeight?: string;
  /** Test ID */
  testId?: string;
  /** Session type */
  sessionType?: SessionType;
}

export interface InputComponentProps {
  /** Input value */
  value: string;
  /** On change handler */
  onChange: (value: string) => void;
  /** On submit handler */
  onSubmit: (e: React.FormEvent) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Available AI models */
  availableModels?: AIModel[];
  /** Selected model */
  selectedModel?: string;
  /** Voice recognition state */
  voiceState?: VoiceRecognitionState;
  /** Attached files */
  attachments?: MessageAttachment[];
  /** Healthcare compliance */
  healthcareCompliance?: {
    lgpdCompliant: boolean;
    requiresConsent: boolean;
    consentGiven: boolean;
  };
  /** Loading state */
  isLoading?: boolean;
  /** Minimum height */
  minHeight?: number;
  /** Maximum height */
  maxHeight?: number;
}

export interface MessageDisplayProps {
  /** Message content */
  content: string;
  /** Message role */
  role: 'user' | 'assistant' | 'system';
  /** Message timestamp */
  timestamp: Date;
  /** Message ID */
  messageId: string;
  /** Is streaming */
  isStreaming?: boolean;
  /** Streaming content */
  streamingContent?: string;
  /** AI model used */
  model?: string;
  /** Confidence score */
  confidence?: number;
  /** Processing time */
  processingTime?: number;
  /** Healthcare context */
  healthcareContext?: boolean;
  /** Sources/citations */
  sources?: MessageSource[];
  /** Metadata */
  metadata?: Record<string, unknown>;
  /** Show timestamp */
  showTimestamp?: boolean;
  /** Show model info */
  showModelInfo?: boolean;
  /** Show actions */
  showActions?: boolean;
  /** Compact mode */
  compact?: boolean;
}

// =====================================
