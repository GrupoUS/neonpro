# Security & Compliance Framework

## 🔐 PROGRESSIVE SECURITY ARCHITECTURE

Zero-trust security model that scales with system criticality, regulatory requirements, and threat
landscape complexity.

**Core Principle**: Security by design with progressive hardening based on risk assessment and
regulatory compliance requirements.

## 📊 SECURITY COMPLEXITY MATRIX

```yaml
security_levels:
  L1_L2_basic:
    focus: "Input validation, basic authentication, HTTPS"
    threats: "Common web vulnerabilities (OWASP Top 10)"
    compliance: "Basic data protection"

  L3_L4_standard:
    focus: "Authorization, session management, secure headers"
    threats: "Advanced persistent threats, privilege escalation"
    compliance: "GDPR/LGPD basic compliance"

  L5_L6_hardened:
    focus: "Multi-factor auth, encryption at rest, security monitoring"
    threats: "Nation-state actors, zero-day exploits"
    compliance: "SOX, PCI DSS Level 1"

  L7_L8_enterprise:
    focus: "Zero-trust architecture, threat intelligence, security automation"
    threats: "Advanced persistent threats, supply chain attacks"
    compliance: "ISO 27001, NIST Cybersecurity Framework"

  L9_L10_critical:
    focus: "Formal verification, air-gapped systems, regulatory audit trails"
    threats: "State-sponsored attacks, quantum threats"
    compliance: "Healthcare (HIPAA, ANVISA, CFM), Financial (PCI DSS Level 1)"
```

## 🛡 L1-L2: FOUNDATIONAL SECURITY

**Scope**: Basic web applications, internal tools\
**Compliance**: Basic data protection, HTTPS enforcement

### Input Validation & Sanitization

```typescript
// ✅ Comprehensive input validation
import DOMPurify from 'dompurify';
import { z } from 'zod';

// Schema-based validation
const UserRegistrationSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(12).max(128).regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    'Password must contain uppercase, lowercase, number, and special character',
  ),
  name: z.string().min(2).max(100).regex(
    /^[a-zA-ZÀ-ÿ\s'-]+$/,
    'Name can only contain letters, spaces, hyphens, and apostrophes',
  ),
});

class InputValidator {
  static validateAndSanitize<T>(
    input: unknown,
    schema: z.ZodSchema<T>,
  ): ValidationResult<T> {
    try {
      // Parse and validate
      const validatedData = schema.parse(input);

      // Sanitize string fields
      const sanitizedData = this.sanitizeObject(validatedData);

      return {
        isValid: true,
        data: sanitizedData,
        errors: [],
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          isValid: false,
          data: null,
          errors: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        };
      }
      throw error;
    }
  }

  private static sanitizeObject<T>(obj: T): T {
    if (typeof obj === 'string') {
      return DOMPurify.sanitize(obj.trim()) as T;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeObject(item)) as T;
    }

    if (obj && typeof obj === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = this.sanitizeObject(value);
      }
      return sanitized;
    }

    return obj;
  }
}
```

### Basic Authentication & Password Security

```typescript
// ✅ Secure password handling with bcrypt
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

class PasswordService {
  private static readonly SALT_ROUNDS = 12;
  private static readonly MIN_PASSWORD_LENGTH = 12;

  static async hashPassword(plainPassword: string): Promise<string> {
    // Validate password strength
    if (!this.isStrongPassword(plainPassword)) {
      throw new WeakPasswordError('Password does not meet security requirements');
    }

    // Generate salt and hash
    return await bcrypt.hash(plainPassword, this.SALT_ROUNDS);
  }

  static async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  static isStrongPassword(password: string): boolean {
    if (password.length < this.MIN_PASSWORD_LENGTH) return false;

    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[@$!%*?&]/.test(password);

    return hasLower && hasUpper && hasNumber && hasSpecial;
  }

  static generateSecureToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }
}

// Basic authentication middleware
class AuthenticationMiddleware {
  constructor(private readonly userService: UserService) {}

  async authenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const token = this.extractToken(req);
      if (!token) {
        return this.handleUnauthorized(res, 'Authentication token required');
      }

      const user = await this.userService.validateToken(token);
      if (!user) {
        return this.handleUnauthorized(res, 'Invalid or expired token');
      }

      // Rate limiting per user
      const rateLimitResult = await this.checkRateLimit(user.id);
      if (!rateLimitResult.allowed) {
        return this.handleRateLimited(res);
      }

      req.user = user;
      next();
    } catch (error) {
      return this.handleUnauthorized(res, 'Authentication failed');
    }
  }

  private extractToken(req: Request): string | null {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) return null;

    return authHeader.substring(7);
  }

  private handleUnauthorized(res: Response, message: string): void {
    res.status(401).json({
      error: 'Unauthorized',
      message,
      timestamp: new Date().toISOString(),
    });
  }
}
```

### HTTPS & Security Headers

```typescript
// ✅ Essential security headers middleware
class SecurityHeadersMiddleware {
  static configure(app: Express): void {
    // Force HTTPS in production
    if (process.env.NODE_ENV === 'production') {
      app.use((req, res, next) => {
        if (!req.secure && req.get('X-Forwarded-Proto') !== 'https') {
          return res.redirect(301, `https://${req.get('Host')}${req.url}`);
        }
        next();
      });
    }

    // Security headers
    app.use((req, res, next) => {
      // Prevent clickjacking
      res.setHeader('X-Frame-Options', 'DENY');

      // Prevent MIME type sniffing
      res.setHeader('X-Content-Type-Options', 'nosniff');

      // Enable XSS protection
      res.setHeader('X-XSS-Protection', '1; mode=block');

      // Strict transport security
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

      // Content Security Policy
      res.setHeader(
        'Content-Security-Policy',
        [
          "default-src 'self'",
          "script-src 'self' 'unsafe-inline'",
          "style-src 'self' 'unsafe-inline'",
          "img-src 'self' data: https:",
          "font-src 'self'",
          "connect-src 'self'",
          "frame-ancestors 'none'",
        ].join('; '),
      );

      // Remove server information
      res.removeHeader('X-Powered-By');

      next();
    });
  }
}
```

## 🔒 L3-L4: STANDARD SECURITY

**Scope**: Business applications, customer-facing systems\
**Compliance**: GDPR/LGPD compliance, SOC 2 Type II

### Role-Based Access Control (RBAC)

```typescript
// ✅ Comprehensive authorization system
interface Permission {
  resource: string;
  actions: string[];
  conditions?: PermissionCondition[];
}

