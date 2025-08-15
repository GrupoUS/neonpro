/**
 * NeonPro Audit Trail System
 *
 * Sistema completo de auditoria para rastreamento de todas as ações
 * do sistema, mudanças em dados sensíveis e atividades suspeitas.
 *
 * Features:
 * - Captura automática de eventos
 * - Rastreamento de mudanças em dados sensíveis
 * - Detecção de atividades suspeitas
 * - Armazenamento seguro e criptografado
 * - Retenção e arquivamento automático
 * - Exportação de relatórios
 *
 * @author APEX Master Developer
 * @version 1.0.0
 */

import crypto from 'node:crypto';
import { createClient } from '@/lib/supabase/client';

// Tipos de eventos de auditoria
export enum AuditEventType {
  // Autenticação e Autorização
  LOGIN = 'auth.login',
  LOGOUT = 'auth.logout',
  LOGIN_FAILED = 'auth.login_failed',
  PASSWORD_CHANGE = 'auth.password_change',
  ROLE_CHANGE = 'auth.role_change',
  PERMISSION_CHANGE = 'auth.permission_change',

  // Gestão de Usuários
  USER_CREATE = 'user.create',
  USER_UPDATE = 'user.update',
  USER_DELETE = 'user.delete',
  USER_SUSPEND = 'user.suspend',
  USER_ACTIVATE = 'user.activate',

  // Gestão de Pacientes
  PATIENT_CREATE = 'patient.create',
  PATIENT_UPDATE = 'patient.update',
  PATIENT_DELETE = 'patient.delete',
  PATIENT_VIEW = 'patient.view',
  PATIENT_EXPORT = 'patient.export',

  // Dados Médicos
  MEDICAL_RECORD_CREATE = 'medical.record_create',
  MEDICAL_RECORD_UPDATE = 'medical.record_update',
  MEDICAL_RECORD_DELETE = 'medical.record_delete',
  MEDICAL_RECORD_VIEW = 'medical.record_view',
  MEDICAL_DOCUMENT_UPLOAD = 'medical.document_upload',
  MEDICAL_DOCUMENT_DELETE = 'medical.document_delete',

  // Agendamentos
  APPOINTMENT_CREATE = 'appointment.create',
  APPOINTMENT_UPDATE = 'appointment.update',
  APPOINTMENT_CANCEL = 'appointment.cancel',
  APPOINTMENT_COMPLETE = 'appointment.complete',

  // Financeiro
  PAYMENT_CREATE = 'payment.create',
  PAYMENT_UPDATE = 'payment.update',
  PAYMENT_REFUND = 'payment.refund',
  INVOICE_GENERATE = 'invoice.generate',

  // Sistema
  SYSTEM_CONFIG_CHANGE = 'system.config_change',
  SYSTEM_BACKUP = 'system.backup',
  SYSTEM_RESTORE = 'system.restore',
  DATA_EXPORT = 'system.data_export',
  DATA_IMPORT = 'system.data_import',

  // Segurança
  SECURITY_VIOLATION = 'security.violation',
  SUSPICIOUS_ACTIVITY = 'security.suspicious_activity',
  FAILED_ACCESS_ATTEMPT = 'security.failed_access',
  SESSION_HIJACK_ATTEMPT = 'security.session_hijack',
  CSRF_ATTACK_BLOCKED = 'security.csrf_blocked',

  // LGPD
  CONSENT_GIVEN = 'lgpd.consent_given',
  CONSENT_WITHDRAWN = 'lgpd.consent_withdrawn',
  DATA_DELETION_REQUEST = 'lgpd.data_deletion_request',
  DATA_EXPORT_REQUEST = 'lgpd.data_export_request',
  DATA_ANONYMIZATION = 'lgpd.data_anonymization',
}

// Níveis de severidade
export enum AuditSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

// Interface para evento de auditoria
export interface AuditEvent {
  id?: string;
  event_type: AuditEventType;
  severity: AuditSeverity;
  user_id?: string;
  clinic_id?: string;
  session_id?: string;
  ip_address?: string;
  user_agent?: string;
  resource_type?: string;
  resource_id?: string;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  metadata?: Record<string, any>;
  description: string;
  timestamp: Date;
  checksum?: string;
}

// Interface para filtros de consulta
export interface AuditQueryFilters {
  event_types?: AuditEventType[];
  severity?: AuditSeverity[];
  user_id?: string;
  clinic_id?: string;
  resource_type?: string;
  resource_id?: string;
  start_date?: Date;
  end_date?: Date;
  ip_address?: string;
  limit?: number;
  offset?: number;
}

