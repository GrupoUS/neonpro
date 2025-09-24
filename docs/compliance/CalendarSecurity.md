# Calendar Security & Compliance Guide

## Overview

This comprehensive security guide covers best practices, compliance requirements, and security implementations for NeonPro's calendar components. The guide focuses on healthcare-specific security requirements including LGPD compliance, data protection, and secure API integration.

## Security Framework

### Security Principles

- **Defense in Depth**: Multiple layers of security controls
- **Least Privilege**: Minimum necessary access for users and systems
- **Zero Trust**: Verify explicitly, use least privilege, assume breach
- **Privacy by Design**: Built-in privacy protections
- **Secure by Default**: Secure configurations out of the box

### Compliance Requirements

- **LGPD (Lei Geral de Proteção de Dados)**: Brazilian data protection law
- **HIPAA**: Health Insurance Portability and Accountability Act (if applicable)
- **GDPR**: General Data Protection Regulation (for EU users)
- **WCAG 2.1 AA**: Web Content Accessibility Guidelines

## Data Protection

### 1. Patient Data Handling

```typescript
// Patient data classification
enum DataSensitivity {
  PUBLIC = 'public', // Non-sensitive information
  INTERNAL = 'internal', // Internal business data
  CONFIDENTIAL = 'confidential', // Patient appointment times
  RESTRICTED = 'restricted', // Patient health information
  CRITICAL = 'critical', // Special health data
}

// Data minimization principle
interface MinimalPatientData {
  id: string // Required for identification
  initials: string // Instead of full name for privacy
  appointmentTime: Date // Necessary for scheduling
  appointmentType: string // Required for service delivery
  // Excluded: full name, contact details, medical history
}

// Data access control
interface AccessControl {
  canView: (userId: string, patientId: string) => boolean
  canEdit: (userId: string, patientId: string) => boolean
  canDelete: (userId: string, patientId: string) => boolean
  auditAccess: (userId: string, action: string, data: any) => Promise<void>
}
```

### 2. Data Encryption

```typescript
// Encryption utilities
class CalendarSecurity {
  private static readonly encryptionKey = process.env.CALENDAR_ENCRYPTION_KEY

  // Encrypt sensitive event data
  static encryptEventData(event: CalendarEvent): string {
    const sensitiveData = {
      patientId: event.patientId,
      description: event.description,
      location: event.location,
      notes: event.notes,
    }

    return CryptoJS.AES.encrypt(
      JSON.stringify(sensitiveData),
      this.encryptionKey,
    ).toString()
  }

  // Decrypt event data
  static decryptEventData(encryptedData: string): any {
    const bytes = CryptoJS.AES.decrypt(encryptedData, this.encryptionKey)
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8))
  }

  // Hash sensitive identifiers
  static hashPatientId(patientId: string): string {
    return CryptoJS.SHA256(patientId + this.encryptionKey).toString()
  }
}
```

### 3. Data Retention Policies

```typescript
// Data retention configuration
const retentionPolicies = {
  appointmentData: {
    retentionPeriod: 730, // 2 years
    archivePeriod: 3650, // 10 years
    deletionMethod: 'secure_wipe',
  },
  auditLogs: {
    retentionPeriod: 3650, // 10 years
    archivePeriod: 0, // Keep forever
    deletionMethod: 'none',
  },
  userActivity: {
    retentionPeriod: 90, // 3 months
    archivePeriod: 365, // 1 year
    deletionMethod: 'standard',
  },
}

// Automated data cleanup
class DataRetentionService {
  async cleanupExpiredData() {
    const now = new Date()

    // Clean expired appointment data
    await this.cleanupAppointments(now)

    // Archive old audit logs
    await this.archiveAuditLogs(now)

    // Clean user activity logs
    await this.cleanupUserActivity(now)
  }

  private async cleanupAppointments(now: Date) {
    const cutoffDate = subDays(
      now,
      retentionPolicies.appointmentData.retentionPeriod,
    )

    await prisma.calendarEvent.deleteMany({
      where: {
        end: {
          lt: cutoffDate,
        },
        status: 'completed',
      },
    })
  }
}
```

## Authentication & Authorization

### 1. Authentication Implementation

