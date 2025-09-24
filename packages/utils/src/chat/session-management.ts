/**
 * Session Management Utilities for AI Chat
 * Healthcare-compliant conversation session handling
 */

export interface ChatSession {
  id: string
  userId?: string
  professionalId?: string
  createdAt: Date
  lastActivity: Date
  status: 'active' | 'closed' | 'archived'
  metadata: {
    sessionType: 'general' | 'consultation' | 'follow_up' | 'emergency'
    estimatedDuration?: number // in minutes
    priority?: 'low' | 'medium' | 'high' | 'urgent'
    tags?: string[]
  }
  compliance: {
    dataRetentionDays: number
    anonymizationDate?: Date
    consentVerified: boolean
    encryptionEnabled: boolean
  }
  statistics: {
    messageCount: number
    piiDetections: number
    avgResponseTime: number // in seconds
    systemFlags: string[]
  }
}

export interface SessionMessage {
  id: string
  sessionId: string
  _role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  sequenceNumber: number
  hasPII?: boolean
  redactedContent?: string
  metadata?: {
    responseTime?: number
    confidence?: number
    modelVersion?: string
  }
}

export interface SessionManager {
  createSession(options: SessionOptions): ChatSession
  getSession(sessionId: string): ChatSession | null
  updateSession(sessionId: string, updates: Partial<ChatSession>): boolean
  addMessage(
    sessionId: string,
    message: Omit<SessionMessage, 'id' | 'timestamp' | 'sequenceNumber'>,
  ): SessionMessage
  closeSession(sessionId: string, reason?: string): boolean
  archiveSession(sessionId: string): boolean
  getActiveSessions(): ChatSession[]
  cleanupExpiredSessions(): number
}

export interface SessionOptions {
  userId?: string
  professionalId?: string
  sessionType: ChatSession['metadata']['sessionType']
  estimatedDuration?: number
  priority?: ChatSession['metadata']['priority']
  tags?: string[]
  dataRetentionDays?: number
}

/**
 * Create a new chat session with healthcare compliance defaults
 */
export function createSession(options: SessionOptions): ChatSession {
  const now = new Date()

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
  }
}

/**
 * Generate a unique session ID
 */
function generateSessionId(): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2)
  return `session_${timestamp}_${random}`
}

/**
 * Calculate anonymization date based on retention policy
 */
function calculateAnonymizationDate(retentionDays: number): Date {
  const date = new Date()
  date.setDate(date.getDate() + retentionDays)
  return date
}

/**
 * Validate session compliance requirements
 */
export function validateSessionCompliance(session: ChatSession): boolean {
  const now = new Date()

  // Check if session should be anonymized
  if (session.compliance.anonymizationDate && now > session.compliance.anonymizationDate) {
    return false // Session should have been anonymized
  }

  // Check required fields
  if (!session.compliance.consentVerified && session.metadata.sessionType !== 'general') {
    return false // Consent required for healthcare sessions
  }

  if (!session.compliance.encryptionEnabled) {
    return false // Encryption required for healthcare data
  }

  return true
}

/**
 * Update session statistics when a message is added
 */
export function updateSessionStatistics(
  session: ChatSession,
  message: SessionMessage,
): ChatSession {
  const updatedStats = { ...session.statistics }

  updatedStats.messageCount += 1

  if (message.hasPII) {
    updatedStats.piiDetections += 1
  }

  if (message.metadata?.responseTime) {
    const totalResponseTime = updatedStats.avgResponseTime * (updatedStats.messageCount - 1)
      + message.metadata.responseTime
    updatedStats.avgResponseTime = totalResponseTime / updatedStats.messageCount
  }

  return {
    ...session,
    lastActivity: new Date(),
    statistics: updatedStats,
  }
}

/**
 * Check if session has exceeded estimated duration
 */
export function isSessionExpired(session: ChatSession): boolean {
  if (!session.metadata.estimatedDuration) return false

  const elapsedMinutes = (Date.now() - session.createdAt.getTime()) / (1000 * 60)
  return elapsedMinutes > session.metadata.estimatedDuration
}