interface Role {
  id: string;
  name: string;
  permissions: Permission[];
  isSystemRole: boolean;
}

interface User {
  id: string;
  roles: Role[];
  directPermissions: Permission[];
}

class AuthorizationService {
  constructor(
    private readonly roleService: RoleService,
    private readonly permissionService: PermissionService,
    private readonly auditLogger: AuditLogger,
  ) {}

  async hasPermission(
    user: User,
    resource: string,
    action: string,
    context?: AuthorizationContext,
  ): Promise<boolean> {
    // Collect all permissions (role-based + direct)
    const allPermissions = await this.getUserPermissions(user);

    // Check permissions with conditions
    const hasAccess = allPermissions.some(permission =>
      this.matchesPermission(permission, resource, action, context)
    );

    // Audit authorization check
    await this.auditLogger.logAuthorizationCheck({
      userId: user.id,
      resource,
      action,
      granted: hasAccess,
      timestamp: new Date(),
      context,
    });

    return hasAccess;
  }

  private async getUserPermissions(user: User): Promise<Permission[]> {
    const rolePermissions = user.roles.flatMap(role => role.permissions);
    const directPermissions = user.directPermissions;

    return [...rolePermissions, ...directPermissions];
  }

  private matchesPermission(
    permission: Permission,
    resource: string,
    action: string,
    context?: AuthorizationContext,
  ): boolean {
    // Resource matching (supports wildcards)
    if (!this.matchesResource(permission.resource, resource)) {
      return false;
    }

    // Action matching
    if (!permission.actions.includes(action) && !permission.actions.includes('*')) {
      return false;
    }

    // Context conditions
    if (permission.conditions && context) {
      return permission.conditions.every(condition => this.evaluateCondition(condition, context));
    }

    return true;
  }

  private evaluateCondition(
    condition: PermissionCondition,
    context: AuthorizationContext,
  ): boolean {
    switch (condition.type) {
      case 'time_based':
        return this.isWithinTimeRange(condition.value);
      case 'ip_whitelist':
        return condition.value.includes(context.ipAddress);
      case 'resource_owner':
        return context.resourceOwnerId === context.userId;
      default:
        return true;
    }
  }
}

// Authorization middleware
class AuthorizationMiddleware {
  constructor(private readonly authService: AuthorizationService) {}

  requirePermission(resource: string, action: string) {
    return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const context: AuthorizationContext = {
        userId: req.user.id,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        resourceOwnerId: req.params.userId || req.body.userId,
      };

      const hasPermission = await this.authService.hasPermission(
        req.user,
        resource,
        action,
        context,
      );

      if (!hasPermission) {
        return res.status(403).json({
          error: 'Forbidden',
          message: `Insufficient permissions for ${action} on ${resource}`,
          timestamp: new Date().toISOString(),
        });
      }

      next();
    };
  }
}
```

### Session Security & JWT Management

```typescript
// ✅ Secure session management with JWT
import Redis from 'ioredis';
import jwt from 'jsonwebtoken';

interface JWTPayload {
  userId: string;
  sessionId: string;
  roles: string[];
  iat: number;
  exp: number;
}

class SessionService {
  constructor(
    private readonly redis: Redis,
    private readonly jwtSecret: string,
    private readonly refreshTokenSecret: string,
  ) {}

  async createSession(user: User, deviceInfo: DeviceInfo): Promise<SessionTokens> {
    const sessionId = this.generateSessionId();
    const now = Date.now();

    // Create JWT with short expiry
    const accessToken = jwt.sign(
      {
        userId: user.id,
        sessionId,
        roles: user.roles.map(r => r.name),
        iat: Math.floor(now / 1000),
        exp: Math.floor((now + 15 * 60 * 1000) / 1000), // 15 minutes
      },
      this.jwtSecret,
      { algorithm: 'HS256' },
    );

    // Create refresh token with longer expiry
    const refreshToken = jwt.sign(
      {
        userId: user.id,
        sessionId,
        type: 'refresh',
        iat: Math.floor(now / 1000),
        exp: Math.floor((now + 7 * 24 * 60 * 60 * 1000) / 1000), // 7 days
      },
      this.refreshTokenSecret,
      { algorithm: 'HS256' },
    );

    // Store session metadata in Redis
    await this.redis.setex(
      `session:${sessionId}`,
      7 * 24 * 60 * 60, // 7 days TTL
      JSON.stringify({
        userId: user.id,
        deviceInfo,
        createdAt: now,
        lastActivity: now,
        ipAddress: deviceInfo.ipAddress,
        isActive: true,
      }),
    );

    return { accessToken, refreshToken, expiresIn: 15 * 60 };
  }