```typescript
// JWT token validation
interface CalendarAuthToken {
  userId: string
  clinicId: string
  role: UserRole
  permissions: Permission[]
  exp: number
  iat: number
}

class CalendarAuthService {
  static validateToken(token: string): CalendarAuthToken | null {
    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET,
      ) as CalendarAuthToken

      // Check if token is expired
      if (decoded.exp * 1000 < Date.now()) {
        return null
      }

      return decoded
    } catch (error) {
      return null
    }
  }

  static hasPermission(token: string, requiredPermission: Permission): boolean {
    const user = this.validateToken(token)
    if (!user) return false

    return user.permissions.includes(requiredPermission)
  }

  static generateSecureToken(
    userId: string,
    clinicId: string,
    role: UserRole,
  ): string {
    const payload: CalendarAuthToken = {
      userId,
      clinicId,
      role,
      permissions: this.getRolePermissions(role),
      exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24 hours
      iat: Math.floor(Date.now() / 1000),
    }

    return jwt.sign(payload, process.env.JWT_SECRET)
  }
}
```

### 2. Role-Based Access Control

```typescript
// User roles and permissions
enum UserRole {
  ADMIN = 'admin',
  PRACTITIONER = 'practitioner',
  RECEPTIONIST = 'receptionist',
  PATIENT = 'patient',
}

enum Permission {
  VIEW_APPOINTMENTS = 'view:appointments',
  CREATE_APPOINTMENTS = 'create:appointments',
  EDIT_APPOINTMENTS = 'edit:appointments',
  DELETE_APPOINTMENTS = 'delete:appointments',
  VIEW_PATIENTS = 'view:patients',
  MANAGE_CLINIC = 'manage:clinic',
  VIEW_AUDIT_LOGS = 'view:audit_logs',
}

// Role permissions mapping
const rolePermissions: Record<UserRole, Permission[]> = {
  [UserRole.ADMIN]: [
    Permission.VIEW_APPOINTMENTS,
    Permission.CREATE_APPOINTMENTS,
    Permission.EDIT_APPOINTMENTS,
    Permission.DELETE_APPOINTMENTS,
    Permission.VIEW_PATIENTS,
    Permission.MANAGE_CLINIC,
    Permission.VIEW_AUDIT_LOGS,
  ],
  [UserRole.PRACTITIONER]: [
    Permission.VIEW_APPOINTMENTS,
    Permission.CREATE_APPOINTMENTS,
    Permission.EDIT_APPOINTMENTS,
    Permission.VIEW_PATIENTS,
  ],
  [UserRole.RECEPTIONIST]: [
    Permission.VIEW_APPOINTMENTS,
    Permission.CREATE_APPOINTMENTS,
    Permission.EDIT_APPOINTMENTS,
  ],
  [UserRole.PATIENT]: [Permission.VIEW_APPOINTMENTS],
}

// Authorization hook
function useCalendarAuth() {
  const { token } = useAuth()

  const canViewAppointments = () => {
    return CalendarAuthService.hasPermission(
      token,
      Permission.VIEW_APPOINTMENTS,
    )
  }

  const canCreateAppointments = () => {
    return CalendarAuthService.hasPermission(
      token,
      Permission.CREATE_APPOINTMENTS,
    )
  }

  const canEditAppointment = (appointment: CalendarEvent) => {
    const user = CalendarAuthService.validateToken(token)
    if (!user) return false

    // Users can edit their own appointments or have general edit permission
    return (
      CalendarAuthService.hasPermission(token, Permission.EDIT_APPOINTMENTS) ||
      appointment.createdBy === user.userId
    )
  }

  const canDeleteAppointment = (appointment: CalendarEvent) => {
    const user = CalendarAuthService.validateToken(token)
    if (!user) return false

    return CalendarAuthService.hasPermission(
      token,
      Permission.DELETE_APPOINTMENTS,
    )
  }

  return {
    canViewAppointments,
    canCreateAppointments,
    canEditAppointment,
    canDeleteAppointment,
  }
}
```

## Input Validation & Sanitization

### 1. Event Data Validation

