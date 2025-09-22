/**
 * AI Agent Database Integration Types
 *
 * Types for the conversational AI interface that enables natural language
 * queries to client, appointment, and financial data with proper security controls.
 */

export interface UserQuery {
  /** Unique identifier (UUID) */
  id: string;
  /** Session identifier for conversation context */
  sessionId: string;
  /** User who submitted the query */
  _userId: string;
  /** Natural language text input */
  _query: string;
  /** Parsed intent classification */
  intent: QueryIntent;
  /** Extracted parameters from the query */
  parameters: QueryParameters;
  /** When the query was submitted */
  timestamp: Date;
  /** Query processing status */
  status: QueryStatus;
}

export type QueryIntent =
  | 'client_data'
  | 'appointments'
  | 'financial'
  | 'general'
  | 'unknown';

export interface QueryParameters {
  /** Client names extracted from query */
  clientNames?: string[];
  /** Date ranges extracted from query */
  dateRanges?: DateRange[];
  /** Specific dates mentioned */
  dates?: Date[];
  /** Financial parameters */
  financial?: {
    type?: 'revenue' | 'payments' | 'expenses' | 'all';
    period?: 'today' | 'week' | 'month' | 'year' | 'custom';
  };
  /** Raw extracted entities for further processing */
  rawEntities?: Record<string, any>;
}

export interface DateRange {
  start: Date;
  end: Date;
}

export type QueryStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed';

export interface ResponseMetadata {
  /** Response confidence score */
  confidence?: number;
  /** Model used for generation */
  model?: string;
  /** Processing duration in ms */
  processingTime?: number;
  /** Additional metadata */
  [key: string]: any;
}

export interface AgentResponse {
  /** Unique identifier (UUID) */
  id: string;
  /** Reference to the original query */
  queryId: string;
  /** Response type for UI rendering */
  type: ResponseType;
  /** Response content object */
  content: ResponseContent;
  /** Available interactive actions */
  actions?: InteractiveAction[];
  /** Response metadata */
  metadata: ResponseMetadata;
  /** When the response was generated */
  timestamp: Date;
  /** Time taken to generate response (ms) */
  processingTime: number;
}

export type ResponseType =
  | 'text'
  | 'list'
  | 'table'
  | 'chart'
  | 'error';

export interface ResponseContent {
  /** Display title for the response */
  title?: string;
  /** Plain text description */
  text?: string;
  /** Structured data for tables/lists */
  data?: any[];
  /** Column definitions for tabular data */
  columns?: TableColumn[];
  /** Chart configuration */
  chart?: ChartConfig;
  /** Error details if type is 'error' */
  error?: {
    code: string;
    message: string;
    suggestion?: string;
  };
}

export interface TableColumn {
  /** Unique column identifier */
  key: string;
  /** Display label */
  label: string;
  /** Data type */
  type: 'string' | 'number' | 'date' | 'boolean' | 'currency';
  /** Whether column is sortable */
  sortable?: boolean;
  /** Column width (CSS) */
  width?: string;
  /** Format function for display */
  format?: (value: any) => string;
}

export interface ChartConfig {
  /** Chart type */
  type: 'line' | 'bar' | 'pie' | 'area';
  /** Data points */
  data: ChartDataPoint[];
  /** X-axis configuration */
  xAxis?: ChartAxis;
  /** Y-axis configuration */
  yAxis?: ChartAxis;
  /** Chart title */
  title?: string;
  /** Chart colors */
  colors?: string[];
}

export interface ChartDataPoint {
  label: string;
  value: number;
  metadata?: Record<string, any>;
}

export interface ChartAxis {
  title?: string;
  type?: 'category' | 'number' | 'time';
  format?: (value: any) => string;
}

export interface InteractiveAction {
  /** Unique action identifier */
  id: string;
  /** Display label for the action */
  label: string;
  /** Action type */
  type: 'button' | 'link' | 'form';
  /** Action handler function name */
  action: string;
  /** Action-specific parameters */
  parameters?: Record<string, any>;
  /** Whether action requires confirmation */
  confirm?: boolean;
  /** Confirmation message */
  confirmMessage?: string;
  /** Icon for the action */
  icon?: string;
  /** Styling variant */
  variant?: 'primary' | 'secondary' | 'danger';
}

export interface ChatSession {
  /** Session identifier (UUID) */
  id: string;
  /** User identifier */
  _userId: string;
  /** Session status */
  status: SessionStatus;
  /** When the session started */
  createdAt: Date;
  /** Last interaction timestamp */
  lastActivity: Date;
  /** Conversation context object */
  _context: SessionContext;
  /** Number of messages in session */
  messageCount: number;
}

export type SessionStatus =
  | 'active'
  | 'expired'
  | 'terminated';

export interface SessionContext {
  /** User's current domain */
  domain: string;
  /** User role for permission checking */
  _role: UserRole;
  /** Active filters or preferences */
  preferences?: Record<string, any>;
  /** Recent conversation history */
  recentIntents?: QueryIntent[];
  /** Cached data for context */
  cachedData?: Record<string, any>;
}

export type UserRole =
  | 'admin'
  | 'doctor'
  | 'nurse'
  | 'receptionist';

export interface PermissionContext {
  /** User identifier */
  _userId: string;
  /** Organization/clinic domain */
  domain: string;
  /** User role */
  _role: UserRole;
  /** Specific permissions array */
  permissions: Permission[];
  /** Data access scope */
  dataScope: DataScope;
  /** Last access timestamp */
  lastAccess: Date;
  /** When current session expires */
  sessionExpiry: Date;
}

