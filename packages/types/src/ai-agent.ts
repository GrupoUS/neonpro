/**
 * AI Agent Types for Natural Language Query Processing
 * Shared types for API and Web applications
 */

// Healthcare-compliant constraint types for AI Agent
export interface QueryEntities {
  names?: string[];
  dates?: string[];
  locations?: string[];
  medicalTerms?: string[];
  [key: string]: unknown;
}

export interface ResponseData {
  id?: string;
  name?: string;
  value?: string | number;
  date?: string;
  status?: string;
  [key: string]: unknown;
}

export interface ChartMetadata {
  color?: string;
  label?: string;
  category?: string;
  timestamp?: string;
  [key: string]: unknown;
}

export interface ActionParameters {
  id?: string;
  type?: string;
  filters?: Record<string, unknown>;
  pagination?: {
    page: number;
    limit: number;
  };
  [key: string]: unknown;
}

export interface UserPreferences {
  language?: string;
  timezone?: string;
  dateFormat?: string;
  theme?: 'light' | 'dark' | 'auto';
  notifications?: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  [key: string]: unknown;
}

export interface CachedData {
  patients?: Array<{
    id: string;
    name: string;
    lastVisit?: string;
  }>;
  appointments?: Array<{
    id: string;
    date: string;
    status: string;
  }>;
  [key: string]: unknown;
}

export interface MessageData {
  type?: string;
  entity?: string;
  action?: string;
  [key: string]: unknown;
}

export interface MessageMetadata {
  source?: string;
  priority?: 'low' | 'medium' | 'high';
  category?: string;
  [key: string]: unknown;
}

export interface ActionPayload {
  targetId?: string;
  actionType?: string;
  parameters?: Record<string, unknown>;
  timestamp?: string;
  [key: string]: unknown;
}

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
  | 'client_data' | 'appointments'
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
  rawEntities?: QueryEntities;
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
  [key: string]: unknown;
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
  data?: ResponseData[];
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
  format?: (value: unknown) => string;
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
  metadata?: ChartMetadata;
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
  parameters?: ActionParameters;
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
  preferences?: UserPreferences;
  /** Recent conversation history */
  recentIntents?: QueryIntent[];
  /** Cached data for context */
  cachedData?: CachedData;
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
  | 'read_clients' | 'write_clients'
  | 'read_appointments' | 'write_appointments'
  | 'read_financial' | 'write_financial'
  | 'read_medical' | 'write_medical'
  | 'manage_users' | 'view_analytics';

export type DataScope =
  | 'own_clients' | 'all_clients'
  | 'financial_read' | 'financial_write'
  | 'medical_read' | 'medical_write';

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
  role: 'user' | 'assistant';
  /** Message content */
  content: string;
  /** When the message was sent */
  timestamp: Date;
  /** Optional structured data */
  data?: MessageData;
  /** Optional interactive actions */
  actions?: AgentAction[];
  /** Optional metadata */
  metadata?: MessageMetadata;
}

export interface AgentAction {
  id: string;
  label: string;
  icon?: string;
  primary?: boolean;
  type: 'view_details' | 'create_appointment' | 'export_data' | 'navigate' | 'refresh';
  payload?: ActionPayload;
}