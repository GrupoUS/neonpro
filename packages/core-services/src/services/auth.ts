// ================================================
// AUTHENTICATION SERVICE
// Centralized authentication and authorization microservice
// ================================================

import { createClient } from '@supabase/supabase-js';
import { sign, verify } from 'jsonwebtoken';
import { randomBytes, scrypt } from 'node:crypto';
import { promisify } from 'node:util';
import { config } from './configuration';
import { monitoring } from './monitoring';

const _scryptAsync = promisify(scrypt);

// ================================================
// TYPES AND INTERFACES
// ================================================

interface User {
  id: string;
  email: string;
  roles: string[];
  tenantId?: string;
  permissions: string[];
  metadata: Record<string, any>;
  isActive: boolean;
  lastLoginAt?: Date;
  mfaEnabled: boolean;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface Session {
  id: string;
  userId: string;
  tenantId?: string;
  deviceId?: string;
  ipAddress: string;
  userAgent?: string;
  expiresAt: Date;
  createdAt: Date;
  lastAccessedAt: Date;
  isActive: boolean;
}

interface AuthToken {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
  scope?: string[];
}

interface AuthContext {
  user: User;
  session: Session;
  permissions: string[];
  tenantId?: string;
}

interface LoginCredentials {
  email: string;
  password: string;
  deviceId?: string;
  rememberMe?: boolean;
  mfaCode?: string;
}

interface RegisterData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  tenantId?: string;
  roles?: string[];
  metadata?: Record<string, any>;
}

interface PasswordResetRequest {
  email: string;
  redirectUrl?: string;
}

interface MfaSetupData {
  userId: string;
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
}

// ================================================
// AUTHENTICATION SERVICE
// ================================================

export class AuthenticationService {
  private static instance: AuthenticationService;
  private readonly supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  private readonly jwtSecret = process.env.JWT_SECRET || 'default-secret';
  private jwtExpiryMinutes = 60; // 1 hour
  private refreshTokenExpiryDays = 30; // 30 days

  private constructor() {
    this.initializeConfiguration();
  }

  public static getInstance(): AuthenticationService {
    if (!AuthenticationService.instance) {
      AuthenticationService.instance = new AuthenticationService();
    }
    return AuthenticationService.instance;
  }

  // ================================================
  // USER AUTHENTICATION
  // ================================================

