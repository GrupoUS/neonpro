# Aesthetic Clinic Security Implementation

## 🔒 Security Architecture Overview

The aesthetic clinic system implements a comprehensive security framework designed specifically for Brazilian healthcare compliance, with multiple layers of protection, audit trails, and regulatory compliance features.

## 🏗️ Security Architecture

### Security Layers

```
Application Layer: Authentication, Authorization, Input Validation
Service Layer: Business Logic Security, Data Validation
Database Layer: Row Level Security, Encryption, Access Control
Infrastructure Layer: Network Security, Monitoring, Backup
Compliance Layer: LGPD, ANVISA, CFM, Audit Trails
```

## 🔐 Authentication & Authorization

### Multi-Factor Authentication (MFA)

```typescript
// apps/api/src/security/enhanced-session-manager.ts
interface SecurityConfig {
  mfaRequired: boolean
  sessionTimeout: number // minutes
  maxFailedAttempts: number
  lockoutDuration: number // minutes
  passwordPolicy: {
    minLength: number
    requireUppercase: boolean
    requireNumbers: boolean
    requireSpecialChars: boolean
    expirationDays: number
  }
}

const SECURITY_CONFIG: SecurityConfig = {
  mfaRequired: true,
  sessionTimeout: 30,
  maxFailedAttempts: 5,
  lockoutDuration: 15,
  passwordPolicy: {
    minLength: 12,
    requireUppercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    expirationDays: 90,
  },
}

export class EnhancedSessionManager {
  async authenticateWithMFA(credentials: Credentials): Promise<AuthResult> {
    // Primary authentication
    const primaryAuth = await this.authenticatePrimary(credentials)

    if (!primaryAuth.success) {
      await this.trackFailedAttempt(credentials.identifier)
      return primaryAuth
    }

    // Check if MFA is required
    const user = await this.getUserWithSecurityLevel(credentials.identifier)
    if (user.securityLevel >= SECURITY_LEVELS.HEALTHCARE_PROFESSIONAL) {
      const mfaRequired = await this.isMFARequired(user)
      if (mfaRequired) {
        return {
          success: false,
          requiresMFA: true,
          mfaMethods: await this.getAvailableMFAMethods(user.id),
          sessionId: primaryAuth.sessionId,
        }
      }
    }

    return primaryAuth
  }

  async verifyMFA(
    sessionId: string,
    mfaToken: string,
    method: 'sms' | 'email' | 'app',
  ): Promise<AuthResult> {
    const session = await this.getSession(sessionId)
    if (!session || session.mfaVerified) {
      throw new SecurityError('Invalid session or MFA already verified')
    }

    const isValid = await this.validateMFAToken(session.userId, mfaToken, method)
    if (!isValid) {
      await this.trackFailedMFAAttempt(session.userId)
      return { success: false, error: 'Invalid MFA token' }
    }

    await this.markSessionMFAVerified(sessionId)
    return { success: true, sessionId }
  }
}
```

### Role-Based Access Control (RBAC)

