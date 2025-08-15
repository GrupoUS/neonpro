import crypto from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import type { AuditLogger } from '../../audit/audit-logger';
import type { EncryptionService } from '../../security/encryption-service';
import type { LGPDManager } from '../../security/lgpd-manager';

// Types and Interfaces
export interface PortalAuthConfig {
  sessionDuration: number; // em minutos
  maxConcurrentSessions: number;
  requireTwoFactor: boolean;
  allowedIpRanges?: string[];
  sessionInactivityTimeout: number; // em minutos
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
  };
}

export interface PortalSession {
  id: string;
  patientId: string;
  sessionToken: string;
  expiresAt: Date;
  lastActivity: Date;
  ipAddress: string;
  userAgent: string;
  isActive: boolean;
  deviceFingerprint?: string;
}

export interface AuthResult {
  success: boolean;
  session?: PortalSession;
  patient?: {
    id: string;
    name: string;
    email: string;
    phone: string;
    clinicId: string;
  };
  error?: string;
  requiresTwoFactor?: boolean;
  twoFactorToken?: string;
}

export interface TwoFactorConfig {
  method: 'sms' | 'email' | 'app';
  secret?: string;
  backupCodes?: string[];
  isEnabled: boolean;
}

export interface LoginAttempt {
  id: string;
  patientId?: string;
  email: string;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  failureReason?: string;
  timestamp: Date;
  blocked: boolean;
}

export interface SecurityEvent {
  type:
    | 'login'
    | 'logout'
    | 'session_expired'
    | 'suspicious_activity'
    | 'password_change';
  patientId: string;
  sessionId?: string;
  ipAddress: string;
  userAgent: string;
  details: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
}

/**
 * Gerenciador de autenticação específico para o portal do paciente
 * Implementa autenticação segura, gestão de sessões e compliance LGPD
 */
export class PortalAuthManager {
  private supabase: any;
  private auditLogger: AuditLogger;
  private config: PortalAuthConfig;
  private activeSessions: Map<string, PortalSession> = new Map();
  private loginAttempts: Map<string, LoginAttempt[]> = new Map();
  private blockedIps: Set<string> = new Set();

  constructor(
    supabaseUrl: string,
    supabaseKey: string,
    auditLogger: AuditLogger,
    encryptionService: EncryptionService,
    lgpdManager: LGPDManager,
    config?: Partial<PortalAuthConfig>
  ) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.auditLogger = auditLogger;
    this.encryptionService = encryptionService;
    this.lgpdManager = lgpdManager;