  async refreshSession(refreshToken: string): Promise<SessionTokens | null> {
    try {
      const decoded = jwt.verify(refreshToken, this.refreshTokenSecret) as any;

      if (decoded.type !== 'refresh') {
        throw new Error('Invalid refresh token');
      }

      // Check if session still exists and is active
      const sessionData = await this.redis.get(`session:${decoded.sessionId}`);
      if (!sessionData) {
        throw new Error('Session not found');
      }

      const session = JSON.parse(sessionData);
      if (!session.isActive) {
        throw new Error('Session is inactive');
      }

      // Get user data
      const user = await this.userService.findById(decoded.userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Create new access token
      const accessToken = jwt.sign(
        {
          userId: user.id,
          sessionId: decoded.sessionId,
          roles: user.roles.map(r => r.name),
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor((Date.now() + 15 * 60 * 1000) / 1000),
        },
        this.jwtSecret,
      );

      // Update last activity
      session.lastActivity = Date.now();
      await this.redis.setex(
        `session:${decoded.sessionId}`,
        7 * 24 * 60 * 60,
        JSON.stringify(session),
      );

      return {
        accessToken,
        refreshToken, // Keep same refresh token
        expiresIn: 15 * 60,
      };
    } catch (error) {
      return null;
    }
  }

  async revokeSession(sessionId: string): Promise<void> {
    await this.redis.del(`session:${sessionId}`);
  }

  private generateSessionId(): string {
    return crypto.randomBytes(32).toString('hex');
  }
}
```

## 🛡 L5-L6: HARDENED SECURITY

**Scope**: High-value applications, financial systems, sensitive data processing\
**Compliance**: SOX, PCI DSS Level 1, ISO 27001

### Multi-Factor Authentication (MFA)

```typescript
// ✅ Comprehensive MFA implementation
import qrcode from 'qrcode';
import speakeasy from 'speakeasy';

interface MFAConfig {
  isEnabled: boolean;
  methods: MFAMethod[];
  backupCodes: string[];
  lastUsed?: Date;
}

enum MFAMethod {
  TOTP = 'totp',
  SMS = 'sms',
  EMAIL = 'email',
  HARDWARE_KEY = 'hardware_key',
}

class MFAService {
  constructor(
    private readonly userService: UserService,
    private readonly smsService: SMSService,
    private readonly emailService: EmailService,
    private readonly auditLogger: AuditLogger,
  ) {}

  async setupTOTP(userId: string): Promise<TOTPSetupResult> {
    const user = await this.userService.findById(userId);
    if (!user) throw new Error('User not found');

    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `NeonPro (${user.email})`,
      issuer: 'NeonPro',
      length: 32,
    });

    // Generate QR code
    const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url!);

    // Store secret temporarily (until verified)
    await this.redis.setex(
      `mfa_setup:${userId}`,
      300, // 5 minutes
      JSON.stringify({ secret: secret.base32, method: MFAMethod.TOTP }),
    );

    return {
      secret: secret.base32,
      qrCode: qrCodeUrl,
      backupCodes: this.generateBackupCodes(),
    };
  }

  async verifyTOTPSetup(userId: string, token: string): Promise<boolean> {
    const setupData = await this.redis.get(`mfa_setup:${userId}`);
    if (!setupData) throw new Error('MFA setup not found or expired');

    const { secret } = JSON.parse(setupData);

    const verified = speakeasy.totp.verify({
      secret,
      token,
      window: 2, // Allow for slight time drift
    });

    if (verified) {
      // Enable MFA for user
      await this.userService.updateMFAConfig(userId, {
        isEnabled: true,
        methods: [MFAMethod.TOTP],
        secret,
        backupCodes: this.generateBackupCodes(),
      });

      // Clean up setup data
      await this.redis.del(`mfa_setup:${userId}`);

      await this.auditLogger.logSecurityEvent('mfa_enabled', {
        userId,
        method: MFAMethod.TOTP,
        timestamp: new Date(),
      });
    }

    return verified;
  }

  async verifyMFA(userId: string, token: string, method: MFAMethod): Promise<boolean> {
    const user = await this.userService.findByIdWithMFA(userId);
    if (!user || !user.mfaConfig.isEnabled) {
      throw new Error('MFA not enabled for user');
    }

    let verified = false;

    switch (method) {
      case MFAMethod.TOTP:
        verified = speakeasy.totp.verify({
          secret: user.mfaConfig.totpSecret,
          token,
          window: 2,
        });
        break;

      case MFAMethod.SMS:
        verified = await this.verifySMSCode(userId, token);
        break;

      default:
        throw new Error(`Unsupported MFA method: ${method}`);
    }

    // Log MFA attempt
    await this.auditLogger.logSecurityEvent('mfa_verification', {
      userId,
      method,
      success: verified,
      timestamp: new Date(),
      ipAddress: this.getCurrentIP(),
    });

    // Update last used timestamp
    if (verified) {
      await this.userService.updateMFALastUsed(userId, new Date());
    }

    return verified;
  }

  private generateBackupCodes(): string[] {
    const codes: string[] = [];
    for (let i = 0; i < 10; i++) {
      codes.push(
        Math.random().toString(36).substring(2, 8).toUpperCase(),
      );
    }
    return codes;
  }
}
```

### Encryption at Rest & Transit

```typescript
// ✅ Advanced encryption service
import crypto from 'crypto';
import { promisify } from 'util';

interface EncryptionConfig {
  algorithm: string;
  keyVersion: string;
  keyDerivation: {
    algorithm: string;
    iterations: number;
    saltLength: number;
  };
}

class AdvancedEncryptionService {
  private readonly configs = new Map<string, EncryptionConfig>();
  private readonly keys = new Map<string, Buffer>();

  constructor(private readonly keyManagementService: KeyManagementService) {
    this.initializeConfigs();
  }

  private initializeConfigs(): void {
    // Current production config
    this.configs.set('v3', {
      algorithm: 'aes-256-gcm',
      keyVersion: 'v3',
      keyDerivation: {
        algorithm: 'pbkdf2',
        iterations: 100000,
        saltLength: 32,
      },
    });

    // Legacy config for backward compatibility
    this.configs.set('v2', {
      algorithm: 'aes-256-cbc',
      keyVersion: 'v2',
      keyDerivation: {
        algorithm: 'pbkdf2',
        iterations: 50000,
        saltLength: 16,
      },
    });
  }

