/**
 * 🔐 Tipos e Interfaces do Sistema de Gerenciamento de Sessões
 *
 * Este arquivo define todos os tipos TypeScript utilizados no sistema
 * de gerenciamento de sessões, incluindo interfaces para sessões,
 * dispositivos, eventos de segurança, notificações e atividades.
 */

// ============================================================================
// TIPOS BÁSICOS
// ============================================================================

/**
 * Identificadores únicos
 */
export type UUID = string;
export type Timestamp = string | Date;
export type IPAddress = string;
export type UserAgent = string;
export type SessionToken = string;
export type DeviceFingerprint = string;

/**
 * Níveis de severidade
 */
export type SeverityLevel = 'low' | 'medium' | 'high' | 'critical';

/**
 * Níveis de risco
 */
export type RiskLevel = 'low' | 'medium' | 'high';

/**
 * Status de resolução
 */
export type ResolutionStatus =
  | 'pending'
  | 'investigating'
  | 'resolved'
  | 'dismissed';

/**
 * Tipos de dispositivo
 */
export type DeviceType = 'desktop' | 'mobile' | 'tablet' | 'unknown';

/**
 * Canais de notificação
 */
export type NotificationChannel = 'email' | 'sms' | 'push' | 'inApp';

/**
 * Prioridades de notificação
 */
export type NotificationPriority = 'low' | 'medium' | 'high' | 'critical';

/**
 * Status de notificação
 */
export type NotificationStatus =
  | 'pending'
  | 'sent'
  | 'delivered'
  | 'failed'
  | 'read';

// ============================================================================
// INTERFACES DE SESSÃO
// ============================================================================

/**
 * Interface principal da sessão do usuário
 */
export interface UserSession {
  id: UUID;
  userId: UUID;
  deviceId?: UUID;
  sessionToken: SessionToken;
  expiresAt: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastActivity: Timestamp;
  ipAddress?: IPAddress;
  userAgent?: UserAgent;
  isActive: boolean;
  metadata?: SessionMetadata;
}

/**
 * Metadados adicionais da sessão
 */
export interface SessionMetadata {
  location?: {
    country?: string;
    region?: string;
    city?: string;
    timezone?: string;
  };
  browser?: {
    name?: string;
    version?: string;
    engine?: string;
  };
  os?: {
    name?: string;
    version?: string;
    platform?: string;
  };
  screen?: {
    width?: number;
    height?: number;
    colorDepth?: number;
  };
  extensions?: number;
  warningsShown?: number;
  lastExtension?: Timestamp;
}

/**
 * Dados para criação de sessão
 */
export interface CreateSessionData {
  userId: UUID;
  deviceInfo?: DeviceInfo;
  ipAddress?: IPAddress;
  userAgent?: UserAgent;
  metadata?: Partial<SessionMetadata>;
}

/**
 * Dados para atualização de sessão
 */
export interface UpdateSessionData {
  expiresAt?: Timestamp;
  lastActivity?: Timestamp;
  metadata?: Partial<SessionMetadata>;
  isActive?: boolean;
}

/**
 * Estatísticas de sessão
 */
export interface SessionStatistics {
  totalSessions: number;
  activeSessions: number;
  expiredSessions: number;
  averageDuration: number;
  extensionRate: number;
  concurrentPeak: number;
  deviceBreakdown: Record<DeviceType, number>;
  locationBreakdown: Record<string, number>;
}

// ============================================================================
// INTERFACES DE DISPOSITIVO
// ============================================================================

/**
 * Interface principal do dispositivo
 */
export interface UserDevice {
  id: UUID;
  userId: UUID;
  name: string;
  type: DeviceType;
  fingerprint: DeviceFingerprint;
  userAgent?: UserAgent;
  ipAddress?: IPAddress;
  location?: string;
  isTrusted: boolean;
  riskLevel: RiskLevel;
  lastUsed: Timestamp;
  createdAt: Timestamp;
  metadata?: DeviceMetadata;
}

/**
 * Informações do dispositivo
 */
export interface DeviceInfo {
  name?: string;
  type?: DeviceType;
  fingerprint: DeviceFingerprint;
  userAgent?: UserAgent;
  ipAddress?: IPAddress;
  location?: string;
  metadata?: Partial<DeviceMetadata>;
}

/**
 * Metadados do dispositivo
 */