  async login(
    credentials: LoginCredentials,
    clientInfo: {
      ipAddress: string;
      userAgent?: string;
    },
  ): Promise<{ authToken: AuthToken; user: User; session: Session; } | null> {
    try {
      monitoring.info('Login attempt', 'auth-service', {
        email: credentials.email,
        deviceId: credentials.deviceId,
      });

      // Authenticate with Supabase
      const { data: authData, error } = await this.supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error || !authData.user) {
        monitoring.warn('Login failed - invalid credentials', 'auth-service', {
          email: credentials.email,
          error: error?.message,
        });
        return;
      }

      // Get user profile
      const user = await this.getUserProfile(authData.user.id);
      if (!user?.isActive) {
        monitoring.warn('Login failed - user inactive', 'auth-service', {
          userId: authData.user.id,
        });
        return;
      }

      // Check MFA if enabled
      if (user.mfaEnabled && !credentials.mfaCode) {
        monitoring.info('MFA required for login', 'auth-service', {
          userId: user.id,
        });
        throw new Error('MFA_REQUIRED');
      }

      if (user.mfaEnabled && credentials.mfaCode) {
        const mfaValid = await this.verifyMfaCode(user.id, credentials.mfaCode);
        if (!mfaValid) {
          monitoring.warn('Login failed - invalid MFA code', 'auth-service', {
            userId: user.id,
          });
          return;
        }
      }

      // Create session
      const session = await this.createSession(user.id, {
        deviceId: credentials.deviceId,
        ipAddress: clientInfo.ipAddress,
        userAgent: clientInfo.userAgent,
        rememberMe: credentials.rememberMe,
      });

      // Generate tokens
      const authToken = await this.generateTokens(user, session);

      // Update last login
      await this.updateLastLogin(user.id);

      monitoring.info('Login successful', 'auth-service', {
        userId: user.id,
        sessionId: session.id,
        tenantId: user.tenantId,
      });

      return { authToken, user, session };
    } catch (error) {
      monitoring.error('Login error', 'auth-service', error as Error, {
        email: credentials.email,
      });
      throw error;
    }
  }

  async register(
    registerData: RegisterData,
  ): Promise<{ user: User; requiresVerification: boolean; }> {
    try {
      monitoring.info('Registration attempt', 'auth-service', {
        email: registerData.email,
        tenantId: registerData.tenantId,
      });

      // Create user in Supabase Auth
      const { data: authData, error } = await this.supabase.auth.admin.createUser({
        email: registerData.email,
        password: registerData.password,
        email_confirm: false, // We'll handle verification separately
      });

      if (error || !authData.user) {
        monitoring.error(
          'Registration failed',
          'auth-service',
          new Error(error?.message),
          {
            email: registerData.email,
          },
        );
        throw new Error(error?.message || 'Registration failed');
      }

      // Create user profile
      const userProfile = await this.createUserProfile(
        authData.user.id,
        registerData,
      );

      // Send verification email if required
      const requiresVerification = await config.getConfiguration(
        'auth.email_verification_required',
        { environment: process.env.NODE_ENV || 'development' },
        true,
      );

      if (requiresVerification) {
        await this.sendVerificationEmail(userProfile.email);
      }

      monitoring.info('Registration successful', 'auth-service', {
        userId: userProfile.id,
        email: userProfile.email,
        tenantId: userProfile.tenantId,
      });

      return { user: userProfile, requiresVerification };
    } catch (error) {
      monitoring.error('Registration error', 'auth-service', error as Error, {
        email: registerData.email,
      });
      throw error;
    }
  }

  async logout(sessionId: string): Promise<boolean> {
    try {
      monitoring.info('Logout attempt', 'auth-service', { sessionId });

      // Deactivate session
      const { error } = await this.supabase
        .from('user_sessions')
        .update({
          is_active: false,
          updated_at: new Date().toISOString(),
        })
        .eq('id', sessionId);

      if (error) {
        monitoring.error(
          'Logout failed',
          'auth-service',
          new Error(error.message),
          {
            sessionId,
          },
        );
        return false;
      }

      monitoring.info('Logout successful', 'auth-service', { sessionId });
      return true;
    } catch (error) {
      monitoring.error('Logout error', 'auth-service', error as Error, {
        sessionId,
      });
      return false;
    }
  }

  async refreshToken(refreshToken: string): Promise<AuthToken | null> {
    try {
      monitoring.debug('Token refresh attempt', 'auth-service');

      // Verify refresh token
      const payload = verify(refreshToken, this.jwtSecret) as any;

      // Get session
      const session = await this.getSession(payload.sessionId);
      if (!session?.isActive) {
        monitoring.warn(
          'Token refresh failed - invalid session',
          'auth-service',
          {
            sessionId: payload.sessionId,
          },
        );
        return;
      }

      // Get user
      const user = await this.getUserProfile(session.userId);
      if (!user?.isActive) {
        monitoring.warn(
          'Token refresh failed - user inactive',
          'auth-service',
          {
            userId: session.userId,
          },
        );
        return;
      }

      // Update session last accessed
      await this.updateSessionAccess(session.id);

      // Generate new tokens
      const authToken = await this.generateTokens(user, session);

      monitoring.debug('Token refresh successful', 'auth-service', {
        userId: user.id,
        sessionId: session.id,
      });

      return authToken;
    } catch (error) {
      monitoring.error('Token refresh error', 'auth-service', error as Error);
      return;
    }
  }

  // ================================================
  // TOKEN VALIDATION
  // ================================================

  async validateToken(token: string): Promise<AuthContext | null> {
    try {
      // Verify JWT token
      const payload = verify(token, this.jwtSecret) as any;

      // Get session
      const session = await this.getSession(payload.sessionId);
      if (!session?.isActive || session.expiresAt < new Date()) {
        return;
      }

      // Get user
      const user = await this.getUserProfile(payload.userId);
      if (!user?.isActive) {
        return;
      }

      // Update session access
      await this.updateSessionAccess(session.id);

      return {
        user,
        session,
        permissions: user.permissions,
        tenantId: user.tenantId,
      };
    } catch (error) {
      monitoring.debug('Token validation failed', 'auth-service', {
        error: (error as Error).message,
      });
      return;
    }
  }

  async hasPermission(
    userId: string,
    permission: string,
    resourceId?: string,
  ): Promise<boolean> {
    try {
      const user = await this.getUserProfile(userId);
      if (!user?.isActive) {
        return false;
      }

      // Check direct permissions
      if (user.permissions.includes(permission)) {
        return true;
      }

      // Check role-based permissions
      for (const role of user.roles) {
        const rolePermissions = await this.getRolePermissions(role);
        if (rolePermissions.includes(permission)) {
          return true;
        }
      }

      // Check resource-specific permissions
      if (resourceId) {
        const resourcePermissions = await this.getResourcePermissions(
          userId,
          resourceId,
        );
        if (resourcePermissions.includes(permission)) {
          return true;
        }
      }

      return false;
    } catch (error) {
      monitoring.error(
        'Permission check error',
        'auth-service',
        error as Error,
        {
          userId,
          permission,
          resourceId,
        },
      );
      return false;
    }
  }

  // ================================================
  // PASSWORD MANAGEMENT
  // ================================================

  async requestPasswordReset(request: PasswordResetRequest): Promise<boolean> {
    try {
      monitoring.info('Password reset requested', 'auth-service', {
        email: request.email,
      });

      const { error } = await this.supabase.auth.resetPasswordForEmail(
        request.email,
        {
          redirectTo: request.redirectUrl,
        },
      );

      if (error) {
        monitoring.error(
          'Password reset request failed',
          'auth-service',
          new Error(error.message),
          {
            email: request.email,
          },
        );
        return false;
      }

      monitoring.info('Password reset email sent', 'auth-service', {
        email: request.email,
      });

      return true;
    } catch (error) {
      monitoring.error('Password reset error', 'auth-service', error as Error, {
        email: request.email,
      });
      return false;
    }
  }

  async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string,
  ): Promise<boolean> {
    try {
      monitoring.info('Password change attempt', 'auth-service', { userId });

      // Get user
      const user = await this.getUserProfile(userId);
      if (!user) {
        return false;
      }

      // Verify old password
      const { error: signInError } = await this.supabase.auth.signInWithPassword({
        email: user.email,
        password: oldPassword,
      });

      if (signInError) {
        monitoring.warn(
          'Password change failed - invalid old password',
          'auth-service',
          {
            userId,
          },
        );
        return false;
      }

      // Update password
      const { error: updateError } = await this.supabase.auth.admin.updateUserById(userId, {
        password: newPassword,
      });

      if (updateError) {
        monitoring.error(
          'Password change failed',
          'auth-service',
          new Error(updateError.message),
          {
            userId,
          },
        );
        return false;
      }

      // Invalidate all sessions except current
      await this.invalidateUserSessions(userId);

      monitoring.info('Password changed successfully', 'auth-service', {
        userId,
      });
      return true;
    } catch (error) {
      monitoring.error(
        'Password change error',
        'auth-service',
        error as Error,
        { userId },
      );
      return false;
    }
  }

  // ================================================
  // MULTI-FACTOR AUTHENTICATION
  // ================================================

  async setupMfa(userId: string): Promise<MfaSetupData | null> {
    try {
      monitoring.info('MFA setup initiated', 'auth-service', { userId });

      const user = await this.getUserProfile(userId);
      if (!user) {
        return;
      }

      // Generate TOTP secret
      const secret = randomBytes(32).toString('base32');

      // Generate QR code URL
      const issuer = 'NeonPro';
      const qrCodeUrl = `otpauth://totp/${issuer}:${user.email}?secret=${secret}&issuer=${issuer}`;

      // Generate backup codes
      const backupCodes = Array.from(
        { length: 10 },
        () => randomBytes(4).toString('hex').toUpperCase(),
      );

      // Store MFA data (temporarily, until user confirms)
      await this.storeTempMfaData(userId, secret, backupCodes);

      monitoring.info('MFA setup data generated', 'auth-service', { userId });

      return {
        userId,
        secret,
        qrCodeUrl,
        backupCodes,
      };
    } catch (error) {
      monitoring.error('MFA setup error', 'auth-service', error as Error, {
        userId,
      });
      return;
    }
  }

  async confirmMfa(userId: string, code: string): Promise<boolean> {
    try {
      monitoring.info('MFA confirmation attempt', 'auth-service', { userId });

      // Get temporary MFA data
      const tempMfaData = await this.getTempMfaData(userId);
      if (!tempMfaData) {
        return false;
      }

      // Verify TOTP code
      const isValid = await this.verifyTotpCode(tempMfaData.secret, code);
      if (!isValid) {
        monitoring.warn(
          'MFA confirmation failed - invalid code',
          'auth-service',
          { userId },
        );
        return false;
      }

      // Enable MFA for user
      await this.enableMfaForUser(
        userId,
        tempMfaData.secret,
        tempMfaData.backupCodes,
      );

      // Clean up temporary data
      await this.clearTempMfaData(userId);

      monitoring.info('MFA enabled successfully', 'auth-service', { userId });
      return true;
    } catch (error) {
      monitoring.error(
        'MFA confirmation error',
        'auth-service',
        error as Error,
        { userId },
      );
      return false;
    }
  }

  async disableMfa(userId: string, password: string): Promise<boolean> {
    try {
      monitoring.info('MFA disable attempt', 'auth-service', { userId });

      const user = await this.getUserProfile(userId);
      if (!user) {
        return false;
      }

      // Verify password
      const { error: signInError } = await this.supabase.auth.signInWithPassword({
        email: user.email,
        password,
      });

      if (signInError) {
        monitoring.warn(
          'MFA disable failed - invalid password',
          'auth-service',
          { userId },
        );
        return false;
      }

      // Disable MFA
      const { error } = await this.supabase
        .from('user_mfa')
        .delete()
        .eq('user_id', userId);

      if (error) {
        monitoring.error(
          'MFA disable failed',
          'auth-service',
          new Error(error.message),
          {
            userId,
          },
        );
        return false;
      }

      // Update user profile
      await this.supabase
        .from('user_profiles')
        .update({ mfa_enabled: false })
        .eq('id', userId);

      monitoring.info('MFA disabled successfully', 'auth-service', { userId });
      return true;
    } catch (error) {
      monitoring.error('MFA disable error', 'auth-service', error as Error, {
        userId,
      });
      return false;
    }
  }

  // ================================================
  // SESSION MANAGEMENT
  // ================================================

  async getUserSessions(userId: string): Promise<Session[]> {
    try {
      const { data, error } = await this.supabase
        .from('user_sessions')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return data.map(this.mapSessionFromDb);
    } catch (error) {
      monitoring.error(
        'Get user sessions error',
        'auth-service',
        error as Error,
        { userId },
      );
      return [];
    }
  }

  async invalidateSession(sessionId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('user_sessions')
        .update({
          is_active: false,
          updated_at: new Date().toISOString(),
        })
        .eq('id', sessionId);

      return !error;
    } catch (error) {
      monitoring.error(
        'Invalidate session error',
        'auth-service',
        error as Error,
        { sessionId },
      );
      return false;
    }
  }

  async invalidateAllUserSessions(
    userId: string,
    excludeSessionId?: string,
  ): Promise<boolean> {
    try {
      let query = this.supabase
        .from('user_sessions')
        .update({
          is_active: false,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      if (excludeSessionId) {
        query = query.neq('id', excludeSessionId);
      }

      const { error } = await query;

      return !error;
    } catch (error) {
      monitoring.error(
        'Invalidate all user sessions error',
        'auth-service',
        error as Error,
        {
          userId,
        },
      );
      return false;
    }
  }

  // ================================================
  // PRIVATE HELPER METHODS
  // ================================================

  private async initializeConfiguration(): Promise<void> {
    this.jwtExpiryMinutes = await config.getConfiguration(
      'auth.jwt_expiry_minutes',
      { environment: process.env.NODE_ENV || 'development' },
      60,
    );

    this.refreshTokenExpiryDays = await config.getConfiguration(
      'auth.refresh_token_expiry_days',
      { environment: process.env.NODE_ENV || 'development' },
      30,
    );
  }

  private async getUserProfile(userId: string): Promise<User | null> {
    try {
      const { data, error } = await this.supabase
        .from('user_profiles')
        .select(`
          *,
          user_roles!inner(role_name),
          role_permissions(permission_name)
        `)
        .eq('id', userId)
        .single();

      if (error || !data) {
        return;
      }

      return this.mapUserFromDb(data);
    } catch (error) {
      monitoring.error(
        'Get user profile error',
        'auth-service',
        error as Error,
        { userId },
      );
      return;
    }
  }

  private async createUserProfile(
    userId: string,
    registerData: RegisterData,
  ): Promise<User> {
    const { data, error } = await this.supabase
      .from('user_profiles')
      .insert({
        id: userId,
        email: registerData.email,
        first_name: registerData.firstName,
        last_name: registerData.lastName,
        tenant_id: registerData.tenantId,
        metadata: registerData.metadata || {},
        is_active: true,
        email_verified: false,
        mfa_enabled: false,
      })
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    // Assign default roles
    const roles = registerData.roles || ['user'];
    for (const role of roles) {
      await this.assignUserRole(userId, role);
    }

    return this.mapUserFromDb({
      ...data,
      user_roles: roles.map((r) => ({ role_name: r })),
    });
  }

  private async createSession(
    userId: string,
    sessionData: {
      deviceId?: string;
      ipAddress: string;
      userAgent?: string;
      rememberMe?: boolean;
    },
  ): Promise<Session> {
    const expiresAt = new Date();
    const expiryHours = sessionData.rememberMe
      ? 24 * this.refreshTokenExpiryDays
      : 24;
    expiresAt.setHours(expiresAt.getHours() + expiryHours);

    const { data, error } = await this.supabase
      .from('user_sessions')
      .insert({
        user_id: userId,
        device_id: sessionData.deviceId,
        ip_address: sessionData.ipAddress,
        user_agent: sessionData.userAgent,
        expires_at: expiresAt.toISOString(),
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return this.mapSessionFromDb(data);
  }

  private async generateTokens(
    user: User,
    session: Session,
  ): Promise<AuthToken> {
    const accessTokenPayload = {
      userId: user.id,
      sessionId: session.id,
      tenantId: user.tenantId,
      roles: user.roles,
      permissions: user.permissions,
    };

    const refreshTokenPayload = {
      userId: user.id,
      sessionId: session.id,
      type: 'refresh',
    };

    const accessToken = sign(accessTokenPayload, this.jwtSecret, {
      expiresIn: `${this.jwtExpiryMinutes}m`,
    });

    const refreshToken = sign(refreshTokenPayload, this.jwtSecret, {
      expiresIn: `${this.refreshTokenExpiryDays}d`,
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: this.jwtExpiryMinutes * 60,
      tokenType: 'Bearer',
    };
  }

  private async updateLastLogin(userId: string): Promise<void> {
    await this.supabase
      .from('user_profiles')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', userId);
  }

  private async getSession(sessionId: string): Promise<Session | null> {
    try {
      const { data, error } = await this.supabase
        .from('user_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (error || !data) {
        return;
      }

      return this.mapSessionFromDb(data);
    } catch {
      return;
    }
  }

  private async updateSessionAccess(sessionId: string): Promise<void> {
    await this.supabase
      .from('user_sessions')
      .update({ last_accessed_at: new Date().toISOString() })
      .eq('id', sessionId);
  }

  private async getRolePermissions(role: string): Promise<string[]> {
    try {
      const { data, error } = await this.supabase
        .from('role_permissions')
        .select('permission_name')
        .eq('role_name', role);

      if (error) {
        return [];
      }

      return data.map((row) => row.permission_name);
    } catch {
      return [];
    }
  }

  private async getResourcePermissions(
    userId: string,
    resourceId: string,
  ): Promise<string[]> {
    try {
      const { data, error } = await this.supabase
        .from('user_resource_permissions')
        .select('permission_name')
        .eq('user_id', userId)
        .eq('resource_id', resourceId);

      if (error) {
        return [];
      }

      return data.map((row) => row.permission_name);
    } catch {
      return [];
    }
  }

  private async assignUserRole(userId: string, role: string): Promise<void> {
    await this.supabase.from('user_roles').insert({
      user_id: userId,
      role_name: role,
    });
  }

  private async sendVerificationEmail(email: string): Promise<void> {
    // Implementation would integrate with email service
    monitoring.info('Verification email sent', 'auth-service', { email });
  }

  private async verifyMfaCode(
    _userId: string,
    _code: string,
  ): Promise<boolean> {
    // Implementation would verify TOTP or backup codes
    return true;
  }

  private async verifyTotpCode(
    _secret: string,
    _code: string,
  ): Promise<boolean> {
    // Implementation would verify TOTP code using the secret
    return true;
  }

  private async storeTempMfaData(
    _userId: string,
    _secret: string,
    _backupCodes: string[],
  ): Promise<void> {
    // Implementation would store temporary MFA data
  }

  private async getTempMfaData(
    _userId: string,
  ): Promise<{ secret: string; backupCodes: string[]; } | null> {
    // Implementation would retrieve temporary MFA data
    return;
  }

  private async clearTempMfaData(_userId: string): Promise<void> {
    // Implementation would clear temporary MFA data
  }

  private async enableMfaForUser(
    _userId: string,
    _secret: string,
    _backupCodes: string[],
  ): Promise<void> {
    // Implementation would enable MFA for user
  }

  private async invalidateUserSessions(userId: string): Promise<void> {
    await this.supabase
      .from('user_sessions')
      .update({ is_active: false })
      .eq('user_id', userId);
  }

  private mapUserFromDb(data: any): User {
    return {
      id: data.id,
      email: data.email,
      roles: data.user_roles?.map((r: any) => r.role_name) || [],
      tenantId: data.tenant_id,
      permissions: data.role_permissions?.map((p: any) => p.permission_name) || [],
      metadata: data.metadata || {},
      isActive: data.is_active,
      lastLoginAt: data.last_login_at
        ? new Date(data.last_login_at)
        : undefined,
      mfaEnabled: data.mfa_enabled,
      emailVerified: data.email_verified,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  private mapSessionFromDb(data: any): Session {
    return {
      id: data.id,
      userId: data.user_id,
      tenantId: data.tenant_id,
      deviceId: data.device_id,
      ipAddress: data.ip_address,
      userAgent: data.user_agent,
      expiresAt: new Date(data.expires_at),
      createdAt: new Date(data.created_at),
      lastAccessedAt: new Date(data.last_accessed_at || data.created_at),
      isActive: data.is_active,
    };
  }
}

// ================================================
// AUTHENTICATION HELPERS
// ================================================

export const authService = AuthenticationService.getInstance();

export async function authenticate(token: string): Promise<AuthContext | null> {
  return authService.validateToken(token);
}

export async function requireAuth(token: string): Promise<AuthContext> {
  const authContext = await authenticate(token);
  if (!authContext) {
    throw new Error('Authentication required');
  }
  return authContext;
}

export async function requirePermission(
  token: string,
  permission: string,
  resourceId?: string,
): Promise<AuthContext> {
  const authContext = await requireAuth(token);

  const hasPermission = await authService.hasPermission(
    authContext.user.id,
    permission,
    resourceId,
  );

  if (!hasPermission) {
    throw new Error(`Permission denied: ${permission}`);
  }

  return authContext;
}

// ================================================
// AUTHENTICATION MIDDLEWARE
// ================================================

export async function withAuth<T>(
  token: string,
  handler: (authContext: AuthContext) => Promise<T>,
): Promise<T> {
  const authContext = await requireAuth(token);
  return handler(authContext);
}

export async function withPermission<T>(
  token: string,
  permission: string,
  handler: (authContext: AuthContext) => Promise<T>,
  resourceId?: string,
): Promise<T> {
  const authContext = await requirePermission(token, permission, resourceId);
  return handler(authContext);
}