```typescript
// apps/api/src/services/permissions/agent-permissions.ts
interface Permission {
  resource: string
  action: 'create' | 'read' | 'update' | 'delete' | 'execute'
  conditions?: PermissionCondition[]
}

interface Role {
  name: string
  description: string
  permissions: Permission[]
  inheritance?: string[]
}

const ROLES: Role[] = [
  {
    name: 'admin',
    description: 'Full system access',
    permissions: [
      { resource: '*', action: '*' },
    ],
  },
  {
    name: 'healthcare_professional',
    description: 'Medical professional with treatment access',
    inheritance: ['viewer'],
    permissions: [
      { resource: 'clients', action: 'read' },
      { resource: 'clients', action: 'create', conditions: ['owns_client_data'] },
      { resource: 'treatments', action: 'read' },
      { resource: 'treatments', action: 'execute', conditions: ['certified_for_treatment'] },
      { resource: 'sessions', action: 'create', conditions: ['assigned_professional'] },
      {
        resource: 'sessions',
        action: 'read',
        conditions: ['assigned_professional', 'owns_client_data'],
      },
      { resource: 'compliance', action: 'read' },
    ],
  },
  {
    name: 'receptionist',
    description: 'Front desk staff for scheduling and basic client management',
    permissions: [
      { resource: 'clients', action: 'read' },
      { resource: 'clients', action: 'create' },
      { resource: 'appointments', action: 'create' },
      { resource: 'appointments', action: 'read' },
      { resource: 'appointments', action: 'update', conditions: ['basic_info_only'] },
    ],
  },
  {
    name: 'compliance_officer',
    description: 'LGPD and regulatory compliance oversight',
    permissions: [
      { resource: '*', action: 'read' },
      { resource: 'compliance', action: '*' },
      { resource: 'audit', action: 'read' },
      { resource: 'clients', action: 'update', conditions: ['compliance_related_only'] },
    ],
  },
]

export class PermissionManager {
  async checkPermission(
    userId: string,
    resource: string,
    action: string,
    context?: any,
  ): Promise<boolean> {
    const userRoles = await this.getUserRoles(userId)
    const userPermissions = await this.getRolePermissions(userRoles)

    for (const permission of userPermissions) {
      if (
        this.matchesResource(permission.resource, resource) &&
        this.matchesAction(permission.action, action)
      ) {
        // Check conditions
        if (permission.conditions) {
          const conditionsMet = await this.evaluateConditions(
            permission.conditions,
            userId,
            context,
          )
          if (!conditionsMet) continue
        }

        return true
      }
    }

    return false
  }

  private async evaluateConditions(
    conditions: string[],
    userId: string,
    context?: any,
  ): Promise<boolean> {
    for (const condition of conditions) {
      const result = await this.evaluateCondition(condition, userId, context)
      if (!result) return false
    }
    return true
  }

  private async evaluateCondition(
    condition: string,
    userId: string,
    context?: any,
  ): Promise<boolean> {
    switch (condition) {
      case 'owns_client_data':
        return context?.clientId && await this.ownsClientData(userId, context.clientId)

      case 'assigned_professional':
        return context?.professionalId === userId

      case 'certified_for_treatment':
        return context?.treatmentId &&
          await this.isCertifiedForTreatment(userId, context.treatmentId)

      case 'basic_info_only':
        return this.isBasicInfoUpdate(context?.updateFields)

      case 'compliance_related_only':
        return this.isComplianceRelatedUpdate(context?.updateFields)

      default:
        return false
    }
  }
}
```

## 🛡️ Data Protection

### Encryption Strategy