export type Permission =
  | 'read_clients'
  | 'write_clients'
  | 'read_appointments'
  | 'write_appointments'
  | 'read_financial'
  | 'write_financial'
  | 'read_medical'
  | 'write_medical'
  | 'manage_users'
  | 'view_analytics';

export type DataScope =
  | 'own_clients'
  | 'all_clients'
  | 'financial_read'
  | 'financial_write'
  | 'medical_read'
  | 'medical_write';

export interface AgentQueryRequest {
  /** Natural language query from user */
  _query: string;
  /** Unique session identifier for conversation context */
  sessionId: string;
  /** Optional conversation context */
  _context?: {
    /** User identifier */
    _userId?: string;
    /** Recent conversation history */
    previousMessages?: ChatMessage[];
  };
}

export interface ChatMessage {
  /** Unique identifier (UUID) */
  id: string;
  /** Message role */
  _role: 'user' | 'assistant';
  /** Message content */
  content: string;
  /** When the message was sent */
  timestamp: Date;
  /** Optional structured data */
  data?: Record<string, any>;
  /** Optional interactive actions */
  actions?: AgentAction[];
  /** Optional metadata */
  metadata?: Record<string, any>;
}

export interface SessionResponse {
  /** Session identifier */
  sessionId: string;
  /** User identifier */
  _userId: string;
  /** Session status */
  status: SessionStatus;
  /** Conversation messages */
  messages?: ChatMessage[];
  /** When the session started */
  createdAt: Date;
  /** Last activity timestamp */
  lastActivity: Date;
  /** Number of messages in session */
  messageCount: number;
}

export interface FeedbackRequest {
  /** ID of the message being rated */
  messageId: string;
  /** Feedback details */
  feedback: {
    /** Rating from 1 (poor) to 5 (excellent) */
    rating: number;
    /** Optional feedback comment */
    comment?: string;
    /** Whether the response was helpful */
    helpful?: boolean;
  };
}

export interface FeedbackResponse {
  /** Whether feedback was submitted successfully */
  success: boolean;
  /** Confirmation message */
  message: string;
  /** Feedback ID for tracking */
  feedbackId?: string;
}

// Type guards for runtime validation
export function isUserQuery(obj: any): obj is UserQuery {
  const hasTimestamp = !!obj
    && (
      obj.timestamp instanceof Date
      || (typeof obj.timestamp === 'string' && !isNaN(Date.parse(obj.timestamp)))
      || (typeof obj.timestamp === 'number' && !Number.isNaN(obj.timestamp))
    );

  return !!obj
    && typeof obj.id === 'string'
    && typeof obj.sessionId === 'string'
    && typeof obj.userId === 'string'
    && typeof obj.query === 'string'
    && typeof obj.intent === 'string'
    && (typeof obj.parameters === 'object' || obj.parameters === undefined)
    && hasTimestamp
    && typeof obj.status === 'string';
}

export function isAgentResponse(obj: any): obj is AgentResponse {
  const hasTimestamp = !!obj
    && (
      obj.timestamp instanceof Date
      || (typeof obj.timestamp === 'string' && !isNaN(Date.parse(obj.timestamp)))
      || (typeof obj.timestamp === 'number' && !Number.isNaN(obj.timestamp))
    );

  return !!obj
    && typeof obj.id === 'string'
    && typeof obj.queryId === 'string'
    && typeof obj.type === 'string'
    && typeof obj.content === 'object'
    && (obj.metadata === undefined || typeof obj.metadata === 'object')
    && hasTimestamp
    && typeof obj.processingTime === 'number'
    && Number.isFinite(obj.processingTime);
}

export function isInteractiveAction(obj: any): obj is AgentAction {
  const validTypes = ['view_details', 'create_appointment', 'export_data', 'navigate', 'refresh'];
  return !!obj
    && typeof obj.id === 'string'
    && typeof obj.label === 'string'
    && typeof obj.type === 'string'
    && validTypes.includes(obj.type)
    && (obj.payload === undefined || typeof obj.payload === 'object')
    && (obj.primary === undefined || typeof obj.primary === 'boolean');
}

// Additional types for DataAgentChat component
export interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  error?: string;
}

export interface DataAgentRequest {
  _query: string;
  sessionId?: string;
  userContext: {
    _userId: string;
    userRole: 'admin' | 'professional' | 'assistant' | 'receptionist';
    domain?: string;
  };
}

export interface DataAgentResponse {
  success: boolean;
  response: {
    id: string;
    message: string;
    data?: {
      clients?: ClientData[];
      appointments?: AppointmentData[];
      financial?: FinancialData[];
    };
    actions?: AgentAction[];
    suggestions?: string[];
  };
}

export interface ClientData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  status: string;
}

export interface AppointmentData {
  id: string;
  clientName: string;
  scheduledAt: string;
  serviceName: string;
  status: string;
}

export interface FinancialData {
  id: string;
  clientName: string;
  serviceName: string;
  amount: number;
  status: string;
}

export interface AgentAction {
  id: string;
  label: string;
  icon?: string;
  primary?: boolean;
  type: 'view_details' | 'create_appointment' | 'export_data' | 'navigate' | 'refresh';
  _payload?: Record<string, any>;
}