  async encryptSensitiveData(
    data: any,
    context: EncryptionContext,
  ): Promise<EncryptedData> {
    const config = this.configs.get('v3')!;
    const masterKey = await this.keyManagementService.getKey(config.keyVersion);

    // Serialize data
    const plaintext = JSON.stringify(data);
    const plaintextBuffer = Buffer.from(plaintext, 'utf8');

    // Generate salt and derive key
    const salt = crypto.randomBytes(config.keyDerivation.saltLength);
    const derivedKey = await this.deriveKey(masterKey, salt, config);

    // Generate IV
    const iv = crypto.randomBytes(16);

    // Encrypt data
    const cipher = crypto.createCipher(config.algorithm, derivedKey);
    cipher.setAAD(Buffer.from(context.additionalData || ''));

    const encrypted = Buffer.concat([
      cipher.update(plaintextBuffer),
      cipher.final(),
    ]);

    const authTag = cipher.getAuthTag();

    // Create result with metadata
    const result: EncryptedData = {
      data: encrypted.toString('base64'),
      salt: salt.toString('base64'),
      iv: iv.toString('base64'),
      authTag: authTag.toString('base64'),
      algorithm: config.algorithm,
      keyVersion: config.keyVersion,
      timestamp: new Date(),
      context: context.type,
    };

    // Audit encryption operation
    await this.auditLogger.logDataEncryption({
      context: context.type,
      keyVersion: config.keyVersion,
      dataSize: plaintextBuffer.length,
      timestamp: new Date(),
    });

    return result;
  }

  async decryptSensitiveData<T>(encryptedData: EncryptedData): Promise<T> {
    const config = this.configs.get(encryptedData.keyVersion);
    if (!config) {
      throw new Error(`Unsupported key version: ${encryptedData.keyVersion}`);
    }

    const masterKey = await this.keyManagementService.getKey(encryptedData.keyVersion);
    const salt = Buffer.from(encryptedData.salt, 'base64');
    const derivedKey = await this.deriveKey(masterKey, salt, config);

    // Prepare decryption
    const iv = Buffer.from(encryptedData.iv, 'base64');
    const authTag = Buffer.from(encryptedData.authTag, 'base64');
    const encrypted = Buffer.from(encryptedData.data, 'base64');

    // Decrypt data
    const decipher = crypto.createDecipher(config.algorithm, derivedKey);
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]);

    // Parse result
    const plaintext = decrypted.toString('utf8');
    return JSON.parse(plaintext);
  }

  private async deriveKey(
    masterKey: Buffer,
    salt: Buffer,
    config: EncryptionConfig,
  ): Promise<Buffer> {
    const pbkdf2 = promisify(crypto.pbkdf2);
    return await pbkdf2(
      masterKey,
      salt,
      config.keyDerivation.iterations,
      32, // 256-bit key
      'sha256',
    );
  }
}

// Database field encryption
class EncryptedField {
  constructor(
    private readonly encryptionService: AdvancedEncryptionService,
    private readonly fieldName: string,
  ) {}

  async encrypt(value: any, entityId: string): Promise<string> {
    if (value === null || value === undefined) return value;

    const encrypted = await this.encryptionService.encryptSensitiveData(value, {
      type: 'database_field',
      entityId,
      fieldName: this.fieldName,
      additionalData: `${entityId}:${this.fieldName}`,
    });

    return JSON.stringify(encrypted);
  }

  async decrypt<T>(encryptedValue: string): Promise<T> {
    if (!encryptedValue) return encryptedValue as T;

    const encryptedData = JSON.parse(encryptedValue);
    return await this.encryptionService.decryptSensitiveData<T>(encryptedData);
  }
}
```

## 🏢 L7-L8: ENTERPRISE SECURITY

**Scope**: Mission-critical enterprise systems, regulated industries\
**Compliance**: ISO 27001, NIST Cybersecurity Framework, SOX compliance

### Zero-Trust Architecture

```typescript
// ✅ Zero-trust security implementation
interface TrustScore {
  overall: number;
  factors: {
    deviceTrust: number;
    behaviorTrust: number;
    locationTrust: number;
    timeTrust: number;
  };
  timestamp: Date;
}

interface SecurityContext {
  user: User;
  device: DeviceFingerprint;
  location: GeoLocation;
  networkInfo: NetworkInfo;
  behaviorProfile: BehaviorProfile;
  threatIntelligence: ThreatData;
}

class ZeroTrustEngine {
  constructor(
    private readonly mlRiskEngine: MLRiskAssessmentEngine,
    private readonly deviceTrustService: DeviceTrustService,
    private readonly behaviorAnalyzer: BehaviorAnalyzer,
    private readonly threatIntelligence: ThreatIntelligenceService,
    private readonly auditLogger: AuditLogger,
  ) {}

  async evaluateAccess(
    request: AccessRequest,
    context: SecurityContext,
  ): Promise<AccessDecision> {
    // Continuous verification - never trust, always verify
    const trustScore = await this.calculateTrustScore(context);
    const riskAssessment = await this.assessRisk(request, context);

    // Determine access decision
    const decision = this.makeAccessDecision(
      request,
      trustScore,
      riskAssessment,
      context,
    );

    // Log decision with full context
    await this.auditLogger.logAccessDecision({
      userId: context.user.id,
      resource: request.resource,
      action: request.action,
      decision: decision.granted ? 'ALLOW' : 'DENY',
      trustScore: trustScore.overall,
      riskLevel: riskAssessment.level,
      additionalControls: decision.additionalControls,
      timestamp: new Date(),
      context: this.sanitizeContextForAudit(context),
    });

    return decision;
  }

  private async calculateTrustScore(context: SecurityContext): Promise<TrustScore> {
    const [deviceTrust, behaviorTrust, locationTrust, timeTrust] = await Promise.all([
      this.deviceTrustService.evaluateDevice(context.device),
      this.behaviorAnalyzer.analyzeBehavior(context.user.id, context.behaviorProfile),
      this.evaluateLocationTrust(context.location, context.user),
      this.evaluateTimeTrust(context.user),
    ]);

    // Weighted trust calculation
    const overall = deviceTrust * 0.3
      + behaviorTrust * 0.3
      + locationTrust * 0.2
      + timeTrust * 0.2;

    return {
      overall,
      factors: { deviceTrust, behaviorTrust, locationTrust, timeTrust },
      timestamp: new Date(),
    };
  }