```typescript
// Comprehensive event validation
class EventValidator {
  static validateEvent(event: Partial<CalendarEvent>): ValidationResult {
    const errors: string[] = []

    // Required field validation
    if (!event.title || event.title.trim().length === 0) {
      errors.push('Event title is required')
    }

    if (!event.start || !(event.start instanceof Date)) {
      errors.push('Valid start time is required')
    }

    if (!event.end || !(event.end instanceof Date)) {
      errors.push('Valid end time is required')
    }

    // Business rule validation
    if (event.start && event.end && event.start >= event.end) {
      errors.push('End time must be after start time')
    }

    // Duration validation
    if (event.start && event.end) {
      const duration = event.end.getTime() - event.start.getTime()
      const minDuration = 15 * 60 * 1000 // 15 minutes
      const maxDuration = 8 * 60 * 60 * 1000 // 8 hours

      if (duration < minDuration) {
        errors.push('Minimum appointment duration is 15 minutes')
      }

      if (duration > maxDuration) {
        errors.push('Maximum appointment duration is 8 hours')
      }
    }

    // Business hours validation
    if (event.start && !isDuringBusinessHours(event.start)) {
      errors.push('Appointments must be scheduled during business hours')
    }

    // XSS prevention
    if (event.title && containsXSS(event.title)) {
      errors.push('Event title contains invalid characters')
    }

    if (event.description && containsXSS(event.description)) {
      errors.push('Event description contains invalid characters')
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }
}

// XSS detection utility
function containsXSS(input: string): boolean {
  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
    /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi,
  ]

  return xssPatterns.some(pattern => pattern.test(input))
}

// Sanitization utility
function sanitizeInput(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}
```

### 2. API Security Middleware

```typescript
// Security middleware for calendar API
export const calendarSecurityMiddleware = async (
  req: NextApiRequest,
  res: NextApiResponse,
  next: () => void,
) => {
  try {
    // 1. Rate limiting
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress
    const rateLimitKey = `calendar_api:${clientIp}`

    const current = await redis.incr(rateLimitKey)
    if (current === 1) {
      await redis.expire(rateLimitKey, 60) // 1 minute window
    }

    if (current > 100) {
      // 100 requests per minute
      return res.status(429).json({ error: 'Rate limit exceeded' })
    }

    // 2. Authentication
    const token = req.headers.authorization?.replace('Bearer ', '')
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    const user = CalendarAuthService.validateToken(token)
    if (!user) {
      return res.status(401).json({ error: 'Invalid token' })
    }

    // 3. Authorization
    const requiredPermission = getRequiredPermission(req.method, req.path)
    if (!CalendarAuthService.hasPermission(token, requiredPermission)) {
      return res.status(403).json({ error: 'Insufficient permissions' })
    }

    // 4. Input validation
    if (req.body) {
      const validation = EventValidator.validateEvent(req.body)
      if (!validation.isValid) {
        return res.status(400).json({
          error: 'Invalid event data',
          details: validation.errors,
        })
      }
    }

    // 5. Attach user context
    req.user = user

    next()
  } catch (error) {
    console.error('Security middleware error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
```

## Audit Logging

### 1. Comprehensive Audit System

```typescript
// Audit event types
enum AuditEventType {
  APPOINTMENT_CREATED = 'appointment_created',
  APPOINTMENT_UPDATED = 'appointment_updated',
  APPOINTMENT_DELETED = 'appointment_deleted',
  APPOINTMENT_VIEWED = 'appointment_viewed',
  USER_LOGIN = 'user_login',
  USER_LOGOUT = 'user_logout',
  PERMISSION_DENIED = 'permission_denied',
  DATA_EXPORT = 'data_export',
  SYSTEM_CONFIG_CHANGED = 'system_config_changed',
}

// Audit log entry
interface AuditLogEntry {
  id: string
  timestamp: Date
  userId: string
  userType: UserRole
  eventType: AuditEventType
  action: string
  resourceId?: string
  resourceType?: string
  oldValues?: any
  newValues?: any
  ipAddress: string
  userAgent: string
  sessionId: string
  result: 'success' | 'failure'
  errorMessage?: string
}

// Audit service
class AuditService {
  static async log(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) {
    try {
      await prisma.auditLog.create({
        data: {
          ...entry,
          timestamp: new Date(),
          id: generateUUID(),
        },
      })
    } catch (error) {
      console.error('Failed to create audit log:', error)
      // Don't throw - audit failures shouldn't break the main application
    }
  }

  static async logAppointmentAction(
    action: AuditEventType,
    userId: string,
    userType: UserRole,
    appointment: CalendarEvent,
    result: 'success' | 'failure' = 'success',
    errorMessage?: string,
  ) {
    const entry: Omit<AuditLogEntry, 'id' | 'timestamp'> = {
      userId,
      userType,
      eventType: action,
      action: action.toString(),
      resourceId: appointment.id,
      resourceType: 'appointment',
      newValues: appointment,
      ipAddress: await getClientIP(),
      userAgent: navigator.userAgent,
      sessionId: getCurrentSessionId(),
      result,
      errorMessage,
    }

    await this.log(entry)
  }

  static async logSecurityEvent(
    userId: string,
    userType: UserRole,
    action: string,
    details: any,
    result: 'success' | 'failure',
  ) {
    const entry: Omit<AuditLogEntry, 'id' | 'timestamp'> = {
      userId,
      userType,
      eventType: AuditEventType.PERMISSION_DENIED,
      action,
      newValues: details,
      ipAddress: await getClientIP(),
      userAgent: navigator.userAgent,
      sessionId: getCurrentSessionId(),
      result,
    }

    await this.log(entry)
  }
}
```