export interface DeviceMetadata {
  browser?: {
    name?: string;
    version?: string;
    engine?: string;
    plugins?: string[];
  };
  os?: {
    name?: string;
    version?: string;
    platform?: string;
    architecture?: string;
  };
  hardware?: {
    cpu?: string;
    memory?: number;
    gpu?: string;
    touchSupport?: boolean;
  };
  screen?: {
    width?: number;
    height?: number;
    colorDepth?: number;
    pixelRatio?: number;
  };
  network?: {
    connection?: string;
    downlink?: number;
    rtt?: number;
  };
  features?: {
    webgl?: boolean;
    canvas?: boolean;
    audio?: boolean;
    geolocation?: boolean;
  };
  firstSeen?: Timestamp;
  lastLocation?: string;
  loginCount?: number;
  suspiciousActivity?: boolean;
}

/**
 * Dados para registro de dispositivo
 */
export interface RegisterDeviceData {
  name: string;
  type: DeviceType;
  fingerprint: DeviceFingerprint;
  userAgent?: UserAgent;
  ipAddress?: IPAddress;
  location?: string;
  metadata?: Partial<DeviceMetadata>;
}

/**
 * Dados para atualização de dispositivo
 */
export interface UpdateDeviceData {
  name?: string;
  isTrusted?: boolean;
  riskLevel?: RiskLevel;
  lastUsed?: Timestamp;
  metadata?: Partial<DeviceMetadata>;
}

/**
 * Avaliação de risco do dispositivo
 */
export interface DeviceRiskAssessment {
  deviceId: UUID;
  riskLevel: RiskLevel;
  riskScore: number;
  factors: {
    newDevice: number;
    locationChange: number;
    timeAnomaly: number;
    browserChange: number;
    suspiciousActivity: number;
  };
  recommendations: string[];
  timestamp: Timestamp;
}

// ============================================================================
// INTERFACES DE ATIVIDADE
// ============================================================================

/**
 * Interface de atividade da sessão
 */
export interface SessionActivity {
  id: UUID;
  sessionId: UUID;
  userId: UUID;
  type: ActivityType;
  description?: string;
  pageUrl?: string;
  ipAddress?: IPAddress;
  userAgent?: UserAgent;
  createdAt: Timestamp;
  metadata?: ActivityMetadata;
}

/**
 * Tipos de atividade
 */
export type ActivityType =
  | 'page_view'
  | 'click'
  | 'form_submit'
  | 'api_call'
  | 'download'
  | 'upload'
  | 'search'
  | 'login'
  | 'logout'
  | 'session_extend'
  | 'custom';

/**
 * Metadados da atividade
 */
export interface ActivityMetadata {
  element?: string;
  formData?: Record<string, any>;
  apiEndpoint?: string;
  fileSize?: number;
  fileName?: string;
  searchQuery?: string;
  duration?: number;
  success?: boolean;
  errorMessage?: string;
  customData?: Record<string, any>;
}

/**
 * Dados para registro de atividade
 */
export interface RecordActivityData {
  type: ActivityType;
  description?: string;
  pageUrl?: string;
  metadata?: ActivityMetadata;
}

/**
 * Estatísticas de atividade
 */
export interface ActivityStatistics {
  totalActivities: number;
  activitiesByType: Record<ActivityType, number>;
  averageActivitiesPerSession: number;
  mostActivePages: Array<{ url: string; count: number }>;
  peakActivityHours: number[];
  activityTrends: Array<{ date: string; count: number }>;
}

// ============================================================================
// INTERFACES DE EVENTOS DE SEGURANÇA
// ============================================================================

/**
 * Interface de evento de segurança
 */
export interface SecurityEvent {
  id: UUID;
  userId: UUID;
  deviceId?: UUID;
  sessionId?: UUID;
  type: SecurityEventType;
  severity: SeverityLevel;
  description: string;
  ipAddress?: IPAddress;
  userAgent?: UserAgent;
  resolved: boolean;
  resolution?: string;
  createdAt: Timestamp;
  resolvedAt?: Timestamp;
  metadata?: SecurityEventMetadata;
}

/**
 * Tipos de evento de segurança
 */
export type SecurityEventType =
  | 'login_attempt'
  | 'login_failure'
  | 'login_success'
  | 'logout'
  | 'session_timeout'
  | 'session_hijack_attempt'
  | 'suspicious_activity'
  | 'device_registered'
  | 'device_blocked'
  | 'password_change'
  | 'email_change'
  | 'security_violation'
  | 'brute_force_attempt'
  | 'account_lockout'
  | 'unusual_location'
  | 'concurrent_sessions'
  | 'api_abuse'
  | 'data_breach_attempt';

