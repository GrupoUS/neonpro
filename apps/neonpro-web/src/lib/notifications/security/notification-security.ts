import { createClient } from '@supabase/supabase-js';
import { AuditLogger } from '../../auth/audit/audit-logger';
import { LGPDManager } from '../../lgpd/lgpd-manager';
import { EncryptionService } from '../../security/encryption-service';

export interface SecurityConfig {
  encryption_enabled: boolean;
  data_retention_days: number;
  anonymization_enabled: boolean;
  audit_enabled: boolean;
  rate_limiting: {
    enabled: boolean;
    max_per_minute: number;
    max_per_hour: number;
    max_per_day: number;
  };
  content_filtering: {
    enabled: boolean;
    block_sensitive_data: boolean;
    block_spam_keywords: boolean;
    block_malicious_links: boolean;
  };
  access_control: {
    require_authentication: boolean;
    allowed_roles: string[];
    ip_whitelist: string[];
  };
}

export interface SecurityValidationResult {
  is_valid: boolean;
  violations: SecurityViolation[];
  risk_score: number;
  recommendations: string[];
}

export interface SecurityViolation {
  type: 'pii_detected' | 'spam_content' | 'malicious_link' | 'rate_limit' | 'unauthorized_access' | 'data_retention';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  field?: string;
  value?: string;
  recommendation: string;
}

export interface EncryptedNotificationData {
  encrypted_content: string;
  encrypted_metadata: string;
  encryption_key_id: string;
  encryption_algorithm: string;
  created_at: Date;
}

export interface SecurityAuditLog {
  id: string;
  event_type: string;
  user_id?: string;
  ip_address?: string;
  user_agent?: string;
  notification_id?: string;
  security_violations: SecurityViolation[];
  risk_score: number;
  action_taken: string;
  timestamp: Date;
  metadata: Record<string, any>;
}

export interface RateLimitStatus {
  user_id: string;
  current_minute: number;
  current_hour: number;
  current_day: number;
  limits_exceeded: boolean;
  reset_times: {
    minute: Date;
    hour: Date;
    day: Date;
  };
}

export interface ContentFilterResult {
  is_safe: boolean;
  detected_issues: Array<{
    type: 'pii' | 'spam' | 'malicious_link' | 'sensitive_data';
    confidence: number;
    location: string;
    suggestion: string;
  }>;
  sanitized_content?: string;
}

export class NotificationSecurity {
  private supabase;
  private auditLogger: AuditLogger;
  private lgpdManager: LGPDManager;
  private encryptionService: EncryptionService;
  private securityConfig: SecurityConfig;
  private rateLimitCache: Map<string, RateLimitStatus> = new Map();
  private suspiciousPatterns: RegExp[];
  private piiPatterns: RegExp[];
  private spamKeywords: string[];

  constructor(config?: Partial<SecurityConfig>) {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    this.auditLogger = new AuditLogger();
    this.lgpdManager = new LGPDManager();
    this.encryptionService = new EncryptionService();
    
    this.securityConfig = {
      encryption_enabled: true,
      data_retention_days: 90,
      anonymization_enabled: true,
      audit_enabled: true,
      rate_limiting: {
        enabled: true,
        max_per_minute: 60,
        max_per_hour: 1000,
        max_per_day: 10000
      },
      content_filtering: {
        enabled: true,
        block_sensitive_data: true,
        block_spam_keywords: true,
        block_malicious_links: true
      },
      access_control: {
        require_authentication: true,
        allowed_roles: ['admin', 'notification_manager', 'system'],
        ip_whitelist: []
      },
      ...config
    };

    this.initializeSecurityPatterns();
  }