  private async assessRisk(
    request: AccessRequest,
    context: SecurityContext,
  ): Promise<RiskAssessment> {
    // ML-based risk assessment
    const mlRisk = await this.mlRiskEngine.assessRisk({
      user: context.user,
      resource: request.resource,
      action: request.action,
      device: context.device,
      location: context.location,
      timeOfDay: new Date().getHours(),
      previousBehavior: context.behaviorProfile,
    });

    // Threat intelligence correlation
    const threatRisk = await this.threatIntelligence.evaluateThreats({
      ipAddress: context.networkInfo.ipAddress,
      userAgent: context.device.userAgent,
      geolocation: context.location,
    });

    // Resource sensitivity analysis
    const resourceRisk = await this.evaluateResourceRisk(request.resource);

    // Combined risk score
    const overallRisk = Math.max(mlRisk.score, threatRisk.score, resourceRisk.score);

    return {
      level: this.categorizeRisk(overallRisk),
      score: overallRisk,
      factors: {
        mlRisk: mlRisk.score,
        threatRisk: threatRisk.score,
        resourceRisk: resourceRisk.score,
      },
      indicators: [
        ...mlRisk.indicators,
        ...threatRisk.indicators,
        ...resourceRisk.indicators,
      ],
    };
  }

  private makeAccessDecision(
    request: AccessRequest,
    trustScore: TrustScore,
    riskAssessment: RiskAssessment,
    context: SecurityContext,
  ): AccessDecision {
    const baseDecision = trustScore.overall > 0.7 && riskAssessment.score < 0.5;

    // Additional controls based on risk level
    const additionalControls: AdditionalControl[] = [];

    if (riskAssessment.level === 'HIGH' || trustScore.overall < 0.5) {
      additionalControls.push({
        type: 'step_up_authentication',
        requirements: ['mfa_verification'],
      });
    }

    if (riskAssessment.level === 'CRITICAL' || trustScore.overall < 0.3) {
      additionalControls.push({
        type: 'admin_approval',
        requirements: ['security_team_approval'],
      });
    }

    // Sensitive resource additional controls
    if (this.isSensitiveResource(request.resource)) {
      additionalControls.push({
        type: 'session_recording',
        requirements: ['audit_trail', 'screen_recording'],
      });
    }

    return {
      granted: baseDecision,
      additionalControls,
      sessionDuration: this.calculateSessionDuration(trustScore, riskAssessment),
      requiresRevalidation: riskAssessment.level !== 'LOW',
    };
  }
}
```

### Security Automation & Orchestration

```typescript
// ✅ Security orchestration platform
interface SecurityIncident {
  id: string;
  type: IncidentType;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: IncidentStatus;
  artifacts: SecurityArtifact[];
  timeline: IncidentEvent[];
  affectedSystems: string[];
  indicators: IOC[];
}

class SecurityOrchestrationEngine {
  constructor(
    private readonly threatDetection: ThreatDetectionEngine,
    private readonly incidentResponse: IncidentResponseSystem,
    private readonly forensics: DigitalForensicsService,
    private readonly communication: SecurityCommunicationService,
    private readonly remediation: AutoRemediationEngine,
  ) {}

  async handleSecurityEvent(event: SecurityEvent): Promise<void> {
    // Enrich event with threat intelligence
    const enrichedEvent = await this.enrichEvent(event);

    // Classify and prioritize
    const classification = await this.classifyThreat(enrichedEvent);

    // Create incident if threshold exceeded
    if (classification.severity !== 'LOW') {
      const incident = await this.createIncident(enrichedEvent, classification);

      // Start automated response playbook
      await this.executeResponsePlaybook(incident);
    }
  }

  private async executeResponsePlaybook(incident: SecurityIncident): Promise<void> {
    const playbook = await this.getPlaybook(incident.type, incident.severity);

    for (const step of playbook.steps) {
      try {
        await this.executePlaybookStep(step, incident);

        // Update incident timeline
        incident.timeline.push({
          timestamp: new Date(),
          action: step.action,
          status: 'completed',
          details: step.description,
        });
      } catch (error) {
        // Log failure and continue with next step
        incident.timeline.push({
          timestamp: new Date(),
          action: step.action,
          status: 'failed',
          error: error.message,
        });

        // Escalate if critical step fails
        if (step.isCritical) {
          await this.escalateIncident(incident);
        }
      }
    }
  }

  private async executePlaybookStep(
    step: PlaybookStep,
    incident: SecurityIncident,
  ): Promise<void> {
    switch (step.action) {
      case 'isolate_host':
        await this.remediation.isolateHost(step.targetHost);
        break;

      case 'block_ip':
        await this.remediation.blockIPAddress(step.ipAddress);
        break;

      case 'disable_user':
        await this.remediation.disableUserAccount(step.userId);
        break;

      case 'collect_forensics':
        const evidence = await this.forensics.collectEvidence({
          incidentId: incident.id,
          targets: step.forensicsTargets,
          preserveChainOfCustody: true,
        });
        incident.artifacts.push(...evidence);
        break;

      case 'notify_team':
        await this.communication.notifySecurityTeam({
          incident,
          urgency: this.mapSeverityToUrgency(incident.severity),
          channels: step.notificationChannels,
        });
        break;

      case 'create_ticket':
        await this.communication.createSecurityTicket(incident);
        break;

      default:
        throw new Error(`Unknown playbook action: ${step.action}`);
    }
  }
}