```typescript
// apps/api/src/services/data-masking-service.ts
interface EncryptionConfig {
  algorithm: 'aes-256-gcm'
  keyRotationDays: number
  dataClassification: {
    sensitive: string[]
    highlySensitive: string[]
  }
}

const ENCRYPTION_CONFIG: EncryptionConfig = {
  algorithm: 'aes-256-gcm',
  keyRotationDays: 90,
  dataClassification: {
    sensitive: [
      'cpf',
      'rg',
      'phone',
      'email',
      'address',
      'medicalConditions',
      'allergies',
      'medications',
    ],
    highlySensitive: [
      'healthData',
      'treatmentHistory',
      'photos',
      'biometricData',
      'geneticInformation',
    ],
  },
}

export class DataProtectionService {
  private encryptionKeys: Map<string, CryptoKey> = new Map()
  private keyManager: KeyManager

  async encryptData(
    data: any,
    classification: 'sensitive' | 'highly_sensitive',
  ): Promise<EncryptedData> {
    const key = await this.getCurrentEncryptionKey()
    const iv = crypto.getRandomValues(new Uint8Array(12))

    const dataString = JSON.stringify(data)
    const dataBuffer = new TextEncoder().encode(dataString)

    const encrypted = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      key,
      dataBuffer,
    )

    return {
      data: Array.from(new Uint8Array(encrypted)),
      iv: Array.from(iv),
      keyId: await this.getCurrentKeyId(),
      algorithm: 'aes-256-gcm',
      classification,
      timestamp: new Date().toISOString(),
    }
  }

  async decryptData(encrypted: EncryptedData): Promise<any> {
    const key = await this.getEncryptionKey(encrypted.keyId)
    const iv = new Uint8Array(encrypted.iv)
    const data = new Uint8Array(encrypted.data)

    const decrypted = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      key,
      data,
    )

    const decryptedString = new TextDecoder().decode(decrypted)
    return JSON.parse(decryptedString)
  }

  async maskData(data: any, fields: string[]): Promise<any> {
    const masked = { ...data }

    for (const field of fields) {
      if (masked[field]) {
        masked[field] = this.maskValue(masked[field], field)
      }
    }

    return masked
  }

  private maskValue(value: string, fieldType: string): string {
    switch (fieldType) {
      case 'cpf':
        return `***.${value.slice(-6)}`
      case 'phone':
        return `(***) ***-${value.slice(-4)}`
      case 'email':
        const [local, domain] = value.split('@')
        return `${local[0]}***@${domain}`
      case 'name':
        return `${value[0]}${'*'.repeat(value.length - 2)}${value.slice(-1)}`
      default:
        return '*'.repeat(Math.min(value.length, 8))
    }
  }

  async hashSensitiveData(data: string, salt?: string): Promise<string> {
    const encoder = new TextEncoder()
    const dataBuffer = encoder.encode(data + (salt || ''))
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer)
    return Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
  }
}
```

### Database Security

```typescript
// Row Level Security Implementation
CREATE POLICY client_data_isolation ON AestheticClientProfile
    FOR ALL USING (
        -- Users can see their own data
        user_id = auth.uid() OR
        -- Healthcare professionals can see clients they have sessions with
        EXISTS (
            SELECT 1 FROM AestheticSession 
            WHERE client_id = AestheticClientProfile.id
            AND professional_id = (
                SELECT id FROM AestheticProfessional 
                WHERE user_id = auth.uid()
            )
        ) OR
        -- Admins can see all data
        EXISTS (
            SELECT 1 FROM User 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Data encryption at rest
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Encrypt sensitive columns
ALTER TABLE AestheticClientProfile 
ADD COLUMN encrypted_cpf TEXT,
ADD COLUMN encrypted_phone TEXT,
ADD COLUMN encrypted_email TEXT;

-- Trigger for automatic encryption
CREATE OR REPLACE FUNCTION encrypt_sensitive_data()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.cpf IS NOT NULL AND NEW.cpf != OLD.cpf THEN
        NEW.encrypted_cpf = pgp_sym_encrypt(NEW.cpf, current_setting('app.encryption_key'));
    END IF;
    
    IF NEW.phone IS NOT NULL AND NEW.phone != OLD.phone THEN
        NEW.encrypted_phone = pgp_sym_encrypt(NEW.phone, current_setting('app.encryption_key'));
    END IF;
    
    IF NEW.email IS NOT NULL AND NEW.email != OLD.email THEN
        NEW.encrypted_email = pgp_sym_encrypt(NEW.email, current_setting('app.encryption_key'));
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER encrypt_client_data
    BEFORE INSERT OR UPDATE ON AestheticClientProfile
    FOR EACH ROW EXECUTE FUNCTION encrypt_sensitive_data();
```

## 🔍 Input Validation & Sanitization

### SQL Injection Prevention