  /**
   * Valida segurança de uma notificação antes do envio
   */
  async validateNotificationSecurity(
    notificationData: any,
    context: {
      user_id?: string;
      ip_address?: string;
      user_agent?: string;
      role?: string;
    }
  ): Promise<SecurityValidationResult> {
    const violations: SecurityViolation[] = [];
    let riskScore = 0;

    try {
      // 1. Validação de controle de acesso
      const accessViolations = await this.validateAccessControl(context);
      violations.push(...accessViolations);
      riskScore += accessViolations.length * 20;

      // 2. Validação de rate limiting
      const rateLimitViolations = await this.validateRateLimit(context.user_id);
      violations.push(...rateLimitViolations);
      riskScore += rateLimitViolations.length * 30;

      // 3. Validação de conteúdo
      const contentViolations = await this.validateContent(notificationData);
      violations.push(...contentViolations);
      riskScore += contentViolations.length * 25;

      // 4. Validação LGPD
      const lgpdViolations = await this.validateLGPDCompliance(notificationData, context.user_id);
      violations.push(...lgpdViolations);
      riskScore += lgpdViolations.length * 40;

      // 5. Validação de retenção de dados
      const retentionViolations = await this.validateDataRetention(notificationData);
      violations.push(...retentionViolations);
      riskScore += retentionViolations.length * 15;

      const isValid = violations.filter(v => v.severity === 'critical' || v.severity === 'high').length === 0;
      const recommendations = this.generateSecurityRecommendations(violations);

      // Log da auditoria
      if (this.securityConfig.audit_enabled) {
        await this.logSecurityAudit({
          event_type: 'notification_security_validation',
          user_id: context.user_id,
          ip_address: context.ip_address,
          user_agent: context.user_agent,
          security_violations: violations,
          risk_score: riskScore,
          action_taken: isValid ? 'approved' : 'blocked'
        });
      }

      return {
        is_valid: isValid,
        violations,
        risk_score: Math.min(riskScore, 100),
        recommendations
      };
    } catch (error) {
      throw new Error(`Erro na validação de segurança: ${error}`);
    }
  }

  /**
   * Criptografa dados sensíveis da notificação
   */
  async encryptNotificationData(data: any): Promise<EncryptedNotificationData> {
    if (!this.securityConfig.encryption_enabled) {
      throw new Error('Criptografia não está habilitada');
    }

    try {
      const sensitiveFields = ['content', 'subject', 'recipient_data', 'personal_data'];
      const dataToEncrypt = {};
      const metadata = { ...data };

      // Separar dados sensíveis
      for (const field of sensitiveFields) {
        if (data[field]) {
          dataToEncrypt[field] = data[field];
          delete metadata[field];
        }
      }

      const encryptedContent = await this.encryptionService.encrypt(JSON.stringify(dataToEncrypt));
      const encryptedMetadata = await this.encryptionService.encrypt(JSON.stringify(metadata));

      return {
        encrypted_content: encryptedContent.data,
        encrypted_metadata: encryptedMetadata.data,
        encryption_key_id: encryptedContent.keyId,
        encryption_algorithm: 'AES-256-GCM',
        created_at: new Date()
      };
    } catch (error) {
      throw new Error(`Erro na criptografia: ${error}`);
    }
  }

  /**
   * Descriptografa dados da notificação
   */
  async decryptNotificationData(encryptedData: EncryptedNotificationData): Promise<any> {
    if (!this.securityConfig.encryption_enabled) {
      throw new Error('Criptografia não está habilitada');
    }

    try {
      const decryptedContent = await this.encryptionService.decrypt({
        data: encryptedData.encrypted_content,
        keyId: encryptedData.encryption_key_id
      });

      const decryptedMetadata = await this.encryptionService.decrypt({
        data: encryptedData.encrypted_metadata,
        keyId: encryptedData.encryption_key_id
      });

      const content = JSON.parse(decryptedContent);
      const metadata = JSON.parse(decryptedMetadata);

      return { ...metadata, ...content };
    } catch (error) {
      throw new Error(`Erro na descriptografia: ${error}`);
    }
  }

  /**
   * Filtra e sanitiza conteúdo
   */
  async filterContent(content: string): Promise<ContentFilterResult> {
    const issues = [];
    let sanitizedContent = content;
    let isSafe = true;

    try {
      // 1. Detectar PII
      const piiDetection = this.detectPII(content);
      if (piiDetection.length > 0) {
        issues.push(...piiDetection);
        isSafe = false;
        
        if (this.securityConfig.content_filtering.block_sensitive_data) {
          sanitizedContent = this.sanitizePII(sanitizedContent);
        }
      }

      // 2. Detectar spam
      const spamDetection = this.detectSpam(content);
      if (spamDetection.length > 0) {
        issues.push(...spamDetection);
        isSafe = false;
      }

      // 3. Detectar links maliciosos
      const maliciousLinks = await this.detectMaliciousLinks(content);
      if (maliciousLinks.length > 0) {
        issues.push(...maliciousLinks);
        isSafe = false;
        
        if (this.securityConfig.content_filtering.block_malicious_links) {
          sanitizedContent = this.sanitizeMaliciousLinks(sanitizedContent);
        }
      }

      return {
        is_safe: isSafe,
        detected_issues: issues,
        sanitized_content: sanitizedContent !== content ? sanitizedContent : undefined
      };
    } catch (error) {
      throw new Error(`Erro na filtragem de conteúdo: ${error}`);
    }
  }