/**
 * Metadados do evento de segurança
 */
export interface SecurityEventMetadata {
  attemptCount?: number;
  blockedReason?: string;
  riskScore?: number;
  detectionMethod?: string;
  affectedResources?: string[];
  mitigationActions?: string[];
  relatedEvents?: UUID[];
  geolocation?: {
    country?: string;
    region?: string;
    city?: string;
    coordinates?: [number, number];
  };
  threatIntelligence?: {
    knownThreat?: boolean;
    threatType?: string;
    confidence?: number;
  };
}

/**
 * Dados para criação de evento de segurança
 */
export interface CreateSecurityEventData {
  type: SecurityEventType;
  severity: SeverityLevel;
  description: string;
  deviceId?: UUID;
  sessionId?: UUID;
  ipAddress?: IPAddress;
  userAgent?: UserAgent;
  metadata?: SecurityEventMetadata;
}

/**
 * Dados para resolução de evento
 */
export interface ResolveSecurityEventData {
  eventId: UUID;
  resolution: string;
  resolvedBy?: UUID;
}

/**
 * Estatísticas de segurança
 */
export interface SecurityStatistics {
  totalEvents: number;
  eventsBySeverity: Record<SeverityLevel, number>;
  eventsByType: Record<SecurityEventType, number>;
  resolvedEvents: number;
  averageResolutionTime: number;
  threatTrends: Array<{ date: string; count: number; severity: SeverityLevel }>;
  topThreats: Array<{ type: SecurityEventType; count: number }>;
  riskScore: number;
}

// ============================================================================
// INTERFACES DE NOTIFICAÇÃO
// ============================================================================

/**
 * Interface de notificação
 */
export interface UserNotification {
  id: UUID;
  userId: UUID;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  channels: NotificationChannel[];
  status: NotificationStatus;
  read: boolean;
  sentAt?: Timestamp;
  readAt?: Timestamp;
  createdAt: Timestamp;
  metadata?: NotificationMetadata;
}

/**
 * Tipos de notificação
 */
export type NotificationType =
  | 'session_expiring'
  | 'session_expired'
  | 'new_device'
  | 'suspicious_login'
  | 'security_alert'
  | 'password_change'
  | 'email_change'
  | 'account_locked'
  | 'device_blocked'
  | 'unusual_activity'
  | 'system_maintenance'
  | 'feature_update'
  | 'custom';

/**
 * Metadados da notificação
 */
export interface NotificationMetadata {
  templateId?: string;
  templateData?: Record<string, any>;
  deliveryAttempts?: number;
  lastDeliveryAttempt?: Timestamp;
  deliveryErrors?: string[];
  clickTracking?: boolean;
  expiresAt?: Timestamp;
  actionButtons?: Array<{
    label: string;
    action: string;
    style?: 'primary' | 'secondary' | 'danger';
  }>;
  relatedEventId?: UUID;
  campaignId?: string;
}

/**
 * Dados para criação de notificação
 */
export interface CreateNotificationData {
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  channels: NotificationChannel[];
  metadata?: NotificationMetadata;
}

/**
 * Preferências de notificação do usuário
 */
export interface NotificationPreferences {
  userId: UUID;
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  inAppNotifications: boolean;
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
    timezone: string;
  };
  typePreferences: Partial<
    Record<
      NotificationType,
      {
        enabled: boolean;
        channels: NotificationChannel[];
        priority: NotificationPriority;
      }
    >
  >;
  frequency: {
    immediate: NotificationType[];
    daily: NotificationType[];
    weekly: NotificationType[];
    disabled: NotificationType[];
  };
  updatedAt: Timestamp;
}

// ============================================================================
// INTERFACES DE AUDITORIA
// ============================================================================

/**
 * Interface de log de auditoria
 */
export interface AuditLog {
  id: UUID;
  userId?: UUID;
  sessionId?: UUID;
  action: AuditAction;
  resource: string;
  resourceId?: UUID;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  ipAddress?: IPAddress;
  userAgent?: UserAgent;
  success: boolean;
  errorMessage?: string;
  createdAt: Timestamp;
  metadata?: AuditMetadata;
}

/**
 * Tipos de ação de auditoria
 */
export type AuditAction =
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'login'
  | 'logout'
  | 'register'
  | 'verify'
  | 'reset_password'
  | 'change_password'
  | 'change_email'
  | 'enable_2fa'
  | 'disable_2fa'
  | 'trust_device'
  | 'block_device'
  | 'extend_session'
  | 'revoke_session'
  | 'admin_action';