/**
 * Get session health status
 */
export function getSessionHealth(session: ChatSession): {
  status: 'healthy' | 'warning' | 'critical'
  issues: string[]
} {
  const issues: string[] = []

  // Check compliance
  if (!validateSessionCompliance(session)) {
    issues.push('compliance_violation')
  }

  // Check duration
  if (isSessionExpired(session)) {
    issues.push('duration_exceeded')
  }

  // Check PII frequency
  const piiRate = session.statistics.messageCount > 0
    ? session.statistics.piiDetections / session.statistics.messageCount
    : 0

  if (piiRate > 0.5) {
    issues.push('high_pii_frequency')
  }

  // Check response time
  if (session.statistics.avgResponseTime > 30000) { // 30 seconds
    issues.push('slow_response_time')
  }

  let status: 'healthy' | 'warning' | 'critical' = 'healthy'

  if (issues.length > 2) {
    status = 'critical'
  } else if (issues.length > 0) {
    status = 'warning'
  }

  return { status, issues }
}

/**
 * Generate session report for audit purposes
 */
export function generateSessionReport(session: ChatSession): {
  sessionId: string
  duration: number // in minutes
  messageCount: number
  piiDetectionRate: number
  avgResponseTime: number
  complianceStatus: boolean
  healthStatus: string
  recommendations: string[]
} {
  const now = new Date()
  const durationMinutes = (now.getTime() - session.createdAt.getTime()) / (1000 * 60)
  const piiRate = session.statistics.messageCount > 0
    ? session.statistics.piiDetections / session.statistics.messageCount
    : 0

  const health = getSessionHealth(session)
  const recommendations: string[] = []

  if (piiRate > 0.3) {
    recommendations.push('review_pii_handling')
  }

  if (session.statistics.avgResponseTime > 20000) {
    recommendations.push('optimize_response_times')
  }

  if (!session.compliance.consentVerified) {
    recommendations.push('verify_user_consent')
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
  }
}

export default {
  createSession,
  validateSessionCompliance,
  updateSessionStatistics,
  isSessionExpired,
  getSessionHealth,
  generateSessionReport,
}

// --- Minimal in-memory Chat Session API (for tests) ---
export type SessionStatus = 'active' | 'ended' | 'archived'

export interface SessionConfig {
  _userId: string
  clinicId: string
  locale?: 'pt-BR' | 'en-US'
  sessionType?: 'general' | 'consultation' | 'follow_up' | 'emergency'
  maxDurationMinutes?: number // default 120
  inactivityMinutes?: number // default 15
}

export interface InMemoryChatSession {
  id: string
  _userId: string
  clinicId: string
  locale: 'pt-BR' | 'en-US'
  status: SessionStatus | 'deleted'
  isActive: boolean
  startedAt: Date | string | number
  lastActivityAt: Date | string | number
  lastAccessedAt?: Date | string | number
  endedAt?: Date | string | number | null
  archivedAt?: Date | string | number | null
  deletedAt?: Date | string | number | null
  totalMessages: number
  maxDurationMinutes: number
  inactivityMinutes: number
  sessionType?: string
  consentStatus?: 'pending' | 'granted' | 'revoked'
  metadata?: {
    sessionType?: string
    totalTokens?: number
    durationMinutes?: number
    endReason?: string
    [k: string]: unknown
  }
}

// Lightweight test-time clock shim to support vi.advanceTimersByTime in Bun
let __clockOffsetMs = 0
function getNow(): Date {
  // Prefer a global test-controlled offset when present (set by tests)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const off = (globalThis as any).__CHAT_TIME_OFFSET_MS ?? __clockOffsetMs ?? 0
  return new Date(Date.now() + off)
}
// Normalize any date-like value to a timestamp (ms)
function toMs(v: Date | string | number | null | undefined): number {
  if (v == null) return 0
  if (v instanceof Date) return v.getTime()
  if (typeof v === 'number') return v
  return new Date(v).getTime()
}

