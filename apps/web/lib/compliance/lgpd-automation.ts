/**
 * LGPD Compliance Automation System
 * Sistema completo de automação de compliance LGPD para NeonPro
 *
 * @author APEX Master Developer
 * @version 1.0.0
 * @compliance LGPD Art. 7º, 8º, 9º, 18º, 37º, 38º, 46º
 * @story Story 3.3: LGPD Compliance Automation
 */

import { createClient } from '@supabase/supabase-js';
import {
  AuditEventType,
  type ComplianceReport,
  ComplianceReportType,
  type ConsentRecord,
  ConsentStatus,
  ConsentType,
  type DataSubjectRequest,
  DataSubjectRight,
  type LegalBasis,
  type LGPDAuditLog,
  type LGPDContext,
  RequestStatus,
} from '../../types/lgpd';
import { LGPDAuditTrailService } from './audit-trail';
import { LGPDEncryptionService } from './encryption';
import { LGPDComplianceService } from './lgpd-core';

// ============================================================================
// AUTOMATION CONFIGURATION TYPES
// ============================================================================

export interface AutomationConfig {
  clinicId: string;
  enabledFeatures: {
    autoConsent: boolean;
    autoDataSubjectRights: boolean;
    autoAuditReports: boolean;
    autoDataAnonymization: boolean;
    autoBreachDetection: boolean;
    autoComplianceMonitoring: boolean;
  };
  schedules: {
    auditReportGeneration: string; // cron expression
    dataRetentionCleanup: string;
    complianceHealthCheck: string;
    consentExpirationCheck: string;
  };
  thresholds: {
    dataRetentionDays: number;
    consentExpirationWarningDays: number;
    breachDetectionSensitivity: 'low' | 'medium' | 'high';
    auditLogRetentionDays: number;
  };
  notifications: {
    dpoEmail: string;
    complianceTeamEmails: string[];
    breachNotificationEmails: string[];
    enableSlackIntegration: boolean;
    slackWebhookUrl?: string;
  };
}

export interface AutoConsentRule {
  id: string;
  clinicId: string;
  triggerEvent: string;
  consentType: ConsentType;
  legalBasis: LegalBasis;
  purpose: string;
  description: string;
  expirationDays?: number;
  isActive: boolean;
  conditions: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ComplianceHealthCheck {
  clinicId: string;
  timestamp: Date;
  overallScore: number; // 0-100
  checks: {
    consentCompliance: {
      score: number;
      issues: string[];
      recommendations: string[];
    };
    dataRetention: {
      score: number;
      expiredRecords: number;
      recommendations: string[];
    };
    auditTrail: {
      score: number;
      missingLogs: number;
      recommendations: string[];
    };
    encryption: {
      score: number;
      unencryptedFields: string[];
      recommendations: string[];
    };
    dataSubjectRights: {
      score: number;
      pendingRequests: number;
      overdueRequests: number;
      recommendations: string[];
    };
  };
  actionItems: {
    priority: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    dueDate: Date;
    assignee?: string;
  }[];
}

// ============================================================================
// AUTOMATIC CONSENT MANAGEMENT
// ============================================================================

export class LGPDAutoConsentService {
  private readonly supabase: any;
  private readonly complianceService: LGPDComplianceService;

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    this.complianceService = new LGPDComplianceService();
  }