  /**
   * Verifica rate limiting para usuário
   */
  async checkRateLimit(userId: string): Promise<RateLimitStatus> {
    if (!this.securityConfig.rate_limiting.enabled) {
      return {
        user_id: userId,
        current_minute: 0,
        current_hour: 0,
        current_day: 0,
        limits_exceeded: false,
        reset_times: {
          minute: new Date(),
          hour: new Date(),
          day: new Date()
        }
      };
    }

    try {
      const now = new Date();
      const cacheKey = `rate_limit_${userId}`;
      let status = this.rateLimitCache.get(cacheKey);

      if (!status) {
        // Buscar do banco de dados
        const { data } = await this.supabase
          .from('notification_rate_limits')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (data) {
          status = {
            user_id: userId,
            current_minute: data.current_minute || 0,
            current_hour: data.current_hour || 0,
            current_day: data.current_day || 0,
            limits_exceeded: false,
            reset_times: {
              minute: new Date(data.minute_reset || now),
              hour: new Date(data.hour_reset || now),
              day: new Date(data.day_reset || now)
            }
          };
        } else {
          status = {
            user_id: userId,
            current_minute: 0,
            current_hour: 0,
            current_day: 0,
            limits_exceeded: false,
            reset_times: {
              minute: new Date(now.getTime() + 60000),
              hour: new Date(now.getTime() + 3600000),
              day: new Date(now.getTime() + 86400000)
            }
          };
        }
      }

      // Verificar se precisa resetar contadores
      if (now >= status.reset_times.minute) {
        status.current_minute = 0;
        status.reset_times.minute = new Date(now.getTime() + 60000);
      }

      if (now >= status.reset_times.hour) {
        status.current_hour = 0;
        status.reset_times.hour = new Date(now.getTime() + 3600000);
      }

      if (now >= status.reset_times.day) {
        status.current_day = 0;
        status.reset_times.day = new Date(now.getTime() + 86400000);
      }

      // Verificar limites
      const limits = this.securityConfig.rate_limiting;
      status.limits_exceeded = 
        status.current_minute >= limits.max_per_minute ||
        status.current_hour >= limits.max_per_hour ||
        status.current_day >= limits.max_per_day;

      this.rateLimitCache.set(cacheKey, status);
      return status;
    } catch (error) {
      throw new Error(`Erro ao verificar rate limit: ${error}`);
    }
  }

  /**
   * Incrementa contador de rate limit
   */
  async incrementRateLimit(userId: string): Promise<void> {
    if (!this.securityConfig.rate_limiting.enabled) return;

    try {
      const status = await this.checkRateLimit(userId);
      
      status.current_minute++;
      status.current_hour++;
      status.current_day++;

      // Atualizar cache
      this.rateLimitCache.set(`rate_limit_${userId}`, status);

      // Atualizar banco de dados
      await this.supabase
        .from('notification_rate_limits')
        .upsert({
          user_id: userId,
          current_minute: status.current_minute,
          current_hour: status.current_hour,
          current_day: status.current_day,
          minute_reset: status.reset_times.minute.toISOString(),
          hour_reset: status.reset_times.hour.toISOString(),
          day_reset: status.reset_times.day.toISOString(),
          updated_at: new Date().toISOString()
        });
    } catch (error) {
      throw new Error(`Erro ao incrementar rate limit: ${error}`);
    }
  }

  /**
   * Anonimiza dados de notificação para compliance LGPD
   */
  async anonymizeNotificationData(notificationId: string): Promise<void> {
    if (!this.securityConfig.anonymization_enabled) return;

    try {
      await this.lgpdManager.anonymizeData('notification_logs', {
        id: notificationId
      });

      await this.auditLogger.log({
        action: 'notification_data_anonymized',
        resource_type: 'notification',
        resource_id: notificationId,
        details: { reason: 'lgpd_compliance' }
      });
    } catch (error) {
      throw new Error(`Erro na anonimização: ${error}`);
    }
  }

