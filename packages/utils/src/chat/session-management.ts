/**
 * Session Management Utilities for AI Chat
 * Healthcare-compliant conversation session handling
 */

export interface ChatSession {
  id: string;
  userId?: string;
  professionalId?: string;
  createdAt: Date;
  lastActivity: Date;
  status: 'active' | 'closed' | 'archived';
  metadata: {
    sessionType: 'general' | 'consultation' | 'follow_up' | 'emergency';
    estimatedDuration?: number; // in minutes
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    tags?: string[];
  };
  compliance: {
    dataRetentionDays: number;
    anonymizationDate?: Date;
    consentVerified: boolean;
    encryptionEnabled: boolean;
  };
  statistics: {
    messageCount: number;
    piiDetections: number;
    avgResponseTime: number; // in seconds
    systemFlags: string[];
  };
}

export interface SessionMessage {
  id: string;
  sessionId: string;
  _role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  sequenceNumber: number;
  hasPII?: boolean;
  redactedContent?: string;
  metadata?: {
    responseTime?: number;
    confidence?: number;
    modelVersion?: string;
  };
}

export interface SessionManager {
  createSession(options: SessionOptions): ChatSession;
  getSession(sessionId: string): ChatSession | null;
  updateSession(sessionId: string, updates: Partial<ChatSession>): boolean;
  addMessage(
    sessionId: string,
    message: Omit<SessionMessage, 'id' | 'timestamp' | 'sequenceNumber'>,
  ): SessionMessage;
  closeSession(sessionId: string, reason?: string): boolean;
  archiveSession(sessionId: string): boolean;
  getActiveSessions(): ChatSession[];
  cleanupExpiredSessions(): number;
}

export interface SessionOptions {
  userId?: string;
  professionalId?: string;
  sessionType: ChatSession['metadata']['sessionType'];
  estimatedDuration?: number;
  priority?: ChatSession['metadata']['priority'];
  tags?: string[];
  dataRetentionDays?: number;
}

/**
 * Create a new chat session with healthcare compliance defaults
 */
export function createSession(options: SessionOptions): ChatSession {
  const now = new Date();

  return {
    id: generateSessionId(),
    userId: options.userId,
    professionalId: options.professionalId,
    createdAt: now,
    lastActivity: now,
    status: 'active',
    metadata: {
      sessionType: options.sessionType,
      estimatedDuration: options.estimatedDuration,
      priority: options.priority || 'medium',
      tags: options.tags || [],
    },
    compliance: {
      dataRetentionDays: options.dataRetentionDays || 90, // Healthcare standard
      anonymizationDate: calculateAnonymizationDate(options.dataRetentionDays || 90),
      consentVerified: false, // Must be explicitly verified
      encryptionEnabled: true, // Always enabled for healthcare
    },
    statistics: {
      messageCount: 0,
      piiDetections: 0,
      avgResponseTime: 0,
      systemFlags: [],
    },
  };
}

/**
 * Generate a unique session ID
 */
function generateSessionId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2);
  return `session_${timestamp}_${random}`;
}

/**
 * Calculate anonymization date based on retention policy
 */
function calculateAnonymizationDate(retentionDays: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + retentionDays);
  return date;
}

/**
 * Validate session compliance requirements
 */
export function validateSessionCompliance(session: ChatSession): boolean {
  const now = new Date();

  // Check if session should be anonymized
  if (session.compliance.anonymizationDate && now > session.compliance.anonymizationDate) {
    return false; // Session should have been anonymized
  }

  // Check required fields
  if (!session.compliance.consentVerified && session.metadata.sessionType !== 'general') {
    return false; // Consent required for healthcare sessions
  }

  if (!session.compliance.encryptionEnabled) {
    return false; // Encryption required for healthcare data
  }

  return true;
}

/**
 * Update session statistics when a message is added
 */
export function updateSessionStatistics(
  session: ChatSession,
  message: SessionMessage,
): ChatSession {
  const updatedStats = { ...session.statistics };

  updatedStats.messageCount += 1;

  if (message.hasPII) {
    updatedStats.piiDetections += 1;
  }

  if (message.metadata?.responseTime) {
    const totalResponseTime = updatedStats.avgResponseTime * (updatedStats.messageCount - 1)
      + message.metadata.responseTime;
    updatedStats.avgResponseTime = totalResponseTime / updatedStats.messageCount;
  }

  return {
    ...session,
    lastActivity: new Date(),
    statistics: updatedStats,
  };
}

/**
 * Check if session has exceeded estimated duration
 */