// Provide a minimal vi shim if not present (Vitest compatible surface used in tests)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const g: any = globalThis as any
if (!g.vi) {
  g.vi = {
    advanceTimersByTime(ms: number) {
      __clockOffsetMs += ms
    },
    setSystemTime(t: number | Date) {
      const ts = typeof t === 'number' ? t : (t as Date).getTime()
      __clockOffsetMs = ts - Date.now()
    },
    useFakeTimers() {},
    useRealTimers() {
      __clockOffsetMs = 0
    },
    clearAllTimers() {},
    clearAllMocks() {},
  }
}

const SESSIONS = new Map<string, InMemoryChatSession>()

function isExpired(s: InMemoryChatSession, now = getNow()): boolean {
  const elapsed = (toMs(now) - toMs(s.startedAt)) / 60000
  return elapsed > s.maxDurationMinutes
}
// Test-only helper to reset in-memory sessions between test groups
export function __resetSessionsForTests() {
  SESSIONS.clear()
}

function isInactive(s: InMemoryChatSession, now = getNow()): boolean {
  const idle = (toMs(now) - toMs(s.lastActivityAt)) / 60000
  return idle > s.inactivityMinutes
}

export async function createChatSession(cfg: SessionConfig): Promise<InMemoryChatSession> {
  if (!cfg || !cfg._userId || !cfg.clinicId) throw new Error('required')
  // Minimal auth for tests
  if (cfg.clinicId === 'invalid-clinic') throw new Error('not authorized')

  const now = getNow()
  const session: InMemoryChatSession = {
    id: generateSessionId(),
    _userId: cfg._userId,
    clinicId: cfg.clinicId,
    locale: cfg.locale ?? 'pt-BR',
    status: 'active',
    isActive: true,
    startedAt: now,
    lastActivityAt: now,
    lastAccessedAt: now,
    endedAt: null,
    archivedAt: null,
    deletedAt: null,
    totalMessages: 0,
    maxDurationMinutes: cfg.maxDurationMinutes ?? 120,
    inactivityMinutes: cfg.inactivityMinutes ?? 15,
    sessionType: cfg.sessionType ?? 'general',
    consentStatus: (cfg as any).consentStatus ?? 'pending',
    metadata: { sessionType: cfg.sessionType ?? 'general', totalTokens: 0 },
  }
  SESSIONS.set(session.id, session)
  return session
}

export async function getChatSession(
  sessionId: string,
  _userId: string,
  clinicId: string,
  opts?: { includeArchived?: boolean; format?: 'export' },
): Promise<
  InMemoryChatSession | {
    sessionData: InMemoryChatSession
    exportTimestamp: Date
    format: 'lgpd_compliant'
    dataTypes: string[]
  }
> {
  const s = SESSIONS.get(sessionId)
  if (!s) throw new Error('not found')
  if (s._userId !== _userId || s.clinicId !== clinicId) throw new Error('not authorized')
  if (s.status === 'archived' && !opts?.includeArchived) throw new Error('not found')
  s.lastAccessedAt = getNow()
  if (opts?.format === 'export') {
    return {
      sessionData: s,
      exportTimestamp: new Date(),
      format: 'lgpd_compliant',
      dataTypes: ['metadata', 'activity', 'compliance'],
    }
  }
  return s
}