  /**
   * Remove dados antigos conforme política de retenção
   */
  async cleanupExpiredData(): Promise<{
    deleted_notifications: number;
    anonymized_records: number;
  }> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - this.securityConfig.data_retention_days);

      // Buscar notificações expiradas
      const { data: expiredNotifications } = await this.supabase
        .from('notification_logs')
        .select('id')
        .lt('created_at', cutoffDate.toISOString());

      let deletedCount = 0;
      let anonymizedCount = 0;

      if (expiredNotifications && expiredNotifications.length > 0) {
        if (this.securityConfig.anonymization_enabled) {
          // Anonimizar em vez de deletar
          for (const notification of expiredNotifications) {
            await this.anonymizeNotificationData(notification.id);
            anonymizedCount++;
          }
        } else {
          // Deletar registros
          const { error } = await this.supabase
            .from('notification_logs')
            .delete()
            .lt('created_at', cutoffDate.toISOString());

          if (error) throw error;
          deletedCount = expiredNotifications.length;
        }
      }

      await this.auditLogger.log({
        action: 'notification_data_cleanup',
        resource_type: 'notification_logs',
        details: {
          cutoff_date: cutoffDate.toISOString(),
          deleted_count: deletedCount,
          anonymized_count: anonymizedCount
        }
      });

      return {
        deleted_notifications: deletedCount,
        anonymized_records: anonymizedCount
      };
    } catch (error) {
      throw new Error(`Erro na limpeza de dados: ${error}`);
    }
  }

  /**
   * Gera relatório de segurança
   */
  async generateSecurityReport(period: 'day' | 'week' | 'month' = 'week'): Promise<{
    summary: {
      total_validations: number;
      blocked_notifications: number;
      security_violations: number;
      average_risk_score: number;
    };
    violations_by_type: Record<string, number>;
    top_violations: SecurityViolation[];
    rate_limit_stats: {
      users_limited: number;
      total_blocks: number;
    };
    recommendations: string[];
  }> {
    try {
      const startDate = new Date();
      switch (period) {
        case 'day':
          startDate.setDate(startDate.getDate() - 1);
          break;
        case 'week':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(startDate.getMonth() - 1);
          break;
      }

      const { data: auditLogs } = await this.supabase
        .from('security_audit_logs')
        .select('*')
        .gte('timestamp', startDate.toISOString())
        .eq('event_type', 'notification_security_validation');

      const totalValidations = auditLogs?.length || 0;
      const blockedNotifications = auditLogs?.filter(log => log.action_taken === 'blocked').length || 0;
      
      const allViolations = auditLogs?.flatMap(log => log.security_violations || []) || [];
      const totalViolations = allViolations.length;
      
      const averageRiskScore = auditLogs?.length ? 
        auditLogs.reduce((sum, log) => sum + (log.risk_score || 0), 0) / auditLogs.length : 0;

      // Violações por tipo
      const violationsByType = allViolations.reduce((counts, violation) => {
        counts[violation.type] = (counts[violation.type] || 0) + 1;
        return counts;
      }, {} as Record<string, number>);

      // Top violações
      const topViolations = allViolations
        .filter(v => v.severity === 'high' || v.severity === 'critical')
        .slice(0, 10);

      // Stats de rate limit
      const { data: rateLimitData } = await this.supabase
        .from('notification_rate_limits')
        .select('user_id, current_minute, current_hour, current_day')
        .gte('updated_at', startDate.toISOString());

      const usersLimited = rateLimitData?.filter(rl => 
        rl.current_minute >= this.securityConfig.rate_limiting.max_per_minute ||
        rl.current_hour >= this.securityConfig.rate_limiting.max_per_hour ||
        rl.current_day >= this.securityConfig.rate_limiting.max_per_day
      ).length || 0;

      const recommendations = this.generateSecurityRecommendations(allViolations);

      return {
        summary: {
          total_validations: totalValidations,
          blocked_notifications: blockedNotifications,
          security_violations: totalViolations,
          average_risk_score: averageRiskScore
        },
        violations_by_type: violationsByType,
        top_violations: topViolations,
        rate_limit_stats: {
          users_limited: usersLimited,
          total_blocks: blockedNotifications
        },
        recommendations
      };
    } catch (error) {
      throw new Error(`Erro ao gerar relatório de segurança: ${error}`);
    }
  }

  // Métodos privados
  private initializeSecurityPatterns(): void {
    // Padrões para detectar PII
    this.piiPatterns = [
      /\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/g, // CPF
      /\b\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}\b/g, // CNPJ
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, // Email
      /\b\(?\d{2}\)?[\s-]?\d{4,5}[\s-]?\d{4}\b/g, // Telefone
      /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g // Cartão de crédito
    ];

    // Padrões suspeitos
    this.suspiciousPatterns = [
      /javascript:/gi,
      /data:text\/html/gi,
      /vbscript:/gi,
      /<script[^>]*>/gi,
      /on\w+\s*=/gi
    ];

    // Palavras-chave de spam
    this.spamKeywords = [
      'ganhe dinheiro fácil',
      'clique aqui agora',
      'oferta limitada',
      'urgente',
      'parabéns você ganhou',
      'renda extra',
      'trabalhe em casa'
    ];
  }

  private async validateAccessControl(context: any): Promise<SecurityViolation[]> {
    const violations: SecurityViolation[] = [];
    const config = this.securityConfig.access_control;

    if (config.require_authentication && !context.user_id) {
      violations.push({
        type: 'unauthorized_access',
        severity: 'critical',
        description: 'Tentativa de envio sem autenticação',
        recommendation: 'Implementar autenticação obrigatória'
      });
    }

    if (context.role && config.allowed_roles.length > 0 && !config.allowed_roles.includes(context.role)) {
      violations.push({
        type: 'unauthorized_access',
        severity: 'high',
        description: `Role '${context.role}' não autorizada`,
        recommendation: 'Verificar permissões do usuário'
      });
    }

    if (config.ip_whitelist.length > 0 && context.ip_address && !config.ip_whitelist.includes(context.ip_address)) {
      violations.push({
        type: 'unauthorized_access',
        severity: 'medium',
        description: `IP ${context.ip_address} não está na whitelist`,
        recommendation: 'Adicionar IP à whitelist ou revisar política'
      });
    }

    return violations;
  }

  private async validateRateLimit(userId?: string): Promise<SecurityViolation[]> {
    if (!userId || !this.securityConfig.rate_limiting.enabled) {
      return [];
    }

    const violations: SecurityViolation[] = [];
    const status = await this.checkRateLimit(userId);

    if (status.limits_exceeded) {
      violations.push({
        type: 'rate_limit',
        severity: 'high',
        description: 'Limite de rate limiting excedido',
        recommendation: 'Aguardar reset do limite ou revisar política'
      });
    }

    return violations;
  }

  private async validateContent(data: any): Promise<SecurityViolation[]> {
    const violations: SecurityViolation[] = [];
    
    if (!this.securityConfig.content_filtering.enabled) {
      return violations;
    }

    const content = JSON.stringify(data);
    const filterResult = await this.filterContent(content);

    for (const issue of filterResult.detected_issues) {
      violations.push({
        type: issue.type as any,
        severity: issue.confidence > 0.8 ? 'high' : issue.confidence > 0.5 ? 'medium' : 'low',
        description: `${issue.type} detectado: ${issue.location}`,
        recommendation: issue.suggestion
      });
    }

    return violations;
  }

  private async validateLGPDCompliance(data: any, userId?: string): Promise<SecurityViolation[]> {
    const violations: SecurityViolation[] = [];

    if (!userId) return violations;

    try {
      // Verificar consentimento
      const hasConsent = await this.lgpdManager.hasValidConsent(userId, 'notifications');
      if (!hasConsent) {
        violations.push({
          type: 'pii_detected',
          severity: 'critical',
          description: 'Usuário não possui consentimento válido para notificações',
          recommendation: 'Obter consentimento antes do envio'
        });
      }

      // Verificar se usuário optou por não receber
      const hasOptOut = await this.lgpdManager.hasOptedOut(userId, 'notifications');
      if (hasOptOut) {
        violations.push({
          type: 'pii_detected',
          severity: 'high',
          description: 'Usuário optou por não receber notificações',
          recommendation: 'Respeitar preferência do usuário'
        });
      }
    } catch (error) {
      violations.push({
        type: 'pii_detected',
        severity: 'medium',
        description: 'Erro ao validar compliance LGPD',
        recommendation: 'Verificar configuração LGPD'
      });
    }

    return violations;
  }

  private async validateDataRetention(data: any): Promise<SecurityViolation[]> {
    const violations: SecurityViolation[] = [];

    if (data.created_at) {
      const createdDate = new Date(data.created_at);
      const now = new Date();
      const daysDiff = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));

      if (daysDiff > this.securityConfig.data_retention_days) {
        violations.push({
          type: 'data_retention',
          severity: 'medium',
          description: `Dados com ${daysDiff} dias excedem política de retenção`,
          recommendation: 'Anonimizar ou deletar dados antigos'
        });
      }
    }

    return violations;
  }

  private detectPII(content: string): Array<{ type: 'pii'; confidence: number; location: string; suggestion: string }> {
    const issues = [];

    for (const pattern of this.piiPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        for (const match of matches) {
          issues.push({
            type: 'pii' as const,
            confidence: 0.9,
            location: `Texto: "${match}"`,
            suggestion: 'Remover ou mascarar dados pessoais'
          });
        }
      }
    }

    return issues;
  }

  private detectSpam(content: string): Array<{ type: 'spam'; confidence: number; location: string; suggestion: string }> {
    const issues = [];
    const lowerContent = content.toLowerCase();

    for (const keyword of this.spamKeywords) {
      if (lowerContent.includes(keyword.toLowerCase())) {
        issues.push({
          type: 'spam' as const,
          confidence: 0.7,
          location: `Palavra-chave: "${keyword}"`,
          suggestion: 'Revisar conteúdo para evitar características de spam'
        });
      }
    }

    return issues;
  }

  private async detectMaliciousLinks(content: string): Promise<Array<{ type: 'malicious_link'; confidence: number; location: string; suggestion: string }>> {
    const issues = [];
    const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g;
    const urls = content.match(urlRegex) || [];

    for (const url of urls) {
      // Verificar padrões suspeitos
      for (const pattern of this.suspiciousPatterns) {
        if (pattern.test(url)) {
          issues.push({
            type: 'malicious_link' as const,
            confidence: 0.8,
            location: `URL: "${url}"`,
            suggestion: 'Verificar e validar links antes do envio'
          });
          break;
        }
      }

      // Verificar domínios suspeitos (implementação simplificada)
      const suspiciousDomains = ['bit.ly', 'tinyurl.com', 'short.link'];
      const domain = new URL(url).hostname;
      if (suspiciousDomains.some(d => domain.includes(d))) {
        issues.push({
          type: 'malicious_link' as const,
          confidence: 0.6,
          location: `Domínio suspeito: "${domain}"`,
          suggestion: 'Evitar links encurtados ou verificar destino'
        });
      }
    }

    return issues;
  }

  private sanitizePII(content: string): string {
    let sanitized = content;

    for (const pattern of this.piiPatterns) {
      sanitized = sanitized.replace(pattern, '[DADOS_PESSOAIS_REMOVIDOS]');
    }

    return sanitized;
  }

  private sanitizeMaliciousLinks(content: string): string {
    let sanitized = content;

    for (const pattern of this.suspiciousPatterns) {
      sanitized = sanitized.replace(pattern, '[LINK_REMOVIDO]');
    }

    return sanitized;
  }

  private generateSecurityRecommendations(violations: SecurityViolation[]): string[] {
    const recommendations = new Set<string>();

    for (const violation of violations) {
      recommendations.add(violation.recommendation);
    }

    // Recomendações gerais baseadas no padrão de violações
    const criticalCount = violations.filter(v => v.severity === 'critical').length;
    const highCount = violations.filter(v => v.severity === 'high').length;

    if (criticalCount > 0) {
      recommendations.add('Revisar urgentemente as políticas de segurança');
    }

    if (highCount > 3) {
      recommendations.add('Implementar treinamento de segurança para equipe');
    }

    const piiCount = violations.filter(v => v.type === 'pii_detected').length;
    if (piiCount > 0) {
      recommendations.add('Implementar validação automática de PII');
    }

    return Array.from(recommendations);
  }

  private async logSecurityAudit(auditData: Omit<SecurityAuditLog, 'id' | 'timestamp' | 'metadata'>): Promise<void> {
    try {
      await this.supabase
        .from('security_audit_logs')
        .insert({
          ...auditData,
          timestamp: new Date().toISOString(),
          metadata: {}
        });
    } catch (error) {
      console.error('Erro ao registrar auditoria de segurança:', error);
    }
  }
}

export default NotificationSecurity;