    this.config = {
      sessionDuration: 480, // 8 horas
      maxConcurrentSessions: 3,
      requireTwoFactor: false,
      sessionInactivityTimeout: 30, // 30 minutos
      passwordPolicy: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true,
      },
      ...config,
    };

    // Inicializar limpeza automática de sessões
    this.startSessionCleanup();
  }

  /**
   * Autentica um paciente no portal
   */
  async authenticatePatient(
    email: string,
    password: string,
    ipAddress: string,
    userAgent: string,
    deviceFingerprint?: string
  ): Promise<AuthResult> {
    try {
      // Verificar se IP está bloqueado
      if (this.blockedIps.has(ipAddress)) {
        await this.logSecurityEvent({
          type: 'login',
          patientId: '',
          ipAddress,
          userAgent,
          details: { reason: 'blocked_ip', email },
          severity: 'high',
          timestamp: new Date(),
        });

        return {
          success: false,
          error: 'Acesso bloqueado por motivos de segurança',
        };
      }

      // Verificar tentativas de login recentes
      const recentAttempts = this.getRecentLoginAttempts(email, ipAddress);
      if (recentAttempts.length >= 5) {
        await this.blockIpAddress(ipAddress, 'Muitas tentativas de login');
        return {
          success: false,
          error: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
        };
      }

      // Buscar paciente no banco
      const { data: patient, error: patientError } = await this.supabase
        .from('patients')
        .select(`
          id,
          name,
          email,
          phone,
          clinic_id,
          password_hash,
          two_factor_enabled,
          two_factor_secret,
          is_active,
          last_login,
          failed_login_attempts
        `)
        .eq('email', email.toLowerCase())
        .eq('is_active', true)
        .single();

      if (patientError || !patient) {
        await this.recordLoginAttempt({
          email,
          ipAddress,
          userAgent,
          success: false,
          failureReason: 'patient_not_found',
          timestamp: new Date(),
        });

        return {
          success: false,
          error: 'Credenciais inválidas',
        };
      }

      // Verificar senha
      const passwordValid = await this.verifyPassword(
        password,
        patient.password_hash
      );
      if (!passwordValid) {
        await this.recordLoginAttempt({
          patientId: patient.id,
          email,
          ipAddress,
          userAgent,
          success: false,
          failureReason: 'invalid_password',
          timestamp: new Date(),
        });

        // Incrementar tentativas falhadas
        await this.incrementFailedAttempts(patient.id);

        return {
          success: false,
          error: 'Credenciais inválidas',
        };
      }

      // Verificar se requer 2FA
      if (this.config.requireTwoFactor || patient.two_factor_enabled) {
        const twoFactorToken = this.generateTwoFactorToken();

        // Enviar código 2FA (implementar integração com SMS/Email)
        await this.sendTwoFactorCode(patient, twoFactorToken);

        return {
          success: false,
          requiresTwoFactor: true,
          twoFactorToken,
          error: 'Código de verificação enviado',
        };
      }

      // Verificar sessões ativas
      await this.cleanupExpiredSessions(patient.id);
      const activeSessions = await this.getActiveSessionsCount(patient.id);

      if (activeSessions >= this.config.maxConcurrentSessions) {
        // Remover sessão mais antiga
        await this.removeOldestSession(patient.id);
      }

      // Criar nova sessão
      const session = await this.createSession({
        patientId: patient.id,
        ipAddress,
        userAgent,
        deviceFingerprint,
      });

      // Registrar login bem-sucedido
      await this.recordLoginAttempt({
        patientId: patient.id,
        email,
        ipAddress,
        userAgent,
        success: true,
        timestamp: new Date(),
      });

      // Atualizar último login
      await this.updateLastLogin(patient.id);

      // Log de auditoria
      await this.auditLogger.log({
        action: 'patient_portal_login',
        userId: patient.id,
        userType: 'patient',
        resource: 'portal_session',
        resourceId: session.id,
        details: {
          ipAddress,
          userAgent,
          deviceFingerprint,
        },
        clinicId: patient.clinic_id,
      });

      // Log de segurança
      await this.logSecurityEvent({
        type: 'login',
        patientId: patient.id,
        sessionId: session.id,
        ipAddress,
        userAgent,
        details: { deviceFingerprint },
        severity: 'low',
        timestamp: new Date(),
      });

      return {
        success: true,
        session,
        patient: {
          id: patient.id,
          name: patient.name,
          email: patient.email,
          phone: patient.phone,
          clinicId: patient.clinic_id,
        },
      };
    } catch (error) {
      console.error('Erro na autenticação do portal:', error);

      await this.auditLogger.log({
        action: 'patient_portal_login_error',
        userId: '',
        userType: 'patient',
        resource: 'portal_auth',
        details: {
          error: error instanceof Error ? error.message : 'Erro desconhecido',
          email,
          ipAddress,
          userAgent,
        },
      });

      return {
        success: false,
        error: 'Erro interno do servidor',
      };
    }
  }

  /**
   * Verifica código 2FA e completa autenticação
   */
  async verifyTwoFactor(
    email: string,
    twoFactorToken: string,
    code: string,
    ipAddress: string,
    userAgent: string
  ): Promise<AuthResult> {
    try {
      // Verificar token 2FA
      const isValidToken = await this.verifyTwoFactorToken(
        twoFactorToken,
        code
      );
      if (!isValidToken) {
        return {
          success: false,
          error: 'Código de verificação inválido',
        };
      }

      // Buscar paciente novamente
      const { data: patient } = await this.supabase
        .from('patients')
        .select('*')
        .eq('email', email.toLowerCase())
        .single();

      if (!patient) {
        return {
          success: false,
          error: 'Paciente não encontrado',
        };
      }

      // Criar sessão
      const session = await this.createSession({
        patientId: patient.id,
        ipAddress,
        userAgent,
      });

      return {
        success: true,
        session,
        patient: {
          id: patient.id,
          name: patient.name,
          email: patient.email,
          phone: patient.phone,
          clinicId: patient.clinic_id,
        },
      };
    } catch (error) {
      console.error('Erro na verificação 2FA:', error);
      return {
        success: false,
        error: 'Erro na verificação',
      };
    }
  }

  /**
   * Valida uma sessão existente
   */
  async validateSession(
    sessionToken: string,
    _ipAddress: string
  ): Promise<AuthResult> {
    try {
      // Buscar sessão no banco
      const { data: sessionData, error } = await this.supabase
        .from('patient_portal_sessions')
        .select(`
          *,
          patients (
            id,
            name,
            email,
            phone,
            clinic_id,
            is_active
          )
        `)
        .eq('session_token', sessionToken)
        .single();

      if (error || !sessionData) {
        return {
          success: false,
          error: 'Sessão inválida',
        };
      }

      const session = sessionData;
      const patient = sessionData.patients;

      // Verificar se sessão expirou
      if (new Date() > new Date(session.expires_at)) {
        await this.invalidateSession(sessionToken);
        return {
          success: false,
          error: 'Sessão expirada',
        };
      }

      // Verificar inatividade
      const lastActivity = new Date(session.last_activity);
      const inactivityLimit = new Date(
        Date.now() - this.config.sessionInactivityTimeout * 60 * 1000
      );

      if (lastActivity < inactivityLimit) {
        await this.invalidateSession(sessionToken);
        return {
          success: false,
          error: 'Sessão expirada por inatividade',
        };
      }

      // Verificar se paciente ainda está ativo
      if (!patient.is_active) {
        await this.invalidateSession(sessionToken);
        return {
          success: false,
          error: 'Conta desativada',
        };
      }

      // Atualizar última atividade
      await this.updateSessionActivity(sessionToken);

      const portalSession: PortalSession = {
        id: session.id,
        patientId: session.patient_id,
        sessionToken: session.session_token,
        expiresAt: new Date(session.expires_at),
        lastActivity: new Date(),
        ipAddress: session.ip_address,
        userAgent: session.user_agent,
        isActive: true,
      };

      return {
        success: true,
        session: portalSession,
        patient: {
          id: patient.id,
          name: patient.name,
          email: patient.email,
          phone: patient.phone,
          clinicId: patient.clinic_id,
        },
      };
    } catch (error) {
      console.error('Erro na validação de sessão:', error);
      return {
        success: false,
        error: 'Erro na validação',
      };
    }
  }

  /**
   * Encerra uma sessão
   */
  async logout(sessionToken: string): Promise<boolean> {
    try {
      const session = await this.getSessionByToken(sessionToken);
      if (session) {
        await this.logSecurityEvent({
          type: 'logout',
          patientId: session.patientId,
          sessionId: session.id,
          ipAddress: session.ipAddress,
          userAgent: session.userAgent,
          details: {},
          severity: 'low',
          timestamp: new Date(),
        });
      }

      await this.invalidateSession(sessionToken);
      return true;
    } catch (error) {
      console.error('Erro no logout:', error);
      return false;
    }
  }

  /**
   * Métodos privados de apoio
   */
  private async createSession(params: {
    patientId: string;
    ipAddress: string;
    userAgent: string;
    deviceFingerprint?: string;
  }): Promise<PortalSession> {
    const sessionToken = this.generateSessionToken();
    const expiresAt = new Date(
      Date.now() + this.config.sessionDuration * 60 * 1000
    );

    const { data, error } = await this.supabase
      .from('patient_portal_sessions')
      .insert({
        patient_id: params.patientId,
        session_token: sessionToken,
        expires_at: expiresAt.toISOString(),
        ip_address: params.ipAddress,
        user_agent: params.userAgent,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao criar sessão: ${error.message}`);
    }

    const session: PortalSession = {
      id: data.id,
      patientId: params.patientId,
      sessionToken,
      expiresAt,
      lastActivity: new Date(),
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      isActive: true,
      deviceFingerprint: params.deviceFingerprint,
    };

    this.activeSessions.set(sessionToken, session);
    return session;
  }

  private generateSessionToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  private generateTwoFactorToken(): string {
    return crypto.randomBytes(16).toString('hex');
  }

  private async verifyPassword(
    password: string,
    hash: string
  ): Promise<boolean> {
    // Implementar verificação de senha com bcrypt ou similar
    const bcrypt = require('bcrypt');
    return await bcrypt.compare(password, hash);
  }

  private async verifyTwoFactorToken(
    _token: string,
    code: string
  ): Promise<boolean> {
    // Implementar verificação de código 2FA
    // Por enquanto, simulação simples
    return code.length === 6 && /^\d{6}$/.test(code);
  }

  private async sendTwoFactorCode(patient: any, _token: string): Promise<void> {
    // Implementar envio de código 2FA via SMS/Email
    console.log(`Enviando código 2FA para ${patient.email}`);
  }

  private async getActiveSessionsCount(patientId: string): Promise<number> {
    const { count } = await this.supabase
      .from('patient_portal_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('patient_id', patientId)
      .gt('expires_at', new Date().toISOString());

    return count || 0;
  }

  private async removeOldestSession(patientId: string): Promise<void> {
    const { data } = await this.supabase
      .from('patient_portal_sessions')
      .select('session_token')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: true })
      .limit(1)
      .single();

    if (data) {
      await this.invalidateSession(data.session_token);
    }
  }

  private async invalidateSession(sessionToken: string): Promise<void> {
    await this.supabase
      .from('patient_portal_sessions')
      .delete()
      .eq('session_token', sessionToken);

    this.activeSessions.delete(sessionToken);
  }

  private async updateSessionActivity(sessionToken: string): Promise<void> {
    await this.supabase
      .from('patient_portal_sessions')
      .update({ last_activity: new Date().toISOString() })
      .eq('session_token', sessionToken);

    const session = this.activeSessions.get(sessionToken);
    if (session) {
      session.lastActivity = new Date();
    }
  }

  private async getSessionByToken(
    sessionToken: string
  ): Promise<PortalSession | null> {
    const cached = this.activeSessions.get(sessionToken);
    if (cached) return cached;

    const { data } = await this.supabase
      .from('patient_portal_sessions')
      .select('*')
      .eq('session_token', sessionToken)
      .single();

    if (!data) return null;

    return {
      id: data.id,
      patientId: data.patient_id,
      sessionToken: data.session_token,
      expiresAt: new Date(data.expires_at),
      lastActivity: new Date(data.last_activity),
      ipAddress: data.ip_address,
      userAgent: data.user_agent,
      isActive: true,
    };
  }

  private getRecentLoginAttempts(
    email: string,
    ipAddress: string
  ): LoginAttempt[] {
    const key = `${email}:${ipAddress}`;
    const attempts = this.loginAttempts.get(key) || [];
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);

    return attempts.filter((attempt) => attempt.timestamp > fifteenMinutesAgo);
  }

  private async recordLoginAttempt(
    attempt: Omit<LoginAttempt, 'id' | 'blocked'>
  ): Promise<void> {
    const loginAttempt: LoginAttempt = {
      id: crypto.randomUUID(),
      blocked: false,
      ...attempt,
    };

    const key = `${attempt.email}:${attempt.ipAddress}`;
    const attempts = this.loginAttempts.get(key) || [];
    attempts.push(loginAttempt);
    this.loginAttempts.set(key, attempts);

    // Salvar no banco
    await this.supabase.from('patient_login_attempts').insert({
      patient_id: attempt.patientId,
      email: attempt.email,
      ip_address: attempt.ipAddress,
      user_agent: attempt.userAgent,
      success: attempt.success,
      failure_reason: attempt.failureReason,
      timestamp: attempt.timestamp.toISOString(),
    });
  }

  private async blockIpAddress(
    ipAddress: string,
    reason: string
  ): Promise<void> {
    this.blockedIps.add(ipAddress);

    // Remover bloqueio após 15 minutos
    setTimeout(
      () => {
        this.blockedIps.delete(ipAddress);
      },
      15 * 60 * 1000
    );

    await this.auditLogger.log({
      action: 'ip_blocked',
      userId: '',
      userType: 'system',
      resource: 'security',
      details: { ipAddress, reason },
    });
  }

  private async incrementFailedAttempts(patientId: string): Promise<void> {
    await this.supabase
      .from('patients')
      .update({
        failed_login_attempts: this.supabase.raw('failed_login_attempts + 1'),
      })
      .eq('id', patientId);
  }

  private async updateLastLogin(patientId: string): Promise<void> {
    await this.supabase
      .from('patients')
      .update({
        last_login: new Date().toISOString(),
        failed_login_attempts: 0,
      })
      .eq('id', patientId);
  }

  private async cleanupExpiredSessions(patientId?: string): Promise<void> {
    let query = this.supabase
      .from('patient_portal_sessions')
      .delete()
      .lt('expires_at', new Date().toISOString());

    if (patientId) {
      query = query.eq('patient_id', patientId);
    }

    await query;
  }

  private async logSecurityEvent(event: SecurityEvent): Promise<void> {
    await this.supabase.from('patient_security_events').insert({
      event_type: event.type,
      patient_id: event.patientId,
      session_id: event.sessionId,
      ip_address: event.ipAddress,
      user_agent: event.userAgent,
      details: event.details,
      severity: event.severity,
      timestamp: event.timestamp.toISOString(),
    });
  }

  private startSessionCleanup(): void {
    // Limpeza a cada 30 minutos
    setInterval(
      async () => {
        await this.cleanupExpiredSessions();
      },
      30 * 60 * 1000
    );
  }

  /**
   * Métodos públicos adicionais
   */
  async changePassword(
    patientId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Validar senha atual
      const { data: patient } = await this.supabase
        .from('patients')
        .select('password_hash')
        .eq('id', patientId)
        .single();

      if (!patient) {
        return { success: false, error: 'Paciente não encontrado' };
      }

      const isCurrentPasswordValid = await this.verifyPassword(
        currentPassword,
        patient.password_hash
      );
      if (!isCurrentPasswordValid) {
        return { success: false, error: 'Senha atual incorreta' };
      }

      // Validar nova senha
      const passwordValidation = this.validatePassword(newPassword);
      if (!passwordValidation.valid) {
        return { success: false, error: passwordValidation.error };
      }

      // Hash da nova senha
      const bcrypt = require('bcrypt');
      const newPasswordHash = await bcrypt.hash(newPassword, 12);

      // Atualizar senha
      await this.supabase
        .from('patients')
        .update({ password_hash: newPasswordHash })
        .eq('id', patientId);

      // Log de auditoria
      await this.auditLogger.log({
        action: 'password_changed',
        userId: patientId,
        userType: 'patient',
        resource: 'patient_account',
        resourceId: patientId,
      });

      return { success: true };
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      return { success: false, error: 'Erro interno do servidor' };
    }
  }

  private validatePassword(password: string): {
    valid: boolean;
    error?: string;
  } {
    const policy = this.config.passwordPolicy;

    if (password.length < policy.minLength) {
      return {
        valid: false,
        error: `Senha deve ter pelo menos ${policy.minLength} caracteres`,
      };
    }

    if (policy.requireUppercase && !/[A-Z]/.test(password)) {
      return {
        valid: false,
        error: 'Senha deve conter pelo menos uma letra maiúscula',
      };
    }

    if (policy.requireLowercase && !/[a-z]/.test(password)) {
      return {
        valid: false,
        error: 'Senha deve conter pelo menos uma letra minúscula',
      };
    }

    if (policy.requireNumbers && !/\d/.test(password)) {
      return { valid: false, error: 'Senha deve conter pelo menos um número' };
    }

    if (
      policy.requireSpecialChars &&
      !/[!@#$%^&*(),.?":{}|<>]/.test(password)
    ) {
      return {
        valid: false,
        error: 'Senha deve conter pelo menos um caractere especial',
      };
    }

    return { valid: true };
  }

  async getActiveSessions(patientId: string): Promise<PortalSession[]> {
    const { data } = await this.supabase
      .from('patient_portal_sessions')
      .select('*')
      .eq('patient_id', patientId)
      .gt('expires_at', new Date().toISOString())
      .order('last_activity', { ascending: false });

    return (data || []).map((session) => ({
      id: session.id,
      patientId: session.patient_id,
      sessionToken: session.session_token,
      expiresAt: new Date(session.expires_at),
      lastActivity: new Date(session.last_activity),
      ipAddress: session.ip_address,
      userAgent: session.user_agent,
      isActive: true,
    }));
  }

  async terminateSession(
    patientId: string,
    sessionId: string
  ): Promise<boolean> {
    try {
      const { data } = await this.supabase
        .from('patient_portal_sessions')
        .select('session_token')
        .eq('id', sessionId)
        .eq('patient_id', patientId)
        .single();

      if (data) {
        await this.invalidateSession(data.session_token);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erro ao terminar sessão:', error);
      return false;
    }
  }

  async terminateAllSessions(
    patientId: string,
    exceptSessionToken?: string
  ): Promise<number> {
    try {
      let query = this.supabase
        .from('patient_portal_sessions')
        .delete()
        .eq('patient_id', patientId);

      if (exceptSessionToken) {
        query = query.neq('session_token', exceptSessionToken);
      }

      const { count } = await query;
      return count || 0;
    } catch (error) {
      console.error('Erro ao terminar todas as sessões:', error);
      return 0;
    }
  }
}

export default PortalAuthManager;