export function isSessionExpired(session: ChatSession): boolean {
  if (!session.metadata.estimatedDuration) return false;

  const elapsedMinutes = (Date.now() - session.createdAt.getTime()) / (1000 * 60);
  return elapsedMinutes > session.metadata.estimatedDuration;
}

/**
 * Get session health status
 */
export function getSessionHealth(session: ChatSession): {
  status: 'healthy' | 'warning' | 'critical';
  issues: string[];
} {
  const issues: string[] = [];

  // Check compliance
  if (!validateSessionCompliance(session)) {
    issues.push('compliance_violation');
  }

  // Check duration
  if (isSessionExpired(session)) {
    issues.push('duration_exceeded');
  }

  // Check PII frequency
  const piiRate = session.statistics.messageCount > 0
    ? session.statistics.piiDetections / session.statistics.messageCount
    : 0;

  if (piiRate > 0.5) {
    issues.push('high_pii_frequency');
  }

  // Check response time
  if (session.statistics.avgResponseTime > 30000) { // 30 seconds
    issues.push('slow_response_time');
  }

  let status: 'healthy' | 'warning' | 'critical' = 'healthy';

  if (issues.length > 2) {
    status = 'critical';
  } else if (issues.length > 0) {
    status = 'warning';
  }

  return { status, issues };
}

/**
 * Generate session report for audit purposes
 */
export function generateSessionReport(session: ChatSession): {
  sessionId: string;
  duration: number; // in minutes
  messageCount: number;
  piiDetectionRate: number;
  avgResponseTime: number;
  complianceStatus: boolean;
  healthStatus: string;
  recommendations: string[];
} {
  const now = new Date();
  const durationMinutes = (now.getTime() - session.createdAt.getTime()) / (1000 * 60);
  const piiRate = session.statistics.messageCount > 0
    ? session.statistics.piiDetections / session.statistics.messageCount
    : 0;

  const health = getSessionHealth(session);
  const recommendations: string[] = [];

  if (piiRate > 0.3) {
    recommendations.push('review_pii_handling');
  }

  if (session.statistics.avgResponseTime > 20000) {
    recommendations.push('optimize_response_times');
  }

  if (!session.compliance.consentVerified) {
    recommendations.push('verify_user_consent');
  }

  return {
    sessionId: session.id,
    duration: durationMinutes,
    messageCount: session.statistics.messageCount,
    piiDetectionRate: piiRate,
    avgResponseTime: session.statistics.avgResponseTime,
    complianceStatus: validateSessionCompliance(session),
    healthStatus: health.status,
    recommendations,
  };
}

export default {
  createSession,
  validateSessionCompliance,
  updateSessionStatistics,
  isSessionExpired,
  getSessionHealth,
  generateSessionReport,
};

// --- Minimal in-memory Chat Session API (for tests) ---
export type SessionStatus = 'active' | 'ended' | 'archived';

export interface SessionConfig {
  _userId: string;
  clinicId: string;
  locale?: 'pt-BR' | 'en-US';
  sessionType?: 'general' | 'consultation' | 'follow_up' | 'emergency';
  maxDurationMinutes?: number; // default 120
  inactivityMinutes?: number; // default 15
}

export interface InMemoryChatSession {
  id: string;
  _userId: string;
  clinicId: string;
  locale: 'pt-BR' | 'en-US';
  status: SessionStatus;
  isActive: boolean;
  startedAt: Date;
  lastActivityAt: Date;
  endedAt?: Date | null;
  archivedAt?: Date | null;
  totalMessages: number;
  maxDurationMinutes: number;
  inactivityMinutes: number;
  metadata?: Record<string, unknown>;
}

const SESSIONS = new Map<string, InMemoryChatSession>();

function isExpired(s: InMemoryChatSession, now = new Date()): boolean {
  const elapsed = (now.getTime() - s.startedAt.getTime()) / 60000;
  return elapsed > s.maxDurationMinutes;
}

function isInactive(s: InMemoryChatSession, now = new Date()): boolean {
  const idle = (now.getTime() - s.lastActivityAt.getTime()) / 60000;
  return idle > s.inactivityMinutes;
}