### 2. Security Event Monitoring

```typescript
// Real-time security monitoring
class SecurityMonitor {
  private static alerts: SecurityAlert[] = []

  static checkForSuspiciousActivity() {
    // Check for multiple failed logins
    this.checkFailedLoginAttempts()

    // Check for unusual access patterns
    this.checkUnusualAccessPatterns()

    // Check for data export anomalies
    this.checkDataExportAnomalies()
  }

  private static async checkFailedLoginAttempts() {
    const recentFailures = await prisma.auditLog.findMany({
      where: {
        eventType: AuditEventType.USER_LOGIN,
        result: 'failure',
        timestamp: {
          gte: subMinutes(new Date(), 15), // Last 15 minutes
        },
      },
      groupBy: ['userId', 'ipAddress'],
      having: {
        count: {
          gt: 5, // More than 5 failed attempts
        },
      },
    })

    for (const failure of recentFailures) {
      await this.createSecurityAlert({
        type: 'brute_force',
        severity: 'high',
        userId: failure.userId,
        ipAddress: failure.ipAddress,
        message: 'Multiple failed login attempts detected',
      })
    }
  }

  private static async createSecurityAlert(
    alert: Omit<SecurityAlert, 'id' | 'timestamp'>,
  ) {
    const fullAlert: SecurityAlert = {
      ...alert,
      id: generateUUID(),
      timestamp: new Date(),
    }

    this.alerts.push(fullAlert)

    // Send notification
    await this.sendSecurityNotification(fullAlert)

    // Log the alert
    await AuditService.logSecurityEvent(
      'system',
      UserRole.ADMIN,
      'security_alert_created',
      fullAlert,
      'success',
    )
  }
}
```

## LGPD Compliance

### 1. Consent Management

```typescript
// Patient consent types
enum ConsentType {
  APPOINTMENT_SCHEDULING = 'appointment_scheduling',
  DATA_PROCESSING = 'data_processing',
  MARKETING_COMMUNICATIONS = 'marketing_communications',
  EMERGENCY_CONTACT = 'emergency_contact',
}

// Consent record
interface ConsentRecord {
  id: string
  patientId: string
  consentType: ConsentType
  given: boolean
  timestamp: Date
  expiryDate?: Date
  ipAddress: string
  userAgent: string
  documentHash?: string // Hash of consent document
}

// Consent service
class ConsentService {
  static async hasConsent(
    patientId: string,
    consentType: ConsentType,
  ): Promise<boolean> {
    const consent = await prisma.consentRecord.findFirst({
      where: {
        patientId,
        consentType,
        given: true,
        OR: [{ expiryDate: null }, { expiryDate: { gt: new Date() } }],
      },
      orderBy: { timestamp: 'desc' },
    })

    return !!consent
  }

  static async recordConsent(
    patientId: string,
    consentType: ConsentType,
    given: boolean,
    documentHash?: string,
  ): Promise<void> {
    await prisma.consentRecord.create({
      data: {
        id: generateUUID(),
        patientId,
        consentType,
        given,
        timestamp: new Date(),
        ipAddress: await getClientIP(),
        userAgent: navigator.userAgent,
        documentHash,
      },
    })

    // Audit the consent action
    await AuditService.logSecurityEvent(
      patientId,
      UserRole.PATIENT,
      `consent_${consentType}`,
      { given, documentHash },
      'success',
    )
  }

  static async validateAppointmentConsent(
    patientId: string,
    appointmentData: any,
  ): Promise<boolean> {
    // Check basic appointment consent
    const hasAppointmentConsent = await this.hasConsent(
      patientId,
      ConsentType.APPOINTMENT_SCHEDULING,
    )

    if (!hasAppointmentConsent) {
      throw new Error('Patient consent required for appointment scheduling')
    }

    // Check data processing consent
    const hasDataProcessingConsent = await this.hasConsent(
      patientId,
      ConsentType.DATA_PROCESSING,
    )

    if (!hasDataProcessingConsent) {
      throw new Error('Patient consent required for data processing')
    }

    return true
  }
}
```

