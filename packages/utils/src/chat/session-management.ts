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
  addMessage(sessionId: string, message: Omit<SessionMessage, 'id' | 'timestamp' | 'sequenceNumber'>): SessionMessage;
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
export function updateSessionStatistics(session: ChatSession, message: SessionMessage): ChatSession {
  const updatedStats = { ...session.statistics };
  
  updatedStats.messageCount += 1;
  
  if (message.hasPII) {
    updatedStats.piiDetections += 1;
  }
  
  if (message.metadata?.responseTime) {
    const totalResponseTime = updatedStats.avgResponseTime * (updatedStats.messageCount - 1) + message.metadata.responseTime;
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