// Threat hunting and detection
class AdvancedThreatHunting {
  constructor(
    private readonly logAnalyzer: LogAnalysisEngine,
    private readonly behaviorAnalyzer: BehaviorAnalysisEngine,
    private readonly mlDetection: MLThreatDetectionEngine,
    private readonly threatIntel: ThreatIntelligenceService,
  ) {}

  async huntThreats(): Promise<ThreatHuntingResult[]> {
    const [
      anomalies,
      behaviorThreats,
      mlThreats,
      intelThreats,
    ] = await Promise.all([
      this.detectAnomalies(),
      this.huntBehaviorThreats(),
      this.mlBasedHunting(),
      this.threatIntelHunting(),
    ]);

    // Correlate findings across engines
    const correlatedThreats = this.correlateThreats([
      ...anomalies,
      ...behaviorThreats,
      ...mlThreats,
      ...intelThreats,
    ]);

    // Score and prioritize
    return correlatedThreats
      .map(threat => this.scoreThreat(threat))
      .sort((a, b) => b.score - a.score);
  }

  private async mlBasedHunting(): Promise<ThreatHuntingResult[]> {
    // Use ML models to detect advanced threats
    const results: ThreatHuntingResult[] = [];

    // Detect APT-style lateral movement
    const lateralMovement = await this.mlDetection.detectLateralMovement({
      timeWindow: 24 * 60 * 60 * 1000, // 24 hours
      minConfidence: 0.8,
    });

    results.push(...lateralMovement.map(lm => ({
      type: 'lateral_movement',
      confidence: lm.confidence,
      indicators: lm.indicators,
      affectedHosts: lm.hosts,
      timeline: lm.timeline,
      severity: this.calculateSeverity(lm),
    })));

    // Detect data exfiltration patterns
    const exfiltration = await this.mlDetection.detectDataExfiltration({
      dataVolumeThreshold: 100 * 1024 * 1024, // 100MB
      unusualHours: true,
    });

    results.push(...exfiltration.map(ex => ({
      type: 'data_exfiltration',
      confidence: ex.confidence,
      dataVolume: ex.volumeBytes,
      destinations: ex.externalDestinations,
      severity: 'CRITICAL' as const,
    })));

    return results;
  }
}
```

## 🏥 L9-L10: CRITICAL SECURITY

**Scope**: Healthcare, financial, life-critical systems\
**Compliance**: HIPAA, ANVISA, CFM, PCI DSS Level 1, FDA 21 CFR Part 11

### Healthcare Compliance (LGPD/ANVISA/CFM)

```typescript
// ✅ Healthcare-specific security implementation
interface HealthcareSecurityContext extends SecurityContext {
  professionalLicense: MedicalLicense;
  patientConsent: ConsentRecord[];
  medicalJustification: string;
  treatmentContext: TreatmentContext;
  regulatoryRequirements: ComplianceRequirement[];
}

class HealthcareSecurityFramework {
  constructor(
    private readonly lgpdCompliance: LGPDComplianceService,
    private readonly anvisaValidator: ANVISAComplianceValidator,
    private readonly cfmValidator: CFMEthicsValidator,
    private readonly auditService: HealthcareAuditService,
    private readonly encryptionService: AdvancedEncryptionService,
  ) {}

  async validateMedicalDataAccess(
    request: MedicalDataAccessRequest,
    context: HealthcareSecurityContext,
  ): Promise<ComplianceValidationResult> {
    // Multi-layered compliance validation
    const [lgpdResult, anvisaResult, cfmResult] = await Promise.all([
      this.lgpdCompliance.validatePatientDataAccess(request, context),
      this.anvisaValidator.validateMedicalProcedureAccess(request, context),
      this.cfmValidator.validateProfessionalEthics(request, context),
    ]);

    // Combine validation results
    const overallCompliance = lgpdResult.isCompliant
      && anvisaResult.isCompliant
      && cfmResult.isCompliant;

    const violations = [
      ...lgpdResult.violations,
      ...anvisaResult.violations,
      ...cfmResult.violations,
    ];

    // Create comprehensive audit trail
    await this.auditService.logComplianceValidation({
      requestId: request.id,
      patientId: request.patientId,
      professionalId: context.professionalLicense.id,
      dataTypes: request.dataTypes,
      purpose: request.purpose,
      lgpdCompliance: lgpdResult,
      anvisaCompliance: anvisaResult,
      cfmCompliance: cfmResult,
      overallResult: overallCompliance,
      timestamp: new Date(),
      ipAddress: context.networkInfo.ipAddress,
      justification: context.medicalJustification,
    });

    if (!overallCompliance) {
      // Alert compliance team for violations
      await this.alertComplianceViolation({
        severity: 'CRITICAL',
        violations,
        context,
        timestamp: new Date(),
      });
    }

    return {
      isCompliant: overallCompliance,
      violations,
      requiredActions: this.generateComplianceActions(violations),
      auditTrailId: await this.createImmutableAuditRecord(request, context),
    };
  }

  async securePatientDataStorage(
    patientData: PatientData,
    storageContext: HealthcareStorageContext,
  ): Promise<SecureStorageResult> {
    // Classify data sensitivity
    const classification = await this.classifyPatientData(patientData);

    // Apply encryption based on sensitivity
    const encryptedData = await this.encryptionService.encryptSensitiveData(
      patientData,
      {
        type: 'patient_medical_record',
        classification: classification.level,
        patientId: patientData.id,
        professionalId: storageContext.professionalId,
        additionalData: this.generateEncryptionAAD(patientData, storageContext),
      },
    );

    // Create immutable storage record
    const storageRecord = await this.createImmutableStorageRecord({
      patientId: patientData.id,
      encryptedData,
      classification,
      storageContext,
      timestamp: new Date(),
      integrity: await this.calculateDataIntegrity(encryptedData),
    });

    // Log to blockchain for immutability
    await this.blockchainAuditService.recordDataStorage({
      recordId: storageRecord.id,
      patientId: patientData.id,
      dataHash: storageRecord.integrity.hash,
      timestamp: new Date(),
      professionalSignature: await this.signWithProfessionalCertificate(
        storageRecord,
        storageContext.professionalId,
      ),
    });

    return {
      storageId: storageRecord.id,
      encryptionKeyVersion: encryptedData.keyVersion,
      integrityHash: storageRecord.integrity.hash,
      complianceFlags: classification.complianceFlags,
    };
  }
}