### 2. Data Subject Rights

```typescript
// Data subject request types
enum DataSubjectRequestType {
  ACCESS = 'access',
  RECTIFICATION = 'rectification',
  ERASURE = 'erasure',
  PORTABILITY = 'portability',
  OBJECTION = 'objection',
}

// Data subject request
interface DataSubjectRequest {
  id: string
  patientId: string
  requestType: DataSubjectRequestType
  status: 'pending' | 'processing' | 'completed' | 'rejected'
  requestedAt: Date
  processedAt?: Date
  processedBy?: string
  details: any
  response?: any
}

// Data subject rights service
class DataSubjectRightsService {
  static async submitRequest(
    patientId: string,
    requestType: DataSubjectRequestType,
    details: any,
  ): Promise<DataSubjectRequest> {
    const request = await prisma.dataSubjectRequest.create({
      data: {
        id: generateUUID(),
        patientId,
        requestType,
        status: 'pending',
        requestedAt: new Date(),
        details,
      },
    })

    // Notify administrators
    await this.notifyAdminsOfRequest(request)

    return request
  }

  static async processAccessRequest(request: DataSubjectRequest): Promise<any> {
    // Collect all patient data
    const patientData = await this.collectPatientData(request.patientId)

    // Anonymize sensitive data if necessary
    const processedData = this.anonymizeSensitiveData(patientData)

    // Update request status
    await prisma.dataSubjectRequest.update({
      where: { id: request.id },
      data: {
        status: 'completed',
        processedAt: new Date(),
        response: processedData,
      },
    })

    return processedData
  }

  static async processErasureRequest(
    request: DataSubjectRequest,
  ): Promise<void> {
    // Anonymize instead of delete for audit purposes
    await this.anonymizePatientData(request.patientId)

    // Update request status
    await prisma.dataSubjectRequest.update({
      where: { id: request.id },
      data: {
        status: 'completed',
        processedAt: new Date(),
      },
    })
  }
}
```

## Secure API Implementation

### 1. API Security Best Practices

```typescript
// Secure calendar API routes
export const calendarApiRouter = createRouter()
  .middleware(authMiddleware)
  .middleware(rateLimitMiddleware)
  .middleware(inputValidationMiddleware)
  // Create appointment
  .mutation('create', {
    input: z.object({
      title: z.string().min(1).max(200),
      start: z.date(),
      end: z.date(),
      patientId: z.string().optional(),
      description: z.string().max(1000).optional(),
      location: z.string().max(200).optional(),
    }),
    async resolve({ input, ctx }) {
      // Check permissions
      if (!ctx.user.permissions.includes('create:appointments')) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Insufficient permissions',
        })
      }

      // Validate business rules
      if (input.start >= input.end) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'End time must be after start time',
        })
      }

      // Check for conflicts
      const conflicts = await checkForConflicts(input)
      if (conflicts.length > 0) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Appointment conflicts with existing schedule',
        })
      }

      // Check LGPD consent if patient data involved
      if (input.patientId) {
        await ConsentService.validateAppointmentConsent(input.patientId, input)
      }

      // Create appointment
      const appointment = await prisma.calendarEvent.create({
        data: {
          ...input,
          createdById: ctx.user.id,
          clinicId: ctx.user.clinicId,
        },
      })

      // Audit the action
      await AuditService.logAppointmentAction(
        AuditEventType.APPOINTMENT_CREATED,
        ctx.user.id,
        ctx.user.role,
        appointment,
        'success',
      )

      return appointment
    },
  })
  // Get appointments
  .query('list', {
    input: z.object({
      start: z.date(),
      end: z.date(),
      patientId: z.string().optional(),
    }),
    async resolve({ input, ctx }) {
      // Check permissions
      if (!ctx.user.permissions.includes('view:appointments')) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Insufficient permissions',
        })
      }

      // Validate date range
      if (input.end < input.start) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'End date must be after start date',
        })
      }

      // Limit date range to prevent data exfiltration
      const maxRange = 365 // 1 year
      const daysDiff = differenceInDays(input.end, input.start)
      if (daysDiff > maxRange) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Date range cannot exceed 1 year',
        })
      }

      // Get appointments
      const appointments = await prisma.calendarEvent.findMany({
        where: {
          clinicId: ctx.user.clinicId,
          start: {
            gte: input.start,
          },
          end: {
            lte: input.end,
          },
          // Filter by patient if specified and user has permission
          ...(input.patientId && ctx.user.permissions.includes('view:patients')
            ? { patientId: input.patientId }
            : {}),
        },
        orderBy: { start: 'asc' },
      })

      // Audit access
      await AuditService.logAppointmentAction(
        AuditEventType.APPOINTMENT_VIEWED,
        ctx.user.id,
        ctx.user.role,
        {
          count: appointments.length,
          dateRange: { start: input.start, end: input.end },
        },
        'success',
      )

      return appointments
    },
  })
```