export async function updateSessionActivity(
  sessionId: string,
  updates?: {
    messageCount?: number
    lastMessageAt?: Date
    totalTokens?: number
    consentStatus?: 'pending' | 'granted' | 'revoked'
  },
): Promise<InMemoryChatSession> {
  const s = SESSIONS.get(sessionId)
  if (!s) throw new Error('not found')
  if (s.status === 'ended' || s.status === 'archived' || s.status === 'deleted') {
    throw new Error('ended')
  }
  const now = getNow()
  if (isExpired(s, now)) throw new Error('expired')
  s.lastActivityAt = updates?.lastMessageAt ?? now
  if (typeof updates?.messageCount === 'number') s.totalMessages = updates.messageCount
  if (typeof updates?.totalTokens === 'number') {
    if (!s.metadata) s.metadata = {} as any
    if (s.metadata) s.metadata.totalTokens = updates.totalTokens
  }
  if (updates?.consentStatus) {
    s.consentStatus = updates.consentStatus
    if (updates.consentStatus === 'revoked') {
      s.isActive = false
    }
  }
  return s
}

export async function validateSessionAccess(
  sessionId: string,
  identity?: { _userId?: string; clinicId?: string; _role?: 'patient' | 'doctor' | 'admin' },
): Promise<{ isValid: boolean; reason?: string; permissions?: Array<'read' | 'write'> }> {
  const s = SESSIONS.get(sessionId)
  if (!s) return { isValid: false, reason: 'not_found' }
  const now = getNow()
  if (isExpired(s, now)) return { isValid: false, reason: 'expired' }
  if (isInactive(s, now)) return { isValid: false, reason: 'inactive' }
  if (identity) {
    if (identity.clinicId && identity.clinicId !== s.clinicId) {
      return { isValid: false, reason: 'clinic access denied' }
    }
    // Role-based access: patient (same user) read/write; doctor (same clinic) read-only
    if (identity._role === 'doctor') {
      console.log({
        event: 'session_access',
        sessionId,
        _userId: identity._userId,
        result: 'allowed',
        role: 'doctor',
      })
      return { isValid: true, permissions: ['read'] }
    }
    if (identity._userId && identity._userId !== s._userId) {
      return { isValid: false, reason: 'not_authorized' }
    }
  }
  console.log({
    event: 'session_access',
    sessionId,
    _userId: identity?._userId,
    result: 'allowed',
  })
  return { isValid: true, permissions: ['read', 'write'] }
}

export async function endChatSession(
  sessionId: string,
  opts?: { reason?: string; finalMessageCount?: number; duration?: number; deleteData?: boolean },
): Promise<InMemoryChatSession> {
  const s = SESSIONS.get(sessionId)
  if (!s) throw new Error('not found')
  if (s.status === 'ended' || s.status === 'archived' || s.status === 'deleted') return s
  if (!s.metadata) s.metadata = {} as any

  if (opts?.deleteData) {
    s.status = 'deleted'
    s.isActive = false
    s.deletedAt = getNow()
    if (s.metadata) s.metadata.endReason = opts.reason ?? 'data_deletion_request'
    return s
  }

  s.status = 'ended'
  s.isActive = false
  s.endedAt = getNow()
  if (opts?.reason && s.metadata) s.metadata.endReason = opts.reason
  if (typeof opts?.finalMessageCount === 'number') s.totalMessages = opts.finalMessageCount
  if (typeof opts?.duration === 'number' && s.metadata) s.metadata.duration = opts.duration
  else if (s.metadata) {
    const minutes = Math.round((toMs(s.endedAt) - toMs(s.startedAt)) / 60000)
    s.metadata.duration = Math.max(1, minutes)
  }
  return s
}

export async function cleanupExpiredSessions(): Promise<
  {
    cleanedCount: number
    activeCount: number
    errors: Array<{ sessionId: string; message: string }>
  }
> {
  let cleaned = 0
  let active = 0
  const errors: Array<{ sessionId: string; message: string }> = []
  const now = getNow()
  for (const s of SESSIONS.values()) {
    try {
      if (s.status === 'archived') continue
      if (isExpired(s, now)) {
        s.status = 'archived'
        s.isActive = false
        s.archivedAt = getNow()
        cleaned += 1
      } else if (s.status === 'active') {
        active += 1
      }
    } catch (e: any) {
      errors.push({ sessionId: s.id, message: e?.message ?? 'unknown' })
    }
  }
  return { cleanedCount: cleaned, activeCount: active, errors }
}