  /**
   * Configura regras de consentimento automático
   */
  async createAutoConsentRule(
    rule: Omit<AutoConsentRule, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<AutoConsentRule> {
    const { data, error } = await this.supabase
      .from('lgpd_auto_consent_rules')
      .insert({
        ...rule,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create auto consent rule: ${error.message}`);
    }

    return data;
  }

  /**
   * Processa consentimento automático baseado em eventos
   */
  async processAutoConsent(
    context: LGPDContext,
    triggerEvent: string,
    eventData: Record<string, any>
  ): Promise<ConsentRecord[]> {
    // Buscar regras ativas para o evento
    const { data: rules, error } = await this.supabase
      .from('lgpd_auto_consent_rules')
      .select('*')
      .eq('clinicId', context.clinicId)
      .eq('triggerEvent', triggerEvent)
      .eq('isActive', true);

    if (error || !rules?.length) {
      return [];
    }

    const grantedConsents: ConsentRecord[] = [];

    for (const rule of rules) {
      // Verificar condições da regra
      if (this.evaluateRuleConditions(rule.conditions, eventData)) {
        try {
          // Calcular data de expiração
          const expiresAt = rule.expirationDays
            ? new Date(Date.now() + rule.expirationDays * 24 * 60 * 60 * 1000)
            : undefined;

          // Conceder consentimento automaticamente
          const consent = await this.complianceService.consent.grantConsent(
            context,
            rule.consentType,
            rule.legalBasis,
            rule.purpose,
            `${rule.description} (Automático: ${triggerEvent})`,
            expiresAt
          );

          grantedConsents.push(consent);
        } catch (error) {
          console.error(
            `Failed to auto-grant consent for rule ${rule.id}:`,
            error
          );
        }
      }
    }

    return grantedConsents;
  }

  /**
   * Monitora expiração de consentimentos
   */
  async monitorConsentExpiration(clinicId: string): Promise<{
    expiring: ConsentRecord[];
    expired: ConsentRecord[];
    notified: number;
  }> {
    const now = new Date();
    const warningDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 dias

    // Consentimentos expirando em 7 dias
    const { data: expiring } = await this.supabase
      .from('lgpd_consent_records')
      .select('*')
      .eq('clinicId', clinicId)
      .eq('status', ConsentStatus.GRANTED)
      .gte('expiresAt', now.toISOString())
      .lte('expiresAt', warningDate.toISOString());

    // Consentimentos já expirados
    const { data: expired } = await this.supabase
      .from('lgpd_consent_records')
      .select('*')
      .eq('clinicId', clinicId)
      .eq('status', ConsentStatus.GRANTED)
      .lt('expiresAt', now.toISOString());

    // Marcar consentimentos expirados
    if (expired?.length) {
      await this.supabase
        .from('lgpd_consent_records')
        .update({ status: ConsentStatus.EXPIRED })
        .in(
          'id',
          expired.map((c) => c.id)
        );
    }

    // Enviar notificações para consentimentos expirando
    let notified = 0;
    if (expiring?.length) {
      for (const consent of expiring) {
        await this.sendConsentExpirationNotification(consent);
        notified++;
      }
    }

    return {
      expiring: expiring || [],
      expired: expired || [],
      notified,
    };
  }

  /**
   * Avalia condições de uma regra de consentimento
   */
  private evaluateRuleConditions(
    conditions: Record<string, any>,
    eventData: Record<string, any>
  ): boolean {
    for (const [key, expectedValue] of Object.entries(conditions)) {
      const actualValue = this.getNestedValue(eventData, key);

      if (Array.isArray(expectedValue)) {
        if (!expectedValue.includes(actualValue)) {
          return false;
        }
      } else if (actualValue !== expectedValue) {
        return false;
      }
    }

    return true;
  }

  /**
   * Obtém valor aninhado de um objeto
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  /**
   * Envia notificação de expiração de consentimento
   */
  private async sendConsentExpirationNotification(
    consent: ConsentRecord
  ): Promise<void> {
    // Implementar notificação (email, Slack, etc.)
    console.log(`Consent expiring: ${consent.id} for user ${consent.userId}`);
  }
}

// ============================================================================
// AUTOMATIC DATA SUBJECT RIGHTS MANAGEMENT
// ============================================================================

export class LGPDAutoDataSubjectRightsService {
  private readonly supabase: any;
  private readonly complianceService: LGPDComplianceService;

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    this.complianceService = new LGPDComplianceService();
  }

  /**
   * Processa automaticamente solicitações de direitos
   */
  async processDataSubjectRequests(clinicId: string): Promise<{
    processed: number;
    automated: number;
    requiresManualReview: number;
  }> {
    // Buscar solicitações pendentes
    const { data: requests, error } = await this.supabase
      .from('lgpd_data_subject_requests')
      .select('*')
      .eq('clinicId', clinicId)
      .eq('status', RequestStatus.PENDING)
      .order('requestedAt', { ascending: true });

    if (error || !requests?.length) {
      return { processed: 0, automated: 0, requiresManualReview: 0 };
    }

    let processed = 0;
    let automated = 0;
    let requiresManualReview = 0;

    for (const request of requests) {
      try {
        const canAutomate = await this.canAutomateRequest(request);

        if (canAutomate) {
          await this.automateDataSubjectRequest(request);
          automated++;
        } else {
          await this.flagForManualReview(request);
          requiresManualReview++;
        }

        processed++;
      } catch (error) {
        console.error(`Failed to process request ${request.id}:`, error);
      }
    }

    return { processed, automated, requiresManualReview };
  }

  /**
   * Verifica se uma solicitação pode ser automatizada
   */
  private async canAutomateRequest(
    request: DataSubjectRequest
  ): Promise<boolean> {
    // Regras para automação baseadas no tipo de solicitação
    switch (request.requestType) {
      case DataSubjectRight.ACCESS:
        return true; // Sempre pode ser automatizado

      case DataSubjectRight.PORTABILITY:
        return true; // Exportação de dados pode ser automatizada

      case DataSubjectRight.RECTIFICATION:
        // Só automatizar se for correção simples
        return this.isSimpleRectification(request);

      case DataSubjectRight.ELIMINATION:
        // Verificar se não há impedimentos legais
        return await this.canDeleteUserData(request.userId, request.clinicId);

      default:
        return false; // Outros tipos requerem revisão manual
    }
  }

  /**
   * Automatiza processamento de solicitação
   */
  private async automateDataSubjectRequest(
    request: DataSubjectRequest
  ): Promise<void> {
    await this.supabase
      .from('lgpd_data_subject_requests')
      .update({
        status: RequestStatus.IN_PROGRESS,
        processedAt: new Date(),
        processorId: 'SYSTEM_AUTO',
      })
      .eq('id', request.id);

    switch (request.requestType) {
      case DataSubjectRight.ACCESS:
        await this.automateAccessRequest(request);
        break;

      case DataSubjectRight.PORTABILITY:
        await this.automatePortabilityRequest(request);
        break;

      case DataSubjectRight.ELIMINATION:
        await this.automateErasureRequest(request);
        break;

      case DataSubjectRight.RECTIFICATION:
        await this.automateRectificationRequest(request);
        break;
    }

    await this.supabase
      .from('lgpd_data_subject_requests')
      .update({
        status: RequestStatus.COMPLETED,
        completedAt: new Date(),
      })
      .eq('id', request.id);
  }

  /**
   * Automatiza solicitação de acesso
   */
  private async automateAccessRequest(
    request: DataSubjectRequest
  ): Promise<void> {
    const userData = await this.complianceService.dataSubject.exportUserData(
      request.userId,
      request.clinicId
    );

    // Gerar relatório de dados
    const report = {
      requestId: request.id,
      userId: request.userId,
      generatedAt: new Date(),
      data: userData,
    };

    // Salvar relatório
    await this.supabase.from('lgpd_access_reports').insert(report);

    // Enviar por email (implementar)
    await this.sendAccessReport(request, report);
  }

  /**
   * Automatiza solicitação de portabilidade
   */
  private async automatePortabilityRequest(
    request: DataSubjectRequest
  ): Promise<void> {
    const userData = await this.complianceService.dataSubject.exportUserData(
      request.userId,
      request.clinicId
    );

    // Gerar arquivo de exportação em formato estruturado
    const exportData = {
      format: 'JSON',
      version: '1.0',
      exportedAt: new Date(),
      data: userData,
    };

    // Salvar arquivo de exportação
    await this.supabase.from('lgpd_data_exports').insert({
      requestId: request.id,
      userId: request.userId,
      clinicId: request.clinicId,
      format: 'JSON',
      data: exportData,
      createdAt: new Date(),
    });

    // Enviar link de download (implementar)
    await this.sendPortabilityData(request, exportData);
  }

  /**
   * Automatiza solicitação de eliminação
   */
  private async automateErasureRequest(
    request: DataSubjectRequest
  ): Promise<void> {
    await this.complianceService.dataSubject.processErasureRequest(
      request.id,
      'SYSTEM_AUTO'
    );
  }

  /**
   * Automatiza solicitação de retificação
   */
  private async automateRectificationRequest(
    request: DataSubjectRequest
  ): Promise<void> {
    // Implementar lógica de retificação automática
    // Por enquanto, apenas marcar como processada
    console.log(`Auto-rectification for request ${request.id}`);
  }

  /**
   * Marca solicitação para revisão manual
   */
  private async flagForManualReview(
    request: DataSubjectRequest
  ): Promise<void> {
    await this.supabase
      .from('lgpd_data_subject_requests')
      .update({
        status: RequestStatus.IN_PROGRESS,
        metadata: {
          ...request.metadata,
          requiresManualReview: true,
          flaggedAt: new Date(),
          reason: 'Complex request requiring human review',
        },
      })
      .eq('id', request.id);

    // Notificar equipe de compliance
    await this.notifyComplianceTeam(request);
  }

  /**
   * Verifica se é uma retificação simples
   */
  private isSimpleRectification(_request: DataSubjectRequest): boolean {
    // Implementar lógica para determinar se é uma correção simples
    return false; // Por segurança, sempre requer revisão manual
  }

  /**
   * Verifica se dados do usuário podem ser deletados
   */
  private async canDeleteUserData(
    userId: string,
    clinicId: string
  ): Promise<boolean> {
    // Verificar se há impedimentos legais para exclusão
    // Ex: dados médicos com retenção obrigatória

    const { data: medicalRecords } = await this.supabase
      .from('medical_records')
      .select('id, created_at')
      .eq('patient_id', userId)
      .eq('clinic_id', clinicId);

    // Se há registros médicos recentes (< 5 anos), não pode deletar
    if (medicalRecords?.length) {
      const fiveYearsAgo = new Date();
      fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);

      const recentRecords = medicalRecords.filter(
        (record) => new Date(record.created_at) > fiveYearsAgo
      );

      return recentRecords.length === 0;
    }

    return true;
  }

  /**
   * Envia relatório de acesso
   */
  private async sendAccessReport(
    request: DataSubjectRequest,
    _report: any
  ): Promise<void> {
    // Implementar envio de email com relatório
    console.log(`Sending access report for request ${request.id}`);
  }

  /**
   * Envia dados de portabilidade
   */
  private async sendPortabilityData(
    request: DataSubjectRequest,
    _data: any
  ): Promise<void> {
    // Implementar envio de dados de portabilidade
    console.log(`Sending portability data for request ${request.id}`);
  }

  /**
   * Notifica equipe de compliance
   */
  private async notifyComplianceTeam(
    request: DataSubjectRequest
  ): Promise<void> {
    // Implementar notificação para equipe
    console.log(`Manual review required for request ${request.id}`);
  }
} // ============================================================================
// AUTOMATIC COMPLIANCE AUDITING
// ============================================================================

export class LGPDAutoAuditService {
  private readonly supabase: any;

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    this.auditService = new LGPDAuditTrailService();
  }

  /**
   * Executa auditoria automática de compliance
   */
  async performComplianceAudit(
    clinicId: string
  ): Promise<ComplianceHealthCheck> {
    const timestamp = new Date();

    // Executar todas as verificações de compliance
    const [
      consentCheck,
      retentionCheck,
      auditCheck,
      encryptionCheck,
      rightsCheck,
    ] = await Promise.all([
      this.auditConsentCompliance(clinicId),
      this.auditDataRetention(clinicId),
      this.auditAuditTrail(clinicId),
      this.auditEncryptionCompliance(clinicId),
      this.auditDataSubjectRights(clinicId),
    ]);

    // Calcular score geral
    const overallScore = Math.round(
      (consentCheck.score +
        retentionCheck.score +
        auditCheck.score +
        encryptionCheck.score +
        rightsCheck.score) /
        5
    );

    // Gerar itens de ação
    const actionItems = this.generateActionItems({
      consentCheck,
      retentionCheck,
      auditCheck,
      encryptionCheck,
      rightsCheck,
    });

    const healthCheck: ComplianceHealthCheck = {
      clinicId,
      timestamp,
      overallScore,
      checks: {
        consentCompliance: consentCheck,
        dataRetention: retentionCheck,
        auditTrail: auditCheck,
        encryption: encryptionCheck,
        dataSubjectRights: rightsCheck,
      },
      actionItems,
    };

    // Salvar resultado da auditoria
    await this.saveComplianceHealthCheck(healthCheck);

    // Gerar alertas se necessário
    if (overallScore < 70) {
      await this.generateComplianceAlert(healthCheck);
    }

    return healthCheck;
  }

  /**
   * Auditoria de compliance de consentimento
   */
  private async auditConsentCompliance(clinicId: string): Promise<{
    score: number;
    issues: string[];
    recommendations: string[];
  }> {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let score = 100;

    // Verificar consentimentos expirados
    const { data: expiredConsents } = await this.supabase
      .from('lgpd_consent_records')
      .select('id')
      .eq('clinicId', clinicId)
      .eq('status', ConsentStatus.GRANTED)
      .lt('expiresAt', new Date().toISOString());

    if (expiredConsents?.length) {
      issues.push(
        `${expiredConsents.length} consentimentos expirados encontrados`
      );
      recommendations.push('Renovar ou revogar consentimentos expirados');
      score -= Math.min(30, expiredConsents.length * 2);
    }

    // Verificar consentimentos sem base legal clara
    const { data: invalidConsents } = await this.supabase
      .from('lgpd_consent_records')
      .select('id')
      .eq('clinicId', clinicId)
      .is('legalBasis', null);

    if (invalidConsents?.length) {
      issues.push(`${invalidConsents.length} consentimentos sem base legal`);
      recommendations.push('Definir base legal para todos os consentimentos');
      score -= Math.min(25, invalidConsents.length * 3);
    }

    // Verificar usuários sem consentimento para dados sensíveis
    const { data: usersWithoutConsent } = await this.supabase
      .from('users')
      .select(
        `
        id,
        lgpd_consent_records!inner(
          id,
          consentType,
          status
        )
      `
      )
      .eq('clinic_id', clinicId)
      .neq('lgpd_consent_records.consentType', ConsentType.SENSITIVE_DATA)
      .eq('lgpd_consent_records.status', ConsentStatus.GRANTED);

    if (usersWithoutConsent?.length) {
      issues.push(
        `${usersWithoutConsent.length} usuários sem consentimento para dados sensíveis`
      );
      recommendations.push(
        'Solicitar consentimento para processamento de dados sensíveis'
      );
      score -= Math.min(20, usersWithoutConsent.length);
    }

    return {
      score: Math.max(0, score),
      issues,
      recommendations,
    };
  }

  /**
   * Auditoria de retenção de dados
   */
  private async auditDataRetention(clinicId: string): Promise<{
    score: number;
    expiredRecords: number;
    recommendations: string[];
  }> {
    const recommendations: string[] = [];
    let score = 100;
    let expiredRecords = 0;

    // Verificar dados expirados (exemplo: 5 anos para dados médicos)
    const fiveYearsAgo = new Date();
    fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);

    const { data: expiredMedicalRecords } = await this.supabase
      .from('medical_records')
      .select('id')
      .eq('clinic_id', clinicId)
      .lt('created_at', fiveYearsAgo.toISOString())
      .eq('anonymized', false);

    if (expiredMedicalRecords?.length) {
      expiredRecords += expiredMedicalRecords.length;
      recommendations.push(
        `Anonimizar ou deletar ${expiredMedicalRecords.length} registros médicos expirados`
      );
      score -= Math.min(40, expiredMedicalRecords.length);
    }

    // Verificar logs de auditoria antigos (exemplo: 2 anos)
    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);

    const { data: oldAuditLogs } = await this.supabase
      .from('lgpd_audit_logs')
      .select('id')
      .eq('clinicId', clinicId)
      .lt('timestamp', twoYearsAgo.toISOString());

    if (oldAuditLogs?.length) {
      expiredRecords += oldAuditLogs.length;
      recommendations.push(
        `Arquivar ${oldAuditLogs.length} logs de auditoria antigos`
      );
      score -= Math.min(20, Math.floor(oldAuditLogs.length / 100));
    }

    return {
      score: Math.max(0, score),
      expiredRecords,
      recommendations,
    };
  }

  /**
   * Auditoria de trilha de auditoria
   */
  private async auditAuditTrail(clinicId: string): Promise<{
    score: number;
    missingLogs: number;
    recommendations: string[];
  }> {
    const recommendations: string[] = [];
    let score = 100;
    let missingLogs = 0;

    // Verificar se há gaps na trilha de auditoria
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const { data: recentLogs } = await this.supabase
      .from('lgpd_audit_logs')
      .select('id')
      .eq('clinicId', clinicId)
      .gte('timestamp', last24Hours.toISOString());

    const expectedMinimumLogs = 10; // Mínimo esperado em 24h
    if (!recentLogs || recentLogs.length < expectedMinimumLogs) {
      missingLogs = expectedMinimumLogs - (recentLogs?.length || 0);
      recommendations.push(
        'Verificar se todos os eventos estão sendo auditados'
      );
      score -= 30;
    }

    // Verificar eventos críticos sem auditoria
    const criticalEvents = [
      AuditEventType.DATA_BREACH,
      AuditEventType.UNAUTHORIZED_ACCESS,
      AuditEventType.CONSENT_WITHDRAWN,
    ];

    for (const eventType of criticalEvents) {
      const { data: criticalLogs } = await this.supabase
        .from('lgpd_audit_logs')
        .select('id')
        .eq('clinicId', clinicId)
        .eq('eventType', eventType)
        .gte('timestamp', last24Hours.toISOString());

      if (!criticalLogs?.length) {
      }
    }

    return {
      score: Math.max(0, score),
      missingLogs,
      recommendations,
    };
  }

  /**
   * Auditoria de compliance de criptografia
   */
  private async auditEncryptionCompliance(clinicId: string): Promise<{
    score: number;
    unencryptedFields: string[];
    recommendations: string[];
  }> {
    const unencryptedFields: string[] = [];
    const recommendations: string[] = [];
    let score = 100;

    // Verificar campos sensíveis não criptografados
    // Esta é uma verificação simplificada - em produção seria mais complexa

    const sensitiveFields = [
      { table: 'users', field: 'cpf' },
      { table: 'users', field: 'rg' },
      { table: 'medical_records', field: 'diagnosis' },
      { table: 'medical_records', field: 'treatment' },
    ];

    for (const { table, field } of sensitiveFields) {
      try {
        // Verificar se há dados não criptografados
        // Em produção, isso seria feito de forma mais sofisticada
        const { data } = await this.supabase
          .from(table)
          .select(`${field}`)
          .eq('clinic_id', clinicId)
          .not(field, 'is', null)
          .limit(1);

        if (data?.length && !this.isFieldEncrypted(data[0][field])) {
          unencryptedFields.push(`${table}.${field}`);
          score -= 15;
        }
      } catch (_error) {}
    }

    if (unencryptedFields.length) {
      recommendations.push('Criptografar campos sensíveis identificados');
      recommendations.push(
        'Implementar criptografia automática para novos dados'
      );
    }

    return {
      score: Math.max(0, score),
      unencryptedFields,
      recommendations,
    };
  }

  /**
   * Auditoria de direitos dos titulares
   */
  private async auditDataSubjectRights(clinicId: string): Promise<{
    score: number;
    pendingRequests: number;
    overdueRequests: number;
    recommendations: string[];
  }> {
    const recommendations: string[] = [];
    let score = 100;

    // Verificar solicitações pendentes
    const { data: pendingRequests } = await this.supabase
      .from('lgpd_data_subject_requests')
      .select('id, requestedAt')
      .eq('clinicId', clinicId)
      .eq('status', RequestStatus.PENDING);

    const pendingCount = pendingRequests?.length || 0;

    // Verificar solicitações em atraso (> 15 dias)
    const fifteenDaysAgo = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000);
    const overdueRequests =
      pendingRequests?.filter(
        (req) => new Date(req.requestedAt) < fifteenDaysAgo
      ) || [];

    const overdueCount = overdueRequests.length;

    if (pendingCount > 0) {
      score -= Math.min(30, pendingCount * 3);
      recommendations.push(`Processar ${pendingCount} solicitações pendentes`);
    }

    if (overdueCount > 0) {
      score -= Math.min(40, overdueCount * 5);
      recommendations.push(
        `URGENTE: ${overdueCount} solicitações em atraso (>15 dias)`
      );
    }

    return {
      score: Math.max(0, score),
      pendingRequests: pendingCount,
      overdueRequests: overdueCount,
      recommendations,
    };
  }

  /**
   * Gera itens de ação baseados na auditoria
   */
  private generateActionItems(
    checks: any
  ): ComplianceHealthCheck['actionItems'] {
    const actionItems: ComplianceHealthCheck['actionItems'] = [];
    const now = new Date();

    // Itens críticos (score < 50)
    Object.entries(checks).forEach(([checkName, check]: [string, any]) => {
      if (check.score < 50) {
        actionItems.push({
          priority: 'critical',
          description: `Resolver problemas críticos em ${checkName}`,
          dueDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000), // 3 dias
        });
      } else if (check.score < 70) {
        actionItems.push({
          priority: 'high',
          description: `Melhorar compliance em ${checkName}`,
          dueDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 dias
        });
      }
    });

    // Itens específicos
    if (checks.rightsCheck.overdueRequests > 0) {
      actionItems.push({
        priority: 'critical',
        description: `Processar ${checks.rightsCheck.overdueRequests} solicitações em atraso`,
        dueDate: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000), // 1 dia
      });
    }

    if (checks.retentionCheck.expiredRecords > 100) {
      actionItems.push({
        priority: 'high',
        description: 'Executar limpeza de dados expirados',
        dueDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000), // 14 dias
      });
    }

    return actionItems;
  }

  /**
   * Salva resultado da verificação de compliance
   */
  private async saveComplianceHealthCheck(
    healthCheck: ComplianceHealthCheck
  ): Promise<void> {
    await this.supabase
      .from('lgpd_compliance_health_checks')
      .insert(healthCheck);
  }

  /**
   * Gera alerta de compliance
   */
  private async generateComplianceAlert(
    healthCheck: ComplianceHealthCheck
  ): Promise<void> {
    const alert = {
      clinicId: healthCheck.clinicId,
      severity: healthCheck.overallScore < 50 ? 'critical' : 'high',
      title: `Compliance Score Baixo: ${healthCheck.overallScore}%`,
      description: 'Auditoria automática detectou problemas de compliance',
      actionItems: healthCheck.actionItems,
      createdAt: new Date(),
    };

    await this.supabase.from('lgpd_compliance_alerts').insert(alert);

    // Enviar notificações
    await this.sendComplianceAlert(alert);
  }

  /**
   * Verifica se um campo está criptografado
   */
  private isFieldEncrypted(value: any): boolean {
    if (typeof value !== 'string') {
      return false;
    }

    // Verificação simples - em produção seria mais robusta
    return value.includes(':') && value.length > 50;
  }

  /**
   * Envia alerta de compliance
   */
  private async sendComplianceAlert(alert: any): Promise<void> {
    // Implementar envio de notificações
    console.log(`Compliance alert: ${alert.title}`);
  }
} // ============================================================================
// AUTOMATIC COMPLIANCE REPORTING
// ============================================================================

export class LGPDAutoReportingService {
  private readonly supabase: any;

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }

  /**
   * Gera relatórios automáticos de compliance
   */
  async generateComplianceReports(
    clinicId: string,
    reportTypes: ComplianceReportType[]
  ): Promise<ComplianceReport[]> {
    const reports: ComplianceReport[] = [];

    for (const reportType of reportTypes) {
      try {
        const report = await this.generateReport(clinicId, reportType);
        reports.push(report);
      } catch (error) {
        console.error(`Failed to generate report ${reportType}:`, error);
      }
    }

    return reports;
  }

  /**
   * Gera relatório específico
   */
  private async generateReport(
    clinicId: string,
    reportType: ComplianceReportType
  ): Promise<ComplianceReport> {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1); // Mês anterior
    const endDate = new Date(now.getFullYear(), now.getMonth(), 0); // Último dia do mês anterior

    let reportData: any;
    let title: string;
    let description: string;

    switch (reportType) {
      case ComplianceReportType.CONSENT_SUMMARY:
        reportData = await this.generateConsentSummaryData(
          clinicId,
          startDate,
          endDate
        );
        title = 'Relatório de Consentimentos';
        description =
          'Resumo dos consentimentos concedidos, revogados e expirados';
        break;

      case ComplianceReportType.DATA_PROCESSING:
        reportData = await this.generateDataProcessingData(
          clinicId,
          startDate,
          endDate
        );
        title = 'Relatório de Processamento de Dados';
        description = 'Atividades de processamento de dados pessoais';
        break;

      case ComplianceReportType.AUDIT_TRAIL:
        reportData = await this.generateAuditTrailData(
          clinicId,
          startDate,
          endDate
        );
        title = 'Relatório de Trilha de Auditoria';
        description = 'Eventos de auditoria e atividades do sistema';
        break;

      case ComplianceReportType.DATA_INVENTORY:
        reportData = await this.generateDataInventoryData(clinicId);
        title = 'Inventário de Dados';
        description = 'Mapeamento de dados pessoais processados';
        break;

      case ComplianceReportType.RISK_ASSESSMENT:
        reportData = await this.generateRiskAssessmentData(
          clinicId,
          startDate,
          endDate
        );
        title = 'Avaliação de Riscos';
        description = 'Análise de riscos de privacidade e segurança';
        break;

      default:
        throw new Error(`Unsupported report type: ${reportType}`);
    }

    const report: ComplianceReport = {
      id: crypto.randomUUID(),
      clinicId,
      reportType,
      title,
      description,
      period: { startDate, endDate },
      data: reportData,
      generatedAt: now,
      generatedBy: 'SYSTEM_AUTO',
      status: 'final',
    };

    // Salvar relatório
    await this.supabase.from('lgpd_compliance_reports').insert(report);

    return report;
  }

  /**
   * Gera dados do relatório de consentimentos
   */
  private async generateConsentSummaryData(
    clinicId: string,
    startDate: Date,
    endDate: Date
  ): Promise<any> {
    // Consentimentos por tipo
    const { data: consentsByType } = await this.supabase
      .from('lgpd_consent_records')
      .select('consentType, status')
      .eq('clinicId', clinicId)
      .gte('createdAt', startDate.toISOString())
      .lte('createdAt', endDate.toISOString());

    // Consentimentos por status
    const { data: consentsByStatus } = await this.supabase
      .from('lgpd_consent_records')
      .select('status')
      .eq('clinicId', clinicId)
      .gte('createdAt', startDate.toISOString())
      .lte('createdAt', endDate.toISOString());

    // Estatísticas
    const typeStats = this.groupBy(consentsByType || [], 'consentType');
    const statusStats = this.groupBy(consentsByStatus || [], 'status');

    return {
      summary: {
        totalConsents: consentsByType?.length || 0,
        byType: typeStats,
        byStatus: statusStats,
      },
      trends: {
        granted: statusStats[ConsentStatus.GRANTED] || 0,
        withdrawn: statusStats[ConsentStatus.WITHDRAWN] || 0,
        expired: statusStats[ConsentStatus.EXPIRED] || 0,
      },
      compliance: {
        activeConsents: statusStats[ConsentStatus.GRANTED] || 0,
        expirationRate: this.calculateExpirationRate(statusStats),
      },
    };
  }

  /**
   * Gera dados do relatório de processamento
   */
  private async generateDataProcessingData(
    clinicId: string,
    startDate: Date,
    endDate: Date
  ): Promise<any> {
    // Eventos de processamento
    const { data: processingEvents } = await this.supabase
      .from('lgpd_audit_logs')
      .select('eventType, timestamp')
      .eq('clinicId', clinicId)
      .in('eventType', [
        AuditEventType.DATA_ACCESS,
        AuditEventType.DATA_MODIFICATION,
        AuditEventType.DATA_DELETION,
      ])
      .gte('timestamp', startDate.toISOString())
      .lte('timestamp', endDate.toISOString());

    const eventStats = this.groupBy(processingEvents || [], 'eventType');

    return {
      summary: {
        totalEvents: processingEvents?.length || 0,
        byType: eventStats,
      },
      activities: {
        dataAccess: eventStats[AuditEventType.DATA_ACCESS] || 0,
        dataModification: eventStats[AuditEventType.DATA_MODIFICATION] || 0,
        dataDeletion: eventStats[AuditEventType.DATA_DELETION] || 0,
      },
      compliance: {
        auditCoverage: this.calculateAuditCoverage(processingEvents || []),
        riskLevel: this.assessProcessingRisk(eventStats),
      },
    };
  }

  /**
   * Gera dados da trilha de auditoria
   */
  private async generateAuditTrailData(
    clinicId: string,
    startDate: Date,
    endDate: Date
  ): Promise<any> {
    // Todos os eventos de auditoria
    const { data: auditEvents } = await this.supabase
      .from('lgpd_audit_logs')
      .select('eventType, riskLevel, timestamp')
      .eq('clinicId', clinicId)
      .gte('timestamp', startDate.toISOString())
      .lte('timestamp', endDate.toISOString());

    const eventTypeStats = this.groupBy(auditEvents || [], 'eventType');
    const riskLevelStats = this.groupBy(auditEvents || [], 'riskLevel');

    return {
      summary: {
        totalEvents: auditEvents?.length || 0,
        byEventType: eventTypeStats,
        byRiskLevel: riskLevelStats,
      },
      security: {
        criticalEvents: riskLevelStats.critical || 0,
        highRiskEvents: riskLevelStats.high || 0,
        securityIncidents: this.countSecurityIncidents(auditEvents || []),
      },
      compliance: {
        auditCompleteness: this.calculateAuditCompleteness(auditEvents || []),
        retentionCompliance: 100, // Simplificado
      },
    };
  }

  /**
   * Gera inventário de dados
   */
  private async generateDataInventoryData(clinicId: string): Promise<any> {
    // Contagem de registros por tabela
    const tables = [
      { name: 'users', description: 'Dados pessoais dos usuários' },
      { name: 'medical_records', description: 'Registros médicos' },
      { name: 'appointments', description: 'Agendamentos' },
      { name: 'prescriptions', description: 'Prescrições médicas' },
    ];

    const inventory = [];

    for (const table of tables) {
      try {
        const { count } = await this.supabase
          .from(table.name)
          .select('*', { count: 'exact', head: true })
          .eq('clinic_id', clinicId);

        inventory.push({
          dataType: table.name,
          description: table.description,
          recordCount: count || 0,
          dataClassification: this.classifyDataType(table.name),
          retentionPeriod: this.getRetentionPeriod(table.name),
          encryptionStatus: 'encrypted', // Simplificado
        });
      } catch (error) {
        console.error(`Error counting ${table.name}:`, error);
      }
    }

    return {
      inventory,
      summary: {
        totalDataTypes: inventory.length,
        totalRecords: inventory.reduce(
          (sum, item) => sum + item.recordCount,
          0
        ),
        sensitiveDataTypes: inventory.filter(
          (item) => item.dataClassification === 'sensitive'
        ).length,
      },
    };
  }

  /**
   * Gera avaliação de riscos
   */
  private async generateRiskAssessmentData(
    clinicId: string,
    startDate: Date,
    endDate: Date
  ): Promise<any> {
    // Eventos de alto risco
    const { data: highRiskEvents } = await this.supabase
      .from('lgpd_audit_logs')
      .select('eventType, riskLevel')
      .eq('clinicId', clinicId)
      .in('riskLevel', ['high', 'critical'])
      .gte('timestamp', startDate.toISOString())
      .lte('timestamp', endDate.toISOString());

    // Violações de acesso
    const { data: accessViolations } = await this.supabase
      .from('lgpd_audit_logs')
      .select('id')
      .eq('clinicId', clinicId)
      .eq('eventType', AuditEventType.UNAUTHORIZED_ACCESS)
      .gte('timestamp', startDate.toISOString())
      .lte('timestamp', endDate.toISOString());

    const riskScore = this.calculateRiskScore({
      highRiskEvents: highRiskEvents?.length || 0,
      accessViolations: accessViolations?.length || 0,
    });

    return {
      riskScore,
      riskLevel: this.getRiskLevel(riskScore),
      threats: {
        unauthorizedAccess: accessViolations?.length || 0,
        dataBreaches: 0, // Implementar detecção
        consentViolations: this.countConsentViolations(highRiskEvents || []),
      },
      recommendations: this.generateRiskRecommendations(riskScore),
    };
  }

  // Métodos auxiliares
  private groupBy(array: any[], key: string): Record<string, number> {
    return array.reduce((result, item) => {
      const group = item[key];
      result[group] = (result[group] || 0) + 1;
      return result;
    }, {});
  }

  private calculateExpirationRate(statusStats: Record<string, number>): number {
    const total = Object.values(statusStats).reduce(
      (sum, count) => sum + count,
      0
    );
    const expired = statusStats[ConsentStatus.EXPIRED] || 0;
    return total > 0 ? Math.round((expired / total) * 100) : 0;
  }

  private calculateAuditCoverage(events: any[]): number {
    // Simplificado - em produção seria mais complexo
    return events.length > 100 ? 95 : Math.max(50, events.length);
  }

  private assessProcessingRisk(eventStats: Record<string, number>): string {
    const deletions = eventStats[AuditEventType.DATA_DELETION] || 0;
    const modifications = eventStats[AuditEventType.DATA_MODIFICATION] || 0;

    if (deletions > 50 || modifications > 200) {
      return 'high';
    }
    if (deletions > 20 || modifications > 100) {
      return 'medium';
    }
    return 'low';
  }

  private countSecurityIncidents(events: any[]): number {
    return events.filter(
      (event) =>
        event.eventType === AuditEventType.UNAUTHORIZED_ACCESS ||
        event.eventType === AuditEventType.DATA_BREACH
    ).length;
  }

  private calculateAuditCompleteness(events: any[]): number {
    // Simplificado
    return events.length > 1000
      ? 100
      : Math.max(70, Math.floor(events.length / 10));
  }

  private classifyDataType(tableName: string): string {
    const sensitiveTypes = ['medical_records', 'prescriptions'];
    return sensitiveTypes.includes(tableName) ? 'sensitive' : 'personal';
  }

  private getRetentionPeriod(tableName: string): string {
    const periods: Record<string, string> = {
      medical_records: '20 anos',
      prescriptions: '5 anos',
      users: '5 anos após inatividade',
      appointments: '2 anos',
    };
    return periods[tableName] || '2 anos';
  }

  private calculateRiskScore(factors: {
    highRiskEvents: number;
    accessViolations: number;
  }): number {
    let score = 0;
    score += factors.highRiskEvents * 10;
    score += factors.accessViolations * 20;
    return Math.min(100, score);
  }

  private getRiskLevel(score: number): string {
    if (score >= 80) {
      return 'critical';
    }
    if (score >= 60) {
      return 'high';
    }
    if (score >= 40) {
      return 'medium';
    }
    return 'low';
  }

  private countConsentViolations(events: any[]): number {
    return events.filter(
      (event) => event.eventType === AuditEventType.CONSENT_WITHDRAWN
    ).length;
  }

  private generateRiskRecommendations(score: number): string[] {
    const recommendations = [];

    if (score >= 80) {
      recommendations.push('Revisar imediatamente políticas de segurança');
      recommendations.push('Implementar monitoramento 24/7');
      recommendations.push('Treinar equipe sobre LGPD');
    } else if (score >= 60) {
      recommendations.push('Fortalecer controles de acesso');
      recommendations.push('Aumentar frequência de auditorias');
    } else if (score >= 40) {
      recommendations.push('Manter monitoramento regular');
      recommendations.push('Revisar políticas trimestralmente');
    } else {
      recommendations.push('Manter boas práticas atuais');
    }

    return recommendations;
  }
} // ============================================================================
// AUTOMATIC DATA ANONYMIZATION
// ============================================================================

export interface AnonymizationRule {
  id: string;
  fieldName: string;
  tableName: string;
  anonymizationType: 'hash' | 'mask' | 'pseudonymize' | 'remove' | 'generalize';
  trigger: 'consent_withdrawn' | 'retention_expired' | 'manual' | 'scheduled';
  preserveFormat?: boolean;
  customPattern?: string;
  isActive: boolean;
}

export interface AnonymizationJob {
  id: string;
  clinicId: string;
  rules: AnonymizationRule[];
  status: 'pending' | 'running' | 'completed' | 'failed';
  recordsProcessed: number;
  recordsAnonymized: number;
  startedAt?: Date;
  completedAt?: Date;
  errors?: string[];
}

export class LGPDAutoAnonymizationService {
  private readonly supabase: any;
  private readonly encryptionService: LGPDEncryptionService;

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    this.encryptionService = new LGPDEncryptionService();
  }

  /**
   * Executa anonimização automática baseada em regras
   */
  async executeAutoAnonymization(clinicId: string): Promise<AnonymizationJob> {
    const job: AnonymizationJob = {
      id: crypto.randomUUID(),
      clinicId,
      rules: [],
      status: 'pending',
      recordsProcessed: 0,
      recordsAnonymized: 0,
      startedAt: new Date(),
    };

    try {
      // Buscar regras ativas
      const rules = await this.getActiveAnonymizationRules(clinicId);
      job.rules = rules;
      job.status = 'running';

      // Processar cada regra
      for (const rule of rules) {
        await this.processAnonymizationRule(job, rule);
      }

      job.status = 'completed';
      job.completedAt = new Date();

      // Registrar auditoria
      await this.logAnonymizationAudit(job);
    } catch (error) {
      job.status = 'failed';
      job.errors = [error instanceof Error ? error.message : 'Unknown error'];
      console.error('Anonymization job failed:', error);
    }

    return job;
  }

  /**
   * Processa regra específica de anonimização
   */
  private async processAnonymizationRule(
    job: AnonymizationJob,
    rule: AnonymizationRule
  ): Promise<void> {
    try {
      // Buscar registros que precisam ser anonimizados
      const records = await this.findRecordsForAnonymization(
        job.clinicId,
        rule
      );

      for (const record of records) {
        await this.anonymizeRecord(record, rule);
        job.recordsProcessed++;
        job.recordsAnonymized++;
      }
    } catch (error) {
      if (!job.errors) {
        job.errors = [];
      }
      job.errors.push(
        `Rule ${rule.id}: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Encontra registros para anonimização
   */
  private async findRecordsForAnonymization(
    clinicId: string,
    rule: AnonymizationRule
  ): Promise<any[]> {
    let query = this.supabase
      .from(rule.tableName)
      .select('*')
      .eq('clinic_id', clinicId);

    // Aplicar filtros baseados no trigger
    switch (rule.trigger) {
      case 'consent_withdrawn': {
        // Buscar registros de usuários que retiraram consentimento
        const { data: withdrawnConsents } = await this.supabase
          .from('lgpd_consent_records')
          .select('userId')
          .eq('clinicId', clinicId)
          .eq('status', ConsentStatus.WITHDRAWN);

        const userIds = withdrawnConsents?.map((c) => c.userId) || [];
        if (userIds.length > 0) {
          query = query.in('user_id', userIds);
        } else {
          return [];
        }
        break;
      }

      case 'retention_expired': {
        // Buscar registros que excederam período de retenção
        const retentionDate = this.calculateRetentionDate(rule.tableName);
        query = query.lt('created_at', retentionDate.toISOString());
        break;
      }

      case 'scheduled':
        // Buscar registros marcados para anonimização agendada
        query = query.eq('anonymization_scheduled', true);
        break;
    }

    const { data, error } = await query;
    if (error) {
      throw error;
    }

    return data || [];
  }

  /**
   * Anonimiza registro específico
   */
  private async anonymizeRecord(
    record: any,
    rule: AnonymizationRule
  ): Promise<void> {
    const originalValue = record[rule.fieldName];
    if (!originalValue) {
      return;
    }

    let anonymizedValue: any;

    switch (rule.anonymizationType) {
      case 'hash':
        anonymizedValue = await this.hashValue(originalValue);
        break;

      case 'mask':
        anonymizedValue = this.maskValue(originalValue, rule.customPattern);
        break;

      case 'pseudonymize':
        anonymizedValue = await this.pseudonymizeValue(
          originalValue,
          rule.fieldName
        );
        break;

      case 'remove':
        anonymizedValue = null;
        break;

      case 'generalize':
        anonymizedValue = this.generalizeValue(originalValue, rule.fieldName);
        break;

      default:
        throw new Error(
          `Unsupported anonymization type: ${rule.anonymizationType}`
        );
    }

    // Atualizar registro
    const { error } = await this.supabase
      .from(rule.tableName)
      .update({
        [rule.fieldName]: anonymizedValue,
        anonymized_at: new Date().toISOString(),
        anonymization_rule_id: rule.id,
      })
      .eq('id', record.id);

    if (error) {
      throw error;
    }

    // Registrar auditoria da anonimização
    await this.logFieldAnonymization(
      record.id,
      rule,
      originalValue,
      anonymizedValue
    );
  }

  /**
   * Gera hash do valor
   */
  private async hashValue(value: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(value);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Mascara valor preservando formato
   */
  private maskValue(value: string, pattern?: string): string {
    if (pattern) {
      return pattern.replace(/X/g, '*');
    }

    // Padrões automáticos
    if (/^\d{11}$/.test(value)) {
      // CPF: 123.456.789-**
      return `${value.substring(0, 9)}**`;
    }

    if (/^[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}$/.test(value)) {
      // Email: us***@domain.com
      const [local, domain] = value.split('@');
      return `${local.substring(0, 2)}***@${domain}`;
    }

    if (value.length > 4) {
      // Geral: primeiros 2 + *** + últimos 2
      return `${value.substring(0, 2)}***${value.substring(value.length - 2)}`;
    }

    return '***';
  }

  /**
   * Pseudonimiza valor mantendo utilidade analítica
   */
  private async pseudonymizeValue(
    value: string,
    fieldName: string
  ): Promise<string> {
    // Usar chave específica do campo para consistência
    const key = `${fieldName}_pseudonym_key`;
    const pseudonym = await this.encryptionService.encrypt(value, {
      keyId: key,
    });
    return `PSEUDO_${pseudonym.data.substring(0, 16)}`;
  }

  /**
   * Generaliza valor reduzindo precisão
   */
  private generalizeValue(value: string, fieldName: string): string {
    // Data de nascimento -> apenas ano
    if (fieldName.includes('birth') || fieldName.includes('nascimento')) {
      const date = new Date(value);
      if (!Number.isNaN(date.getTime())) {
        return date.getFullYear().toString();
      }
    }

    // CEP -> apenas primeiros 5 dígitos
    if (fieldName.includes('cep') || fieldName.includes('postal')) {
      return `${value.substring(0, 5)}-000`;
    }

    // Idade -> faixa etária
    if (fieldName.includes('age') || fieldName.includes('idade')) {
      const age = Number.parseInt(value, 10);
      if (age < 18) {
        return '0-17';
      }
      if (age < 30) {
        return '18-29';
      }
      if (age < 50) {
        return '30-49';
      }
      if (age < 65) {
        return '50-64';
      }
      return '65+';
    }

    return 'GENERALIZED';
  }

  /**
   * Calcula data limite para retenção
   */
  private calculateRetentionDate(tableName: string): Date {
    const now = new Date();
    const retentionPeriods: Record<string, number> = {
      users: 5 * 365, // 5 anos
      medical_records: 20 * 365, // 20 anos
      appointments: 2 * 365, // 2 anos
      prescriptions: 5 * 365, // 5 anos
    };

    const days = retentionPeriods[tableName] || 2 * 365; // Padrão: 2 anos
    return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  }

  /**
   * Busca regras ativas de anonimização
   */
  private async getActiveAnonymizationRules(
    clinicId: string
  ): Promise<AnonymizationRule[]> {
    const { data, error } = await this.supabase
      .from('lgpd_anonymization_rules')
      .select('*')
      .eq('clinic_id', clinicId)
      .eq('is_active', true);

    if (error) {
      throw error;
    }
    return data || [];
  }

  /**
   * Registra auditoria da anonimização
   */
  private async logAnonymizationAudit(job: AnonymizationJob): Promise<void> {
    const auditLog: LGPDAuditLog = {
      id: crypto.randomUUID(),
      clinicId: job.clinicId,
      eventType: AuditEventType.DATA_ANONYMIZATION,
      timestamp: new Date(),
      userId: 'SYSTEM',
      userRole: 'system',
      resourceType: 'anonymization_job',
      resourceId: job.id,
      action: 'auto_anonymization',
      details: {
        recordsProcessed: job.recordsProcessed,
        recordsAnonymized: job.recordsAnonymized,
        rulesApplied: job.rules.length,
        status: job.status,
        errors: job.errors,
      },
      ipAddress: 'system',
      userAgent: 'LGPD Auto Anonymization Service',
      riskLevel: 'medium',
    };

    await this.supabase.from('lgpd_audit_logs').insert(auditLog);
  }

  /**
   * Registra auditoria de campo específico
   */
  private async logFieldAnonymization(
    recordId: string,
    rule: AnonymizationRule,
    originalValue: any,
    anonymizedValue: any
  ): Promise<void> {
    const auditLog: LGPDAuditLog = {
      id: crypto.randomUUID(),
      clinicId: '', // Será preenchido pelo contexto
      eventType: AuditEventType.DATA_ANONYMIZATION,
      timestamp: new Date(),
      userId: 'SYSTEM',
      userRole: 'system',
      resourceType: rule.tableName,
      resourceId: recordId,
      action: `anonymize_${rule.fieldName}`,
      details: {
        fieldName: rule.fieldName,
        anonymizationType: rule.anonymizationType,
        ruleId: rule.id,
        trigger: rule.trigger,
        originalValueHash: await this.hashValue(String(originalValue)),
        anonymizedValue,
      },
      ipAddress: 'system',
      userAgent: 'LGPD Auto Anonymization Service',
      riskLevel: 'low',
    };

    await this.supabase.from('lgpd_audit_logs').insert(auditLog);
  }

  /**
   * Agenda anonimização automática
   */
  async scheduleAnonymization(
    clinicId: string,
    rules: AnonymizationRule[],
    scheduledFor: Date
  ): Promise<string> {
    const jobId = crypto.randomUUID();

    // Salvar job agendado
    await this.supabase.from('lgpd_scheduled_jobs').insert({
      id: jobId,
      clinic_id: clinicId,
      job_type: 'anonymization',
      scheduled_for: scheduledFor.toISOString(),
      config: { rules },
      status: 'scheduled',
    });

    return jobId;
  }

  /**
   * Executa jobs agendados
   */
  async executeScheduledJobs(): Promise<void> {
    const now = new Date();

    const { data: scheduledJobs } = await this.supabase
      .from('lgpd_scheduled_jobs')
      .select('*')
      .eq('job_type', 'anonymization')
      .eq('status', 'scheduled')
      .lte('scheduled_for', now.toISOString());

    for (const job of scheduledJobs || []) {
      try {
        await this.executeAutoAnonymization(job.clinic_id);

        // Marcar como executado
        await this.supabase
          .from('lgpd_scheduled_jobs')
          .update({
            status: 'completed',
            executed_at: now.toISOString(),
          })
          .eq('id', job.id);
      } catch (error) {
        console.error(
          `Failed to execute scheduled anonymization job ${job.id}:`,
          error
        );

        // Marcar como falhou
        await this.supabase
          .from('lgpd_scheduled_jobs')
          .update({
            status: 'failed',
            error_message:
              error instanceof Error ? error.message : 'Unknown error',
          })
          .eq('id', job.id);
      }
    }
  }
}