```typescript
// apps/api/src/security/sql-sanitizer.ts
export class SQLSanitizer {
  private static readonly DANGEROUS_PATTERNS = [
    /(\s|^)(OR|AND)\s+\d+\s*=\s*\d+/i,
    /(\s|^)(OR|AND)\s+\w+\s*=\s*['"]\w+['"]/i,
    /(\s|^)(OR|AND)\s+\w+\s+IS\s+NULL/i,
    /(\s|^)(OR|AND)\s+\w+\s+LIKE\s+['"].*['"]/i,
    /(\s|^)(UNION|SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER)\s+/i,
    /(\s|^)(EXEC|EXECUTE|SP_|XP_)/i,
    /(\s|^)(--|\/\*|\*\/|;)/i,
    /(\s|^)(WAITFOR|DELAY|SLEEP)/i,
    /(\s|^)(CONVERT|CAST)\s*\(/i,
  ]

  static sanitize(input: string): string {
    if (typeof input !== 'string') return input

    // Remove potential SQL injection patterns
    let sanitized = input
    for (const pattern of this.DANGEROUS_PATTERNS) {
      sanitized = sanitized.replace(pattern, '')
    }

    // Escape special characters
    sanitized = sanitized
      .replace(/'/g, "''")
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')

    return sanitized.trim()
  }

  static validateSafe(input: string): boolean {
    if (typeof input !== 'string') return false

    for (const pattern of this.DANGEROUS_PATTERNS) {
      if (pattern.test(input)) {
        return false
      }
    }

    return true
  }

  static sanitizeObject(obj: any): any {
    if (typeof obj !== 'object' || obj === null) return obj

    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeObject(item))
    }

    const sanitized: any = {}
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        sanitized[key] = this.sanitize(value)
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitizeObject(value)
      } else {
        sanitized[key] = value
      }
    }

    return sanitized
  }
}
```

### XSS Prevention

```typescript
// apps/api/src/security/xss-protection.ts
export class XSSProtection {
  private static readonly XSS_PATTERNS = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
    /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi,
    /javascript:/gi,
    /vbscript:/gi,
    /on\w+\s*=/gi,
    /<\?php/gi,
    /<%[^>]*>/gi,
    /<\s*!\[CDATA\[/gi,
    /data:\s*text\/html/gi,
    /data:\s*text\/javascript/gi,
    /data:\s*image\/svg\+xml/gi,
    /expression\s*\(/gi,
    /url\s*\(\s*javascript:/gi,
    /-\s*moz-binding\s*:/gi,
    /-\s*ms-binding\s*:/gi,
  ]

  static sanitize(input: string): string {
    if (typeof input !== 'string') return input

    let sanitized = input

    // Remove XSS patterns
    for (const pattern of this.XSS_PATTERNS) {
      sanitized = sanitized.replace(pattern, '')
    }

    // HTML entity encoding
    sanitized = sanitized
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')

    return sanitized
  }

  static validateSafe(input: string): boolean {
    if (typeof input !== 'string') return false

    for (const pattern of this.XSS_PATTERNS) {
      if (pattern.test(input)) {
        return false
      }
    }

    return true
  }

  static sanitizeForAttribute(input: string): string {
    return this.sanitize(input)
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/`/g, '&#x60;')
  }
}
```

## 📝 Audit Trail & Logging

### Comprehensive Audit System

```typescript
// apps/api/src/services/audit/agent-audit-service.ts
interface AuditEvent {
  id: string
  eventType: string
  userId: string
  userRole: string
  resourceType: string
  resourceId: string
  action: string
  timestamp: Date
  ipAddress: string
  userAgent: string
  sessionId: string
  eventData: any
  previousValue?: any
  newValue?: any
  complianceRelevant: boolean
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  requiresReview: boolean
  reviewStatus: 'pending' | 'approved' | 'rejected' | 'none'
}

export class AuditService {
  async logEvent(event: Omit<AuditEvent, 'id' | 'timestamp'>): Promise<void> {
    const auditEvent: AuditEvent = {
      ...event,
      id: generateUUID(),
      timestamp: new Date(),
    }

    // Determine if event is compliance relevant
    auditEvent.complianceRelevant = this.isComplianceRelevant(event)

    // Calculate risk level
    auditEvent.riskLevel = this.calculateRiskLevel(event)

    // Determine if review is required
    auditEvent.requiresReview = this.requiresReview(event)

    // Store in database
    await this.storeAuditEvent(auditEvent)

    // Send to real-time monitoring if high risk
    if (auditEvent.riskLevel === 'high' || auditEvent.riskLevel === 'critical') {
      await this.alertSecurityTeam(auditEvent)
    }

    // Log to compliance system if relevant
    if (auditEvent.complianceRelevant) {
      await this.logToComplianceSystem(auditEvent)
    }
  }