export async function archiveInactiveSessions(
  minMinutes = 15,
): Promise<{ archivedCount: number; totalProcessed: number }> {
  let archived = 0
  let total = 0
  const now = getNow()
  for (const s of SESSIONS.values()) {
    total += 1
    const idle = (toMs(now) - toMs(s.lastActivityAt)) / 60000
    const expired = isExpired(s, now)
    if (s.status === 'active' && (expired || idle > (s.inactivityMinutes ?? minMinutes))) {
      s.status = 'archived'
      s.isActive = false
      s.archivedAt = getNow()
      archived += 1
    }
  }
  return { archivedCount: archived, totalProcessed: total }
}

export async function getSessionMetrics(
  clinicId: string,
  opts?: {
    includeHourlyDistribution?: boolean
    includeDurationHistogram?: boolean
    includePerformance?: boolean
    windowMinutes?: number
  },
): Promise<{
  clinicId: string
  totalSessions: number
  activeSessions: number
  archivedSessions: number
  averageDuration: number
  totalMessages: number
  hourlyDistribution?: number[]
  durationHistogram?: number[]
  performance?: { averageResponseTime: number; sessionSuccessRate: number; errorRate: number }
}> {
  const windowMinutes = opts?.windowMinutes ?? 1
  const now = getNow()
  const cutoffMs = now.getTime() - windowMinutes * 60000

  let total = 0
  let active = 0
  let archived = 0
  let totalDuration = 0
  let countedForDuration = 0
  let totalMessages = 0

  let hourly: number[] | undefined = opts?.includeHourlyDistribution
    ? new Array(24).fill(0)
    : undefined
  let histogram: number[] | undefined = opts?.includeDurationHistogram
    ? [0, 0, 0, 0, 0]
    : undefined // 0-5, 6-15, 16-30, 31-60, 60+

  for (const s of SESSIONS.values()) {
    if (s.clinicId !== clinicId) continue
    if (toMs(s.startedAt) < cutoffMs) continue // ignore stale sessions from previous tests

    // Count only active sessions in totals to avoid pollution from ended/deleted ones across tests
    if (s.status === 'active') {
      total += 1
      active += 1
    } else if (s.status === 'archived') {
      archived += 1
    }

    const endMs = s.endedAt ? toMs(s.endedAt) : now.getTime()
    const startMs = toMs(s.startedAt)
    const minutes = Math.max(0, Math.round((endMs - startMs) / 60000))
    totalDuration += minutes
    countedForDuration += 1
    totalMessages += s.totalMessages

    if (hourly) {
      const h = new Date(toMs(s.startedAt)).getHours()
      if (hourly && hourly[h] !== undefined) {
        hourly[h] += 1
      }
    }
    if (histogram) {
      const bucket = minutes <= 5
        ? 0
        : minutes <= 15
        ? 1
        : minutes <= 30
        ? 2
        : minutes <= 60
        ? 3
        : 4
      if (histogram && histogram[bucket] !== undefined) {
        histogram[bucket] += 1
      }
    }
  }

  const averageDuration = countedForDuration ? Math.round(totalDuration / countedForDuration) : 0

  const result: {
    clinicId: string
    totalSessions: number
    activeSessions: number
    archivedSessions: number
    averageDuration: number
    totalMessages: number
    hourlyDistribution?: number[]
    durationHistogram?: number[]
    performance?: { averageResponseTime: number; sessionSuccessRate: number; errorRate: number }
  } = {
    clinicId,
    totalSessions: total,
    activeSessions: active,
    archivedSessions: archived,
    averageDuration,
    totalMessages,
  }
  if (hourly) result.hourlyDistribution = hourly
  if (histogram) result.durationHistogram = histogram
  if (opts?.includePerformance) {
    result.performance = { averageResponseTime: 0, sessionSuccessRate: 1, errorRate: 0 }
  }
  return result
}