// Immutable audit trail with blockchain
class BlockchainAuditService {
  constructor(
    private readonly blockchain: PrivateBlockchainClient,
    private readonly digitalSignature: DigitalSignatureService,
  ) {}

  async recordDataAccess(event: DataAccessEvent): Promise<BlockchainRecord> {
    // Create tamper-proof audit record
    const auditRecord = {
      eventType: 'DATA_ACCESS',
      timestamp: new Date().toISOString(),
      patientId: event.patientId,
      professionalId: event.professionalId,
      dataTypes: event.dataTypes,
      purpose: event.purpose,
      ipAddress: this.hashPII(event.ipAddress),
      sessionId: event.sessionId,
      result: event.result,
      hash: '',
    };

    // Calculate record hash
    auditRecord.hash = await this.calculateRecordHash(auditRecord);

    // Sign with healthcare facility certificate
    const signature = await this.digitalSignature.sign(
      auditRecord,
      'healthcare_facility_cert',
    );

    // Submit to blockchain
    const blockchainTx = await this.blockchain.submitTransaction({
      type: 'HEALTHCARE_AUDIT',
      data: auditRecord,
      signature,
      timestamp: new Date(),
    });

    return {
      blockchainTxId: blockchainTx.id,
      blockNumber: blockchainTx.blockNumber,
      recordHash: auditRecord.hash,
      timestamp: new Date(),
    };
  }

  async verifyAuditIntegrity(recordId: string): Promise<IntegrityVerificationResult> {
    const record = await this.blockchain.getTransaction(recordId);
    if (!record) {
      return { isValid: false, error: 'Record not found' };
    }

    // Verify digital signature
    const signatureValid = await this.digitalSignature.verify(
      record.data,
      record.signature,
      'healthcare_facility_cert',
    );

    // Verify hash integrity
    const calculatedHash = await this.calculateRecordHash(record.data);
    const hashValid = calculatedHash === record.data.hash;

    // Verify blockchain integrity
    const blockValid = await this.blockchain.verifyBlockIntegrity(record.blockNumber);

    return {
      isValid: signatureValid && hashValid && blockValid,
      signatureValid,
      hashValid,
      blockValid,
      verificationTimestamp: new Date(),
    };
  }
}
```

### Formal Security Verification

```typescript
// ✅ Mathematical proof of security properties
interface SecurityProperty {
  name: string;
  description: string;
  formalDefinition: string;
  verificationMethod: 'model_checking' | 'theorem_proving' | 'static_analysis';
  proofArtifacts: ProofArtifact[];
}

interface ProofArtifact {
  type: 'coq_proof' | 'tlv_model' | 'z3_smt' | 'cbmc_verification';
  content: string;
  verificationResult: VerificationResult;
}

class FormalSecurityVerification {
  constructor(
    private readonly modelChecker: ModelChecker,
    private readonly theoremProver: TheoremProver,
    private readonly staticAnalyzer: StaticSecurityAnalyzer,
  ) {}

  async verifySecurityProperties(
    system: SecuritySystem,
    properties: SecurityProperty[],
  ): Promise<VerificationReport> {
    const verificationResults: PropertyVerificationResult[] = [];

    for (const property of properties) {
      const result = await this.verifyProperty(system, property);
      verificationResults.push(result);
    }

    const overallSecurity = verificationResults.every(r => r.isValid);

    return {
      overallValid: overallSecurity,
      propertyResults: verificationResults,
      criticalViolations: verificationResults
        .filter(r => !r.isValid && r.severity === 'CRITICAL')
        .map(r => r.violations)
        .flat(),
      recommendations: this.generateSecurityRecommendations(verificationResults),
      timestamp: new Date(),
    };
  }

  private async verifyProperty(
    system: SecuritySystem,
    property: SecurityProperty,
  ): Promise<PropertyVerificationResult> {
    switch (property.verificationMethod) {
      case 'model_checking':
        return await this.verifyWithModelChecking(system, property);
      case 'theorem_proving':
        return await this.verifyWithTheoremProving(system, property);
      case 'static_analysis':
        return await this.verifyWithStaticAnalysis(system, property);
      default:
        throw new Error(`Unsupported verification method: ${property.verificationMethod}`);
    }
  }

  private async verifyWithModelChecking(
    system: SecuritySystem,
    property: SecurityProperty,
  ): Promise<PropertyVerificationResult> {
    // Example: Verify authentication state machine
    const authModel = await this.extractAuthenticationModel(system);

    // TLA+ specification for authentication invariants
    const tlaSpec = `
      ---- MODULE AuthenticationSecurity ----
      EXTENDS TLC, Integers, Sequences
      
      VARIABLES userState, sessionState, mfaState
      
      (* Authentication invariants *)
      AuthenticatedUsersMustHaveValidSession ==
        \\A user \\in DOMAIN userState :
          userState[user] = "authenticated" => 
          sessionState[user] \\neq "expired"
      
      MFARequiredForSensitiveActions ==
        \\A user \\in DOMAIN userState :
          userState[user] = "accessing_sensitive_data" =>
          mfaState[user] = "verified"
      
      SessionTimeoutEnforced ==
        \\A user \\in DOMAIN sessionState :
          sessionState[user] = "expired" =>
          userState[user] \\neq "authenticated"
      
      (* Specification *)
      Init == /\\ userState = [user |-> "unauthenticated"]
              /\\ sessionState = [user |-> "none"]  
              /\\ mfaState = [user |-> "unverified"]
              
      Next == \\/ Login \\/ Logout \\/ AccessData \\/ SessionExpiry
      
      Spec == Init /\\ [][Next]_<<userState, sessionState, mfaState>>
      
      (* Properties to verify *)
      THEOREM Spec => []AuthenticatedUsersMustHaveValidSession
      THEOREM Spec => []MFARequiredForSensitiveActions
      THEOREM Spec => []SessionTimeoutEnforced
      ====
    `;

    const modelCheckResult = await this.modelChecker.verify(authModel, tlaSpec);

    return {
      propertyName: property.name,
      isValid: modelCheckResult.allInvariantsHold,
      violations: modelCheckResult.counterExamples,
      proofArtifacts: [{
        type: 'tlv_model',
        content: tlaSpec,
        verificationResult: modelCheckResult,
      }],
      severity: this.assessSeverity(property, modelCheckResult),
    };
  }