/**
 * Metadados de auditoria
 */
export interface AuditMetadata {
  adminUserId?: UUID;
  reason?: string;
  automated?: boolean;
  batchId?: string;
  correlationId?: string;
  requestId?: string;
  duration?: number;
  affectedRecords?: number;
}

// ============================================================================
// INTERFACES DE RESPOSTA DA API
// ============================================================================

/**
 * Resposta padrão da API
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata?: {
    timestamp: Timestamp;
    requestId: string;
    version: string;
  };
}

/**
 * Resposta paginada
 */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * Parâmetros de consulta
 */
export interface QueryParams {
  page?: number;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, any>;
  search?: string;
  dateFrom?: Timestamp;
  dateTo?: Timestamp;
}

// ============================================================================
// INTERFACES DE CONTEXTO
// ============================================================================

/**
 * Contexto da sessão para React
 */
export interface SessionContextValue {
  session: UserSession | null;
  user: any | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  timeRemaining: number;
  extendSession: () => Promise<boolean>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

/**
 * Contexto de dispositivos
 */
export interface DeviceContextValue {
  devices: UserDevice[];
  currentDevice: UserDevice | null;
  isLoading: boolean;
  registerDevice: (data: RegisterDeviceData) => Promise<UserDevice>;
  trustDevice: (deviceId: UUID) => Promise<void>;
  untrustDevice: (deviceId: UUID) => Promise<void>;
  removeDevice: (deviceId: UUID) => Promise<void>;
  reportSuspicious: (deviceId: UUID, reason: string) => Promise<void>;
  refreshDevices: () => Promise<void>;
}

/**
 * Contexto de segurança
 */
export interface SecurityContextValue {
  events: SecurityEvent[];
  statistics: SecurityStatistics | null;
  isLoading: boolean;
  refreshEvents: () => Promise<void>;
  resolveEvent: (eventId: UUID, resolution: string) => Promise<void>;
  createEvent: (data: CreateSecurityEventData) => Promise<void>;
}

// ============================================================================
// TIPOS UTILITÁRIOS
// ============================================================================

/**
 * Tipo para campos opcionais
 */
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Tipo para campos obrigatórios
 */
export type Required<T, K extends keyof T> = T & { [P in K]-?: T[P] };

/**
 * Tipo para criação (sem campos gerados)
 */
export type CreateType<T> = Omit<T, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * Tipo para atualização (campos opcionais)
 */
export type UpdateType<T> = Partial<Omit<T, 'id' | 'createdAt' | 'userId'>>;

/**
 * Filtros de consulta tipados
 */
export type FilterType<T> = {
  [K in keyof T]?:
    | T[K]
    | T[K][]
    | {
        eq?: T[K];
        ne?: T[K];
        gt?: T[K];
        gte?: T[K];
        lt?: T[K];
        lte?: T[K];
        in?: T[K][];
        nin?: T[K][];
        like?: string;
        ilike?: string;
      };
};

// ============================================================================
// CONSTANTES DE TIPOS
// ============================================================================

/**
 * Valores válidos para tipos de dispositivo
 */
export const DEVICE_TYPES: DeviceType[] = [
  'desktop',
  'mobile',
  'tablet',
  'unknown',
];

/**
 * Valores válidos para níveis de severidade
 */
export const SEVERITY_LEVELS: SeverityLevel[] = [
  'low',
  'medium',
  'high',
  'critical',
];

/**
 * Valores válidos para níveis de risco
 */
export const RISK_LEVELS: RiskLevel[] = ['low', 'medium', 'high'];

/**
 * Valores válidos para canais de notificação
 */
export const NOTIFICATION_CHANNELS: NotificationChannel[] = [
  'email',
  'sms',
  'push',
  'inApp',
];

/**
 * Valores válidos para prioridades de notificação
 */
export const NOTIFICATION_PRIORITIES: NotificationPriority[] = [
  'low',
  'medium',
  'high',
  'critical',
];

/**
 * Valores válidos para tipos de atividade
 */
export const ACTIVITY_TYPES: ActivityType[] = [
  'page_view',
  'click',
  'form_submit',
  'api_call',
  'download',
  'upload',
  'search',
  'login',
  'logout',
  'session_extend',
  'custom',
];

/**
 * Valores válidos para tipos de evento de segurança
 */
export const SECURITY_EVENT_TYPES: SecurityEventType[] = [
  'login_attempt',
  'login_failure',
  'login_success',
  'logout',
  'session_timeout',
  'session_hijack_attempt',
  'suspicious_activity',
  'device_registered',
  'device_blocked',
  'password_change',
  'email_change',
  'security_violation',
  'brute_force_attempt',
  'account_lockout',
  'unusual_location',
  'concurrent_sessions',
  'api_abuse',
  'data_breach_attempt',
];

/**
 * Valores válidos para tipos de notificação
 */
export const NOTIFICATION_TYPES: NotificationType[] = [
  'session_expiring',
  'session_expired',
  'new_device',
  'suspicious_login',
  'security_alert',
  'password_change',
  'email_change',
  'account_locked',
  'device_blocked',
  'unusual_activity',
  'system_maintenance',
  'feature_update',
  'custom',
];

/**
 * Valores válidos para ações de auditoria
 */
export const AUDIT_ACTIONS: AuditAction[] = [
  'create',
  'read',
  'update',
  'delete',
  'login',
  'logout',
  'register',
  'verify',
  'reset_password',
  'change_password',
  'change_email',
  'enable_2fa',
  'disable_2fa',
  'trust_device',
  'block_device',
  'extend_session',
  'revoke_session',
  'admin_action',
];

// ============================================================================
// GUARDS DE TIPO
// ============================================================================

/**
 * Verifica se um valor é um tipo de dispositivo válido
 */
export function isDeviceType(value: any): value is DeviceType {
  return DEVICE_TYPES.includes(value);
}

/**
 * Verifica se um valor é um nível de severidade válido
 */
export function isSeverityLevel(value: any): value is SeverityLevel {
  return SEVERITY_LEVELS.includes(value);
}

/**
 * Verifica se um valor é um nível de risco válido
 */
export function isRiskLevel(value: any): value is RiskLevel {
  return RISK_LEVELS.includes(value);
}

/**
 * Verifica se um valor é um canal de notificação válido
 */
export function isNotificationChannel(
  value: any
): value is NotificationChannel {
  return NOTIFICATION_CHANNELS.includes(value);
}

/**
 * Verifica se um valor é uma prioridade de notificação válida
 */
export function isNotificationPriority(
  value: any
): value is NotificationPriority {
  return NOTIFICATION_PRIORITIES.includes(value);
}

/**
 * Verifica se um valor é um tipo de atividade válido
 */
export function isActivityType(value: any): value is ActivityType {
  return ACTIVITY_TYPES.includes(value);
}

/**
 * Verifica se um valor é um tipo de evento de segurança válido
 */
export function isSecurityEventType(value: any): value is SecurityEventType {
  return SECURITY_EVENT_TYPES.includes(value);
}

/**
 * Verifica se um valor é um tipo de notificação válido
 */
export function isNotificationType(value: any): value is NotificationType {
  return NOTIFICATION_TYPES.includes(value);
}

/**
 * Verifica se um valor é uma ação de auditoria válida
 */
export function isAuditAction(value: any): value is AuditAction {
  return AUDIT_ACTIONS.includes(value);
}

// ============================================================================
// TIPOS DERIVADOS
// ============================================================================

/**
 * Tipo para dados de sessão sem campos internos
 */
export type PublicSessionData = Omit<UserSession, 'sessionToken' | 'metadata'>;

/**
 * Tipo para dados de dispositivo público
 */
export type PublicDeviceData = Omit<UserDevice, 'fingerprint' | 'metadata'>;

/**
 * Tipo para estatísticas combinadas
 */
export type CombinedStatistics = {
  session: SessionStatistics;
  activity: ActivityStatistics;
  security: SecurityStatistics;
  summary: {
    totalUsers: number;
    activeUsers: number;
    riskScore: number;
    healthScore: number;
  };
};

/**
 * Tipo para configurações do usuário
 */
export type UserSettings = {
  notifications: NotificationPreferences;
  security: {
    twoFactorEnabled: boolean;
    trustedDevicesOnly: boolean;
    sessionTimeout: number;
    requireLocationVerification: boolean;
  };
  privacy: {
    trackActivity: boolean;
    shareAnalytics: boolean;
    dataRetention: number;
  };
};

/**
 * Tipo para dashboard de administrador
 */
export type AdminDashboard = {
  statistics: CombinedStatistics;
  alerts: SecurityEvent[];
  recentActivity: SessionActivity[];
  systemHealth: {
    uptime: number;
    performance: number;
    errors: number;
    warnings: number;
  };
  users: {
    total: number;
    active: number;
    locked: number;
    suspicious: number;
  };
};

export default {};