// Interface para relatório de auditoria
export interface AuditReport {
  id: string;
  title: string;
  description: string;
  filters: AuditQueryFilters;
  events: AuditEvent[];
  generated_at: Date;
  generated_by: string;
  total_events: number;
}

// Interface para estatísticas de auditoria
export interface AuditStatistics {
  total_events: number;
  events_by_type: Record<AuditEventType, number>;
  events_by_severity: Record<AuditSeverity, number>;
  events_by_user: Record<string, number>;
  suspicious_activities: number;
  failed_access_attempts: number;
  date_range: {
    start: Date;
    end: Date;
  };
}

/**
 * Sistema principal de auditoria
 */
export class AuditSystem {
  private readonly supabase = createClient();
  private readonly encryptionKey: string;

  constructor() {
    this.encryptionKey =
      process.env.AUDIT_ENCRYPTION_KEY || 'default-key-change-in-production';
  }

  /**
   * Registra um evento de auditoria
   */
  async logEvent(
    event: Omit<AuditEvent, 'id' | 'timestamp' | 'checksum'>
  ): Promise<void> {
    try {
      const auditEvent: AuditEvent = {
        ...event,
        timestamp: new Date(),
        checksum: this.generateChecksum(event),
      };

      // Criptografa dados sensíveis
      if (auditEvent.old_values) {
        auditEvent.old_values = this.encryptSensitiveData(
          auditEvent.old_values
        );
      }
      if (auditEvent.new_values) {
        auditEvent.new_values = this.encryptSensitiveData(
          auditEvent.new_values
        );
      }

      // Salva no banco de dados
      const { error } = await this.supabase
        .from('audit_logs')
        .insert(auditEvent);

      if (error) {
        console.error('Erro ao salvar evento de auditoria:', error);
        // Fallback: salva em arquivo local
        await this.saveToLocalFile(auditEvent);
      }

      // Verifica se é uma atividade suspeita
      if (this.isSuspiciousActivity(auditEvent)) {
        await this.handleSuspiciousActivity(auditEvent);
      }
    } catch (error) {
      console.error('Erro no sistema de auditoria:', error);
      // Não deve falhar silenciosamente
      throw new Error('Falha crítica no sistema de auditoria');
    }
  }