  private isComplianceRelevant(event: Omit<AuditEvent, 'id' | 'timestamp'>): boolean {
    const complianceEvents = [
      'client_data_access',
      'client_data_modification',
      'treatment_execution',
      'consent_management',
      'compliance_validation',
      'data_export',
      'data_deletion',
      'professional_certification',
      'anvisa_validation',
      'lgpd_request',
    ]

    return complianceEvents.includes(event.eventType) ||
      event.resourceType.startsWith('compliance_') ||
      event.action.includes('compliance')
  }

  private calculateRiskLevel(
    event: Omit<AuditEvent, 'id' | 'timestamp'>,
  ): 'low' | 'medium' | 'high' | 'critical' {
    let riskScore = 0

    // Base risk by action type
    const actionRisk = {
      create: 1,
      read: 1,
      update: 2,
      delete: 3,
      execute: 2,
      export: 3,
      admin: 4,
    }
    riskScore += actionRisk[event.action] || 1

    // Resource type risk
    const resourceRisk = {
      client_profile: 3,
      treatment_data: 3,
      medical_history: 4,
      consent_forms: 3,
      compliance_records: 2,
      user_management: 3,
      system_config: 4,
    }
    riskScore += resourceRisk[event.resourceType] || 1

    // User role risk
    const roleRisk = {
      admin: 1,
      healthcare_professional: 2,
      receptionist: 1,
      compliance_officer: 1,
      external: 4,
    }
    riskScore += roleRisk[event.userRole] || 2

    // Additional risk factors
    if (event.complianceRelevant) riskScore += 2
    if (event.eventType.includes('bulk')) riskScore += 2
    if (event.eventType.includes('export')) riskScore += 2
    if (event.eventType.includes('delete')) riskScore += 2

    // Convert score to risk level
    if (riskScore >= 8) return 'critical'
    if (riskScore >= 6) return 'high'
    if (riskScore >= 4) return 'medium'
    return 'low'
  }

  private requiresReview(event: Omit<AuditEvent, 'id' | 'timestamp'>): boolean {
    return event.riskLevel === 'high' ||
      event.riskLevel === 'critical' ||
      event.complianceRelevant ||
      event.action === 'delete' ||
      event.action === 'export'
  }

  async getAuditEvents(filters: AuditFilters): Promise<AuditEvent[]> {
    const query = this.buildAuditQuery(filters)
    return await this.database.query(query)
  }

  async generateComplianceReport(startDate: Date, endDate: Date): Promise<ComplianceReport> {
    const events = await this.getAuditEvents({
      startDate,
      endDate,
      complianceRelevant: true,
    })

    return {
      period: { start: startDate, end: endDate },
      totalEvents: events.length,
      eventsByType: this.groupEventsByType(events),
      eventsByRisk: this.groupEventsByRisk(events),
      pendingReviews: events.filter(e => e.requiresReview && e.reviewStatus === 'pending'),
      complianceScore: this.calculateComplianceScore(events),
      recommendations: this.generateRecommendations(events),
    }
  }
}
```

## 🔐 API Security

### Request Security Middleware

```typescript
// apps/api/src/middleware/security-middleware.ts
export class SecurityMiddleware {
  async handleRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Rate limiting check
      await this.checkRateLimit(req)

      // Security headers
      this.setSecurityHeaders(res)

      // Input validation
      await this.validateInput(req)

      // Authentication check
      await this.checkAuthentication(req)

      // Authorization check
      await this.checkAuthorization(req)

      // Compliance validation
      await this.checkCompliance(req)

      // Request logging
      await this.logRequest(req)

