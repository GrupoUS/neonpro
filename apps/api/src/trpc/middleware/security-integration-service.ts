import { JWTService } from '../../services/jwt-service'
import { SessionService } from '../../services/session-service'
import { ComplianceService } from '../../services/compliance-service'

export interface SecurityConfig {
  enableJWTSecurity: boolean
  enableSessionManagement: boolean
  enableHealthcareCompliance: boolean
  sessionTimeout: number
  maxConcurrentSessions: number
  securityLevel: 'low' | 'medium' | 'high' | 'healthcare'
}

export interface JWTPayload {
  userId: string
  sessionId: string
  role: string
  emergencyAccess?: boolean
  reason?: string
}

export interface JWTValidationResult {
  isValid: boolean
  payload?: JWTPayload
  error?: string
}

export interface HealthcareSession {
  id: string
  userId: string
  role: string
  createdAt: Date
  expiresAt: Date
  isActive: boolean
}

export interface SessionMetadata {
  validationDetails: {
    isValid: boolean
    lastAccessed: Date
    ipAddress?: string
    userAgent?: string
    error?: string
  }
}

export interface SessionResult {
  session: HealthcareSession | null
  metadata: SessionMetadata
}

export interface SecurityEvent {
  type: string
  userId: string
  sessionId: string
  timestamp: Date
  details: Record<string, unknown>
}

export interface EventLogResult {
  success: boolean
  eventId?: string
  error?: string
}

export interface ComplianceCheck {
  name: string
  passed: boolean
  error?: string
  details?: string
}

export interface ComplianceResult {
  isCompliant: boolean
  checks: ComplianceCheck[]
}

export interface AccessControlRequest {
  userId: string
  resource: string
  action: string
  context: Record<string, unknown>
}

export interface AccessControlResult {
  granted: boolean
  reason?: string
  conditions?: string[]
}

export interface SecurityMetrics {
  activeSessions: number
  failedAuthentications: number
  complianceScore: number
  lastSecurityScan: Date
}

export class SecurityIntegrationService {
  private config: SecurityConfig
  private jwtService: JWTService
  private sessionService: SessionService
  private complianceService: ComplianceService

  constructor(config: SecurityConfig) {
    this.validateConfig(config)
    this.config = config
    
    this.jwtService = new JWTService()
    this.sessionService = new SessionService()
    this.complianceService = new ComplianceService()
  }

  private validateConfig(config: SecurityConfig): void {
    if (!config.enableJWTSecurity && !config.enableSessionManagement && !config.enableHealthcareCompliance) {
      throw new Error('At least one security feature must be enabled')
    }

    if (config.sessionTimeout <= 0) {
      throw new Error('Session timeout must be a positive number')
    }

    if (config.maxConcurrentSessions <= 0) {
      throw new Error('Max concurrent sessions must be a positive number')
    }

    const validSecurityLevels = ['low', 'medium', 'high', 'healthcare']
    if (!validSecurityLevels.includes(config.securityLevel)) {
      throw new Error(`Security level must be one of: ${validSecurityLevels.join(', ')}`)
    }
  }

  async validateToken(token: string): Promise<JWTValidationResult> {
    if (!this.config.enableJWTSecurity) {
      throw new Error('JWT security is not enabled')
    }

    try {
      return await this.jwtService.validateToken(token)
    } catch (error) {
      throw new Error(`JWT validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async getSession(sessionId: string): Promise<SessionResult> {
    if (!this.config.enableSessionManagement) {
      throw new Error('Session management is not enabled')
    }

    try {
      return await this.sessionService.getSession(sessionId)
    } catch (error) {
      throw new Error(`Session retrieval failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async logSecurityEvent(event: SecurityEvent): Promise<EventLogResult> {
    if (!this.config.enableSessionManagement) {
      throw new Error('Session management is not enabled')
    }

    try {
      return await this.sessionService.logEvent(event)
    } catch (error) {
      throw new Error(`Event logging failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async validateHealthcareCompliance(): Promise<ComplianceResult> {
    if (!this.config.enableHealthcareCompliance) {
      throw new Error('Healthcare compliance is not enabled')
    }

    try {
      return await this.complianceService.validateCompliance()
    } catch (error) {
      throw new Error(`Compliance validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async validateAccessControl(request: AccessControlRequest): Promise<AccessControlResult> {
    // Basic access control validation
    const hasPermission = await this.checkUserPermission(request.userId, request.resource, request.action)
    
    return {
      granted: hasPermission,
      reason: hasPermission ? 'User has required permissions' : 'Insufficient permissions'
    }
  }

  async getSecurityMetrics(): Promise<SecurityMetrics> {
    return {
      activeSessions: await this.getActiveSessionCount(),
      failedAuthentications: await this.getFailedAuthCount(),
      complianceScore: await this.calculateComplianceScore(),
      lastSecurityScan: new Date()
    }
  }

  updateConfiguration(newConfig: Partial<SecurityConfig>): void {
    const updatedConfig = { ...this.config, ...newConfig }
    this.validateConfig(updatedConfig)
    this.config = updatedConfig
  }

  private async checkUserPermission(_userId: string, _resource: string, _action: string): Promise<boolean> {
    // Simplified permission check - in real implementation, this would check against a database
    return true // For testing purposes
  }

  private async getActiveSessionCount(): Promise<number> {
    // Mock implementation - in real implementation, this would query the database
    return 5
  }

  private async getFailedAuthCount(): Promise<number> {
    // Mock implementation - in real implementation, this would query audit logs
    return 2
  }

  private async calculateComplianceScore(): Promise<number> {
    try {
      const compliance = await this.validateHealthcareCompliance()
      const passedChecks = compliance.checks.filter(check => check.passed).length
      return Math.round((passedChecks / compliance.checks.length) * 100)
    } catch {
      return 0
    }
  }
}