### 2. Secure WebSocket Integration

```typescript
// Secure WebSocket for real-time updates
class SecureWebSocket {
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5

  constructor(
    private url: string,
    private token: string,
  ) {}

  connect() {
    try {
      this.ws = new WebSocket(`${this.url}?token=${this.token}`)

      this.ws.onopen = () => {
        console.log('WebSocket connected')
        this.reconnectAttempts = 0
      }

      this.ws.onmessage = event => {
        try {
          const message = JSON.parse(event.data)

          // Validate message structure
          if (!this.validateMessage(message)) {
            console.error('Invalid message received:', message)
            return
          }

          // Handle different message types
          this.handleMessage(message)
        } catch (error) {
          console.error('Error processing WebSocket message:', error)
        }
      }

      this.ws.onclose = () => {
        console.log('WebSocket disconnected')
        this.reconnect()
      }

      this.ws.onerror = error => {
        console.error('WebSocket error:', error)
      }
    } catch (error) {
      console.error('Failed to connect WebSocket:', error)
      this.reconnect()
    }
  }

  private validateMessage(message: any): boolean {
    // Validate message has required fields
    if (!message.type || !message.payload) {
      return false
    }

    // Validate message type
    const validTypes = [
      'appointment_update',
      'appointment_created',
      'appointment_deleted',
    ]
    if (!validTypes.includes(message.type)) {
      return false
    }

    // Validate payload based on type
    switch (message.type) {
      case 'appointment_update':
      case 'appointment_created':
        return this.validateAppointmentPayload(message.payload)
      case 'appointment_deleted':
        return typeof message.payload.id === 'string'
      default:
        return false
    }
  }

  private validateAppointmentPayload(payload: any): boolean {
    return (
      typeof payload.id === 'string' &&
      typeof payload.title === 'string' &&
      payload.start instanceof Date &&
      payload.end instanceof Date
    )
  }

  private reconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++

      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000)

      setTimeout(() => {
        console.log(
          `Attempting to reconnect WebSocket (attempt ${this.reconnectAttempts})`,
        )
        this.connect()
      }, delay)
    }
  }
}
```

## Security Testing

### 1. Security Test Suite