      next()
    } catch (error) {
      await this.handleSecurityError(error, req, res)
    }
  }

  private setSecurityHeaders(res: Response): void {
    const headers = {
      'Content-Security-Policy':
        "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'none';",
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      Pragma: 'no-cache',
      Expires: '0',
    }

    Object.entries(headers).forEach(([key, value]) => {
      res.setHeader(key, value)
    })
  }

  private async checkRateLimit(req: Request): Promise<void> {
    const clientId = this.getClientIdentifier(req)
    const key = `rate_limit:${clientId}`

    const current = await this.redis.incr(key)
    if (current === 1) {
      await this.redis.expire(key, 60) // 1 minute window
    }

    const limits = this.getRateLimits(req)
    if (current > limits.requestsPerMinute) {
      throw new RateLimitError('Rate limit exceeded')
    }
  }

  private async validateInput(req: Request): Promise<void> {
    if (req.body) {
      // Sanitize input data
      req.body = SQLSanitizer.sanitizeObject(req.body)

      // Validate against XSS
      if (typeof req.body === 'object') {
        this.validateObjectForXSS(req.body)
      }
    }

    // Validate query parameters
    if (req.query) {
      req.query = SQLSanitizer.sanitizeObject(req.query)
      this.validateQueryParams(req.query)
    }
  }

  private async checkAuthentication(req: Request): Promise<void> {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('Missing or invalid authentication token')
    }

    const token = authHeader.substring(7)
    const payload = await this.verifyJWT(token)

    if (!payload || payload.exp < Date.now() / 1000) {
      throw new AuthenticationError('Invalid or expired token')
    }

    // Attach user info to request
    req.user = payload
    req.sessionId = payload.sessionId
  }

  private async checkAuthorization(req: Request): Promise<void> {
    const user = req.user
    const path = req.path
    const method = req.method

    const resource = this.extractResource(path)
    const action = this.mapMethodToAction(method)

    const hasPermission = await this.permissionManager.checkPermission(
      user.id,
      resource,
      action,
      { path, method, body: req.body },
    )

    if (!hasPermission) {
      throw new AuthorizationError('Insufficient permissions')
    }
  }

  private async checkCompliance(req: Request): Promise<void> {
    const user = req.user
    const path = req.path

    // Check if request requires compliance validation
    if (this.requiresComplianceCheck(path, req.method)) {
      const complianceCheck = await this.complianceService.validateRequest(
        user.id,
        path,
        req.method,
        req.body,
      )

      if (!complianceCheck.valid) {
        throw new ComplianceError(complianceCheck.reason)
      }
    }
  }

  private async logRequest(req: Request): Promise<void> {
    await this.auditService.logEvent({
      eventType: 'api_request',
      userId: req.user.id,
      userRole: req.user.role,
      resourceType: this.extractResource(req.path),
      resourceId: this.extractResourceId(req.path),
      action: this.mapMethodToAction(req.method),
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      sessionId: req.sessionId,
      eventData: {
        path: req.path,
        method: req.method,
        userAgent: req.headers['user-agent'],
        timestamp: new Date().toISOString(),
      },
      riskLevel: 'low',
      requiresReview: false,
      reviewStatus: 'none',
    })
  }
}
```

## 🛡️ Security Monitoring & Alerting

### Real-time Security Monitoring

```typescript
// apps/api/src/services/security-monitoring-dashboard.ts
export class SecurityMonitoringService {
  private alerts: Map<string, SecurityAlert> = new Map()
  private metrics: SecurityMetrics = {
    totalRequests: 0,
    failedAuthentications: 0,
    failedAuthorizations: 0,
    complianceViolations: 0,
    potentialThreats: 0,
    activeSessions: 0,
  }

  async monitorSecurityEvents(): Promise<void> {
    // Subscribe to audit events
    this.auditService.subscribe(this.handleAuditEvent.bind(this))

    // Monitor failed authentication attempts
    this.authService.onFailedAuth(this.handleFailedAuth.bind(this))

    // Monitor rate limiting violations
    this.rateLimiter.onLimitExceeded(this.handleRateLimitExceeded.bind(this))

    // Monitor compliance violations
    this.complianceService.onViolation(this.handleComplianceViolation.bind(this))
  }