  /**
   * Consulta eventos de auditoria
   */
  async queryEvents(filters: AuditQueryFilters): Promise<AuditEvent[]> {
    try {
      let query = this.supabase
        .from('audit_logs')
        .select('*')
        .order('timestamp', { ascending: false });

      // Aplica filtros
      if (filters.event_types?.length) {
        query = query.in('event_type', filters.event_types);
      }
      if (filters.severity?.length) {
        query = query.in('severity', filters.severity);
      }
      if (filters.user_id) {
        query = query.eq('user_id', filters.user_id);
      }
      if (filters.clinic_id) {
        query = query.eq('clinic_id', filters.clinic_id);
      }
      if (filters.resource_type) {
        query = query.eq('resource_type', filters.resource_type);
      }
      if (filters.resource_id) {
        query = query.eq('resource_id', filters.resource_id);
      }
      if (filters.start_date) {
        query = query.gte('timestamp', filters.start_date.toISOString());
      }
      if (filters.end_date) {
        query = query.lte('timestamp', filters.end_date.toISOString());
      }
      if (filters.ip_address) {
        query = query.eq('ip_address', filters.ip_address);
      }

      // Paginação
      if (filters.limit) {
        query = query.limit(filters.limit);
      }
      if (filters.offset) {
        query = query.range(
          filters.offset,
          filters.offset + (filters.limit || 50) - 1
        );
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Erro ao consultar eventos: ${error.message}`);
      }

      // Descriptografa dados sensíveis
      return (
        data?.map((event) => ({
          ...event,
          old_values: event.old_values
            ? this.decryptSensitiveData(event.old_values)
            : undefined,
          new_values: event.new_values
            ? this.decryptSensitiveData(event.new_values)
            : undefined,
        })) || []
      );
    } catch (error) {
      console.error('Erro ao consultar eventos de auditoria:', error);
      throw error;
    }
  }

  /**
   * Gera relatório de auditoria
   */
  async generateReport(
    title: string,
    description: string,
    filters: AuditQueryFilters,
    generatedBy: string
  ): Promise<AuditReport> {
    try {
      const events = await this.queryEvents(filters);

      const report: AuditReport = {
        id: crypto.randomUUID(),
        title,
        description,
        filters,
        events,
        generated_at: new Date(),
        generated_by: generatedBy,
        total_events: events.length,
      };

      // Salva o relatório
      const { error } = await this.supabase.from('audit_reports').insert({
        id: report.id,
        title: report.title,
        description: report.description,
        filters: report.filters,
        generated_at: report.generated_at,
        generated_by: report.generated_by,
        total_events: report.total_events,
      });

      if (error) {
        console.error('Erro ao salvar relatório:', error);
      }

      return report;
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      throw error;
    }
  }

  /**
   * Obtém estatísticas de auditoria
   */
  async getStatistics(
    filters: Partial<AuditQueryFilters>
  ): Promise<AuditStatistics> {
    try {
      const events = await this.queryEvents(filters as AuditQueryFilters);

      const stats: AuditStatistics = {
        total_events: events.length,
        events_by_type: {} as Record<AuditEventType, number>,
        events_by_severity: {} as Record<AuditSeverity, number>,
        events_by_user: {},
        suspicious_activities: 0,
        failed_access_attempts: 0,
        date_range: {
          start:
            filters.start_date ||
            new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          end: filters.end_date || new Date(),
        },
      };

      // Processa estatísticas
      events.forEach((event) => {
        // Por tipo
        stats.events_by_type[event.event_type] =
          (stats.events_by_type[event.event_type] || 0) + 1;

        // Por severidade
        stats.events_by_severity[event.severity] =
          (stats.events_by_severity[event.severity] || 0) + 1;

        // Por usuário
        if (event.user_id) {
          stats.events_by_user[event.user_id] =
            (stats.events_by_user[event.user_id] || 0) + 1;
        }

        // Atividades suspeitas
        if (
          event.event_type.includes('security.suspicious') ||
          event.event_type.includes('security.violation')
        ) {
          stats.suspicious_activities++;
        }

        // Tentativas de acesso falhadas
        if (
          event.event_type.includes('failed_access') ||
          event.event_type === AuditEventType.LOGIN_FAILED
        ) {
          stats.failed_access_attempts++;
        }
      });

      return stats;
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      throw error;
    }
  }

  /**
   * Arquiva logs antigos
   */
  async archiveOldLogs(retentionDays = 365): Promise<number> {
    try {
      const cutoffDate = new Date(
        Date.now() - retentionDays * 24 * 60 * 60 * 1000
      );

      // Move logs antigos para tabela de arquivo
      const { data: oldLogs, error: selectError } = await this.supabase
        .from('audit_logs')
        .select('*')
        .lt('timestamp', cutoffDate.toISOString());

      if (selectError) {
        throw new Error(
          `Erro ao selecionar logs antigos: ${selectError.message}`
        );
      }

      if (!oldLogs || oldLogs.length === 0) {
        return 0;
      }

      // Insere na tabela de arquivo
      const { error: insertError } = await this.supabase
        .from('audit_logs_archive')
        .insert(oldLogs);

      if (insertError) {
        throw new Error(`Erro ao arquivar logs: ${insertError.message}`);
      }

      // Remove da tabela principal
      const { error: deleteError } = await this.supabase
        .from('audit_logs')
        .delete()
        .lt('timestamp', cutoffDate.toISOString());

      if (deleteError) {
        throw new Error(
          `Erro ao deletar logs arquivados: ${deleteError.message}`
        );
      }

      return oldLogs.length;
    } catch (error) {
      console.error('Erro ao arquivar logs:', error);
      throw error;
    }
  }

  /**
   * Verifica integridade dos logs
   */
  async verifyIntegrity(): Promise<{
    valid: number;
    invalid: number;
    errors: string[];
  }> {
    try {
      const { data: logs, error } = await this.supabase
        .from('audit_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(1000);

      if (error) {
        throw new Error(`Erro ao verificar integridade: ${error.message}`);
      }

      let valid = 0;
      let invalid = 0;
      const errors: string[] = [];

      logs?.forEach((log) => {
        const expectedChecksum = this.generateChecksum({
          event_type: log.event_type,
          severity: log.severity,
          user_id: log.user_id,
          clinic_id: log.clinic_id,
          session_id: log.session_id,
          ip_address: log.ip_address,
          user_agent: log.user_agent,
          resource_type: log.resource_type,
          resource_id: log.resource_id,
          old_values: log.old_values,
          new_values: log.new_values,
          metadata: log.metadata,
          description: log.description,
        });

        if (log.checksum === expectedChecksum) {
          valid++;
        } else {
          invalid++;
          errors.push(`Log ${log.id}: checksum inválido`);
        }
      });

      return { valid, invalid, errors };
    } catch (error) {
      console.error('Erro ao verificar integridade:', error);
      throw error;
    }
  }

  /**
   * Gera checksum para integridade
   */
  private generateChecksum(data: any): string {
    const content = JSON.stringify(data, Object.keys(data).sort());
    return crypto
      .createHash('sha256')
      .update(content + this.encryptionKey)
      .digest('hex');
  }

  /**
   * Criptografa dados sensíveis
   */
  private encryptSensitiveData(data: Record<string, any>): Record<string, any> {
    const sensitiveFields = [
      'cpf',
      'email',
      'phone',
      'address',
      'medical_data',
    ];
    const encrypted = { ...data };

    Object.keys(encrypted).forEach((key) => {
      if (sensitiveFields.some((field) => key.toLowerCase().includes(field))) {
        const cipher = crypto.createCipher('aes-256-cbc', this.encryptionKey);
        let encryptedValue = cipher.update(
          JSON.stringify(encrypted[key]),
          'utf8',
          'hex'
        );
        encryptedValue += cipher.final('hex');
        encrypted[key] = `encrypted:${encryptedValue}`;
      }
    });

    return encrypted;
  }

  /**
   * Descriptografa dados sensíveis
   */
  private decryptSensitiveData(data: Record<string, any>): Record<string, any> {
    const decrypted = { ...data };

    Object.keys(decrypted).forEach((key) => {
      if (
        typeof decrypted[key] === 'string' &&
        decrypted[key].startsWith('encrypted:')
      ) {
        try {
          const encryptedValue = decrypted[key].replace('encrypted:', '');
          const decipher = crypto.createDecipher(
            'aes-256-cbc',
            this.encryptionKey
          );
          let decryptedValue = decipher.update(encryptedValue, 'hex', 'utf8');
          decryptedValue += decipher.final('utf8');
          decrypted[key] = JSON.parse(decryptedValue);
        } catch (error) {
          console.error('Erro ao descriptografar:', error);
          decrypted[key] = '[ERRO_DESCRIPTOGRAFIA]';
        }
      }
    });

    return decrypted;
  }

  /**
   * Verifica se é uma atividade suspeita
   */
  private isSuspiciousActivity(event: AuditEvent): boolean {
    const suspiciousPatterns = [
      AuditEventType.SECURITY_VIOLATION,
      AuditEventType.SUSPICIOUS_ACTIVITY,
      AuditEventType.SESSION_HIJACK_ATTEMPT,
      AuditEventType.FAILED_ACCESS_ATTEMPT,
    ];

    return (
      suspiciousPatterns.includes(event.event_type) ||
      event.severity === AuditSeverity.CRITICAL
    );
  }

  /**
   * Trata atividades suspeitas
   */
  private async handleSuspiciousActivity(event: AuditEvent): Promise<void> {
    try {
      // Registra alerta de segurança
      await this.supabase.from('security_alerts').insert({
        event_id: event.id,
        alert_type: 'suspicious_activity',
        severity: event.severity,
        description: `Atividade suspeita detectada: ${event.description}`,
        user_id: event.user_id,
        ip_address: event.ip_address,
        created_at: new Date().toISOString(),
      });

      // TODO: Implementar notificações em tempo real
      // TODO: Implementar bloqueio automático se necessário
    } catch (error) {
      console.error('Erro ao tratar atividade suspeita:', error);
    }
  }

  /**
   * Salva evento em arquivo local como fallback
   */
  private async saveToLocalFile(event: AuditEvent): Promise<void> {
    try {
      const fs = await import('node:fs/promises');
      const path = await import('node:path');

      const logDir = path.join(process.cwd(), 'logs', 'audit');
      const logFile = path.join(
        logDir,
        `audit-${new Date().toISOString().split('T')[0]}.log`
      );

      // Cria diretório se não existir
      await fs.mkdir(logDir, { recursive: true });

      // Adiciona ao arquivo
      const logEntry = `${new Date().toISOString()} - ${JSON.stringify(event)}\n`;
      await fs.appendFile(logFile, logEntry);
    } catch (error) {
      console.error('Erro ao salvar em arquivo local:', error);
    }
  }
}

// Instância singleton
export const auditSystem = new AuditSystem();

// Helper functions para uso fácil
export const logAuditEvent = (
  event: Omit<AuditEvent, 'id' | 'timestamp' | 'checksum'>
) => auditSystem.logEvent(event);

export const queryAuditEvents = (filters: AuditQueryFilters) =>
  auditSystem.queryEvents(filters);

export const generateAuditReport = (
  title: string,
  description: string,
  filters: AuditQueryFilters,
  generatedBy: string
) => auditSystem.generateReport(title, description, filters, generatedBy);

export const getAuditStatistics = (filters: Partial<AuditQueryFilters>) =>
  auditSystem.getStatistics(filters);