```typescript
// Security tests for calendar components
describe('Calendar Security', () => {
  describe('Input Validation', () => {
    test('should reject XSS attempts in event titles', () => {
      const maliciousTitle = '<script>alert("xss")</script>'

      expect(() =>
        EventValidator.validateEvent({
          title: maliciousTitle,
          start: new Date(),
          end: addHours(new Date(), 1),
        })
      ).toThrow()
    })

    test('should validate appointment duration limits', () => {
      const tooShort = {
        title: 'Test',
        start: new Date(),
        end: addMinutes(new Date(), 5), // Less than 15 minutes
      }

      const tooLong = {
        title: 'Test',
        start: new Date(),
        end: addHours(new Date(), 10), // More than 8 hours
      }

      expect(EventValidator.validateEvent(tooShort).isValid).toBe(false)
      expect(EventValidator.validateEvent(tooLong).isValid).toBe(false)
    })
  })

  describe('Authentication', () => {
    test('should reject invalid tokens', () => {
      const invalidToken = 'invalid.token.here'
      const user = CalendarAuthService.validateToken(invalidToken)

      expect(user).toBeNull()
    })

    test('should reject expired tokens', () => {
      const expiredToken = jwt.sign(
        { userId: 'test', exp: Math.floor(Date.now() / 1000) - 3600 },
        process.env.JWT_SECRET,
      )

      const user = CalendarAuthService.validateToken(expiredToken)
      expect(user).toBeNull()
    })
  })

  describe('Authorization', () => {
    test('should restrict access based on permissions', () => {
      const patientToken = CalendarAuthService.generateSecureToken(
        'patient-123',
        'clinic-456',
        UserRole.PATIENT,
      )

      expect(
        CalendarAuthService.hasPermission(
          patientToken,
          Permission.DELETE_APPOINTMENTS,
        ),
      ).toBe(false)
    })
  })

  describe('Data Protection', () => {
    test('should encrypt sensitive patient data', () => {
      const sensitiveData = {
        patientId: 'patient-123',
        description: 'Sensitive medical information',
      }

      const encrypted = CalendarSecurity.encryptEventData(sensitiveData)
      const decrypted = CalendarSecurity.decryptEventData(encrypted)

      expect(decrypted).toEqual(sensitiveData)
    })

    test('should hash patient identifiers for privacy', () => {
      const patientId = 'patient-123'
      const hash = CalendarSecurity.hashPatientId(patientId)

      expect(hash).not.toBe(patientId)
      expect(hash).toMatch(/^[a-f0-9]+$/)
    })
  })
})
```

### 2. Penetration Testing Checklist

```typescript
// Security penetration test scenarios
const penTestScenarios = [
  {
    name: 'SQL Injection',
    description: 'Test for SQL injection in API parameters',
    tests: [
      { payload: "' OR '1'='1", expected: 'Should be rejected' },
      {
        payload: "'; DROP TABLE appointments; --",
        expected: 'Should be rejected',
      },
    ],
  },
  {
    name: 'XSS Attacks',
    description: 'Test for cross-site scripting vulnerabilities',
    tests: [
      { payload: '<script>alert(1)</script>', expected: 'Should be sanitized' },
      { payload: 'javascript:alert(1)', expected: 'Should be rejected' },
    ],
  },
  {
    name: 'Authentication Bypass',
    description: 'Test for authentication bypass vulnerabilities',
    tests: [
      {
        scenario: 'Access protected endpoint without token',
        expected: '401 Unauthorized',
      },
      { scenario: 'Access with malformed token', expected: '401 Unauthorized' },
    ],
  },
  {
    name: 'Authorization Bypass',
    description: 'Test for privilege escalation',
    tests: [
      {
        scenario: 'Patient accessing admin functions',
        expected: '403 Forbidden',
      },
      { scenario: "Accessing other patients' data", expected: '403 Forbidden' },
    ],
  },
  {
    name: 'Data Exfiltration',
    description: 'Test for data theft vulnerabilities',
    tests: [
      {
        scenario: 'Large date range requests',
        expected: 'Should be rate limited',
      },
      {
        scenario: 'Bulk data export without authorization',
        expected: 'Should be blocked',
      },
    ],
  },
]
```

## Security Best Practices Summary

### 1. Development

- **Validate all inputs** on both client and server
- **Use parameterized queries** to prevent SQL injection
- **Sanitize all output** to prevent XSS
- **Implement proper error handling** that doesn't leak sensitive information
- **Use security headers** (CSP, XSS Protection, HSTS)

### 2. Operations

- **Regular security audits** and penetration testing
- **Keep dependencies updated** to patch known vulnerabilities
- **Monitor for suspicious activity** in real-time
- **Have incident response** procedures ready
- **Regular backups** with secure storage

### 3. Compliance

- **Document all data processing** activities
- **Maintain audit logs** for required retention periods
- **Respond to data subject requests** promptly
- **Conduct regular privacy impact assessments**
- **Stay updated on regulatory changes**

### 4. User Education

- **Train staff** on security best practices
- **Educate patients** on their data rights
- **Provide clear privacy policies**
- **Report security incidents** transparently
- **Create security awareness** materials

By implementing these security measures and following the compliance guidelines, you can ensure that your calendar application meets healthcare industry standards and protects sensitive patient data effectively.