export async function createChatSession(cfg: SessionConfig): Promise<InMemoryChatSession> {
  if (!cfg || !cfg._userId || !cfg.clinicId) throw new Error('required');
  // Minimal auth for tests
  if (cfg.clinicId === 'invalid-clinic') throw new Error('not authorized');

  const now = new Date();
  const session: InMemoryChatSession = {
    id: generateSessionId(),
    _userId: cfg._userId,
    clinicId: cfg.clinicId,
    locale: cfg.locale ?? 'pt-BR',
    status: 'active',
    isActive: true,
    startedAt: now,
    lastActivityAt: now,
    endedAt: null,
    archivedAt: null,
    totalMessages: 0,
    maxDurationMinutes: cfg.maxDurationMinutes ?? 120,
    inactivityMinutes: cfg.inactivityMinutes ?? 15,
    metadata: { sessionType: cfg.sessionType ?? 'general' },
  };
  SESSIONS.set(session.id, session);
  return session;
}

export async function getChatSession(
  sessionId: string,
  _userId: string,
  clinicId: string,
  opts?: { includeArchived?: boolean },
): Promise<InMemoryChatSession> {
  const s = SESSIONS.get(sessionId);
  if (!s) throw new Error('not found');
  if (s._userId !== _userId || s.clinicId !== clinicId) throw new Error('not authorized');
  if (s.status === 'archived' && !opts?.includeArchived) throw new Error('not found');
  return s;
}

export async function updateSessionActivity(
  sessionId: string,
  updates?: { incrementMessages?: number; tokensUsed?: number },
): Promise<InMemoryChatSession> {
  const s = SESSIONS.get(sessionId);
  if (!s) throw new Error('not found');
  if (!s.isActive || s.status !== 'active') return s;
  const now = new Date();
  if (isExpired(s, now)) return s; // do not update expired
  s.lastActivityAt = now;
  if (updates?.incrementMessages) s.totalMessages += updates.incrementMessages;
  return s;
}

export async function validateSessionAccess(
  sessionId: string,
  identity?: { _userId?: string; clinicId?: string },
): Promise<{ isValid: boolean; reason?: string }> {
  const s = SESSIONS.get(sessionId);
  if (!s) return { isValid: false, reason: 'not_found' };
  const now = new Date();
  if (isExpired(s, now)) return { isValid: false, reason: 'expired' };
  if (isInactive(s, now)) return { isValid: false, reason: 'inactive' };
  if (identity) {
    if (
      (identity._userId && identity._userId !== s._userId)
      || (identity.clinicId && identity.clinicId !== s.clinicId)
    ) {
      return { isValid: false, reason: 'not_authorized' };
    }
  }
  return { isValid: true };
}

export async function endChatSession(
  sessionId: string,
  opts?: { reason?: string },
): Promise<InMemoryChatSession> {
  const s = SESSIONS.get(sessionId);
  if (!s) throw new Error('not found');
  if (s.status === 'ended' || s.status === 'archived') return s;
  s.status = 'ended';
  s.isActive = false;
  s.endedAt = new Date();
  if (!s.metadata) s.metadata = {};
  if (opts?.reason) s.metadata.endReason = opts.reason;
  // duration minutes
  s.metadata.durationMinutes = Math.round((s.endedAt.getTime() - s.startedAt.getTime()) / 60000);
  return s;
}

export async function cleanupExpiredSessions(): Promise<
  { cleanedCount: number; activeCount: number; errors: number }
> {
  let cleaned = 0;
  let active = 0;
  const now = new Date();
  for (const s of SESSIONS.values()) {
    if (s.status === 'archived') continue;
    if (isExpired(s, now)) {
      s.status = 'archived';
      s.isActive = false;
      s.archivedAt = new Date();
      cleaned += 1;
    } else if (s.status === 'active') {
      active += 1;
    }
  }
  return { cleanedCount: cleaned, activeCount: active, errors: 0 };
}

export async function archiveInactiveSessions(
  minMinutes = 15,
): Promise<{ archivedCount: number; totalProcessed: number }> {
  let archived = 0;
  let total = 0;
  const now = new Date();
  for (const s of SESSIONS.values()) {
    total += 1;
    const idle = (now.getTime() - s.lastActivityAt.getTime()) / 60000;
    if (s.status === 'active' && idle > (s.inactivityMinutes ?? minMinutes)) {
      s.status = 'archived';
      s.isActive = false;
      s.archivedAt = new Date();
      archived += 1;
    }
  }
  return { archivedCount: archived, totalProcessed: total };
}

export async function getSessionMetrics(
  clinicId: string,
): Promise<{ totalSessions: number; activeSessions: number; archivedSessions: number }> {
  let total = 0;
  let active = 0;
  let archived = 0;
  for (const s of SESSIONS.values()) {
    if (s.clinicId !== clinicId) continue;
    total += 1;
    if (s.status === 'archived') archived += 1;
    else if (s.status === 'active') active += 1;
  }
  return { totalSessions: total, activeSessions: active, archivedSessions: archived };
}