  private async handleAuditEvent(event: AuditEvent): Promise<void> {
    // Check for suspicious patterns
    if (this.isSuspiciousEvent(event)) {
      await this.createSecurityAlert({
        type: 'suspicious_activity',
        severity: event.riskLevel,
        title: 'Atividade Suspeita Detectada',
        description: `Atividade suspeita detectada: ${event.eventType}`,
        eventData: event,
        requiresImmediateAction: event.riskLevel === 'critical',
      })
    }

    // Update metrics
    this.updateMetrics(event)
  }

  private async handleFailedAuth(event: FailedAuthEvent): Promise<void> {
    const userFailedAttempts = await this.getFailedAttempts(event.userId)

    if (userFailedAttempts >= 5) {
      await this.createSecurityAlert({
        type: 'brute_force',
        severity: 'high',
        title: 'Tentativa de Brute Force Detectada',
        description:
          `Múltiplas tentativas de autenticação falharam para o usuário: ${event.userId}`,
        eventData: event,
        requiresImmediateAction: true,
      })

      // Lock account
      await this.authService.lockAccount(event.userId)
    }
  }

  private async handleComplianceViolation(violation: ComplianceViolation): Promise<void> {
    await this.createSecurityAlert({
      type: 'compliance_violation',
      severity: 'high',
      title: 'Violação de Conformidade',
      description: `Violação de conformidade detectada: ${violation.type}`,
      eventData: violation,
      requiresImmediateAction: true,
    })
  }

  private async createSecurityAlert(alert: Omit<SecurityAlert, 'id' | 'timestamp'>): Promise<void> {
    const securityAlert: SecurityAlert = {
      ...alert,
      id: generateUUID(),
      timestamp: new Date(),
    }

    this.alerts.set(securityAlert.id, securityAlert)

    // Send notifications
    if (alert.requiresImmediateAction) {
      await this.notifySecurityTeam(securityAlert)
      await this.notifyComplianceTeam(securityAlert)
    }

    // Log to audit
    await this.auditService.logEvent({
      eventType: 'security_alert',
      userId: 'system',
      userRole: 'system',
      resourceType: 'security',
      resourceId: securityAlert.id,
      action: 'create',
      ipAddress: 'system',
      userAgent: 'system',
      sessionId: 'system',
      eventData: securityAlert,
      riskLevel: alert.severity,
      requiresReview: true,
      reviewStatus: 'pending',
    })
  }

  async getSecurityDashboard(): Promise<SecurityDashboard> {
    const activeAlerts = Array.from(this.alerts.values())
      .filter(alert => !alert.resolved)

    return {
      metrics: this.metrics,
      alerts: activeAlerts,
      recentEvents: await this.getRecentSecurityEvents(),
      complianceStatus: await this.getComplianceStatus(),
      recommendations: await this.generateSecurityRecommendations(),
    }
  }

  async generateSecurityReport(timeRange: { start: Date; end: Date }): Promise<SecurityReport> {
    const events = await this.auditService.getAuditEvents({
      startDate: timeRange.start,
      endDate: timeRange.end,
      types: ['security_alert', 'failed_authentication', 'compliance_violation'],
    })

    return {
      period: timeRange,
      totalSecurityEvents: events.length,
      eventsByType: this.groupEventsByType(events),
      eventsBySeverity: this.groupEventsBySeverity(events),
      resolvedAlerts: events.filter(e => e.reviewStatus === 'approved').length,
      pendingAlerts: events.filter(e => e.reviewStatus === 'pending').length,
      securityScore: this.calculateSecurityScore(events),
      recommendations: this.generateSecurityRecommendations(events),
    }
  }
}
```

This comprehensive security implementation provides multiple layers of protection for the aesthetic clinic system, ensuring data privacy, regulatory compliance, and robust protection against security threats while maintaining full Brazilian healthcare compliance.