  private async verifyWithTheoremProving(
    system: SecuritySystem,
    property: SecurityProperty,
  ): Promise<PropertyVerificationResult> {
    // Example: Prove cryptographic properties with Coq
    const coqProof = `
      Require Import Coq.Arith.Arith.
      Require Import Coq.Crypto.Util.
      
      (* Define encryption scheme *)
      Definition EncryptionScheme := {|
        KeyGen : unit -> Key * SecretKey;
        Encrypt : Key -> Message -> Ciphertext;
        Decrypt : SecretKey -> Ciphertext -> option Message;
      |}.
      
      (* Define security property: IND-CPA security *)
      Definition IND_CPA_Secure (scheme : EncryptionScheme) : Prop :=
        forall (A : Adversary) (m0 m1 : Message),
        |length m0| = |length m1| ->
        |Pr[A(Encrypt (KeyGen().1) m0) = 1] - Pr[A(Encrypt (KeyGen().1) m1) = 1]| <= negl.
      
      (* Theorem: Our AES-GCM implementation is IND-CPA secure *)
      Theorem AES_GCM_IND_CPA : IND_CPA_Secure AES_GCM_Scheme.
      Proof.
        intros A m0 m1 H_len.
        (* Proof by reduction to AES security *)
        apply AES_IND_CPA_reduction.
        - exact AES_is_secure.
        - exact GCM_auth_security.
        - assumption.
      Qed.
      
      (* Additional security properties *)
      Theorem encryption_correctness : 
        forall (k : Key) (sk : SecretKey) (m : Message),
        (k, sk) = KeyGen tt ->
        Decrypt sk (Encrypt k m) = Some m.
      Proof.
        intros k sk m H_keygen.
        (* Correctness follows from AES-GCM specification *)
        apply AES_GCM_correctness; assumption.
      Qed.
    `;

    const proofResult = await this.theoremProver.verifyProof(coqProof);

    return {
      propertyName: property.name,
      isValid: proofResult.proofValid,
      violations: proofResult.failedLemmas,
      proofArtifacts: [{
        type: 'coq_proof',
        content: coqProof,
        verificationResult: proofResult,
      }],
      severity: proofResult.proofValid ? 'LOW' : 'CRITICAL',
    };
  }
}
```

## 🎯 SECURITY DECISION FRAMEWORK

### Threat Modeling & Risk Assessment

```yaml
threat_modeling:
  methodology: "STRIDE + DREAD + Attack Trees"

  stride_categories:
    spoofing: "Identity verification, certificate validation"
    tampering: "Data integrity, immutable audit trails"
    repudiation: "Digital signatures, non-repudiation"
    information_disclosure: "Encryption, access controls"
    denial_of_service: "Rate limiting, DDoS protection"
    elevation_of_privilege: "RBAC, privilege escalation prevention"

  risk_calculation:
    impact_factors: ["data_sensitivity", "system_criticality", "regulatory_requirements"]
    likelihood_factors: ["threat_actor_capability", "attack_surface", "existing_controls"]

  compliance_mapping:
    healthcare: ["HIPAA", "LGPD", "ANVISA", "CFM"]
    financial: ["PCI_DSS", "SOX", "BASEL_III"]
    general: ["ISO_27001", "NIST_CSF", "GDPR"]
```

### Security Control Selection Matrix

```typescript
// ✅ Automated security control selection
interface SecurityControlMatrix {
  [key: string]: {
    L1_L2: SecurityControl[];
    L3_L4: SecurityControl[];
    L5_L6: SecurityControl[];
    L7_L8: SecurityControl[];
    L9_L10: SecurityControl[];
  };
}

const SECURITY_CONTROLS: SecurityControlMatrix = {
  authentication: {
    L1_L2: ['password_policy', 'session_management'],
    L3_L4: ['mfa_optional', 'oauth2_oidc'],
    L5_L6: ['mfa_required', 'adaptive_authentication'],
    L7_L8: ['zero_trust', 'continuous_authentication'],
    L9_L10: ['biometric_mfa', 'hardware_tokens', 'formal_verification'],
  },

  data_protection: {
    L1_L2: ['https_encryption', 'input_validation'],
    L3_L4: ['field_level_encryption', 'data_classification'],
    L5_L6: ['end_to_end_encryption', 'key_rotation'],
    L7_L8: ['homomorphic_encryption', 'secure_enclaves'],
    L9_L10: ['quantum_resistant_crypto', 'formal_verification'],
  },

  monitoring: {
    L1_L2: ['basic_logging', 'error_tracking'],
    L3_L4: ['security_monitoring', 'anomaly_detection'],
    L5_L6: ['behavior_analytics', 'threat_hunting'],
    L7_L8: ['ml_threat_detection', 'security_orchestration'],
    L9_L10: ['ai_security_ops', 'predictive_threat_modeling'],
  },
};
```

---

**🏛 CONSTITUTIONAL ADHERENCE**: All security measures must maintain constitutional compliance with
VIBECODER principles while providing maximum protection against evolving threats.

**🔄 PROGRESSIVE HARDENING**: Security controls automatically scale with system criticality and
regulatory requirements, providing right-sized protection without over-engineering.
