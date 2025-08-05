// ============================================================================
// LGPD AUTOMATION ORCHESTRATOR
// ============================================================================

import { createClient } from '@supabase/supabase-js';
import { 
  LGPDAutoConsentService,
  LGPDAutoDataSubjectRightsService,
  LGPDAutoAuditService,
  LGPDAutoReportingService,
  LGPDAutoAnonymizationService,
  AutomationConfig,
  ComplianceHealthCheck
} from './lgpd-automation';
import { LGPDComplianceService } from './lgpd-core';
import { 
  LGPDAuditLog, 
  AuditEventType, 
  ComplianceReport, 
  ComplianceReportType,
  AnonymizationJob
} from '@/types/lgpd';

export interface AutomationSchedule {
  id: string;
  clinicId: string;
  automationType: 'consent_check' | 'audit' | 'reporting' | 'anonymization' | 'health_check';
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  enabled: boolean;
  lastRun?: Date;
  nextRun: Date;
  config: any;
}

export interface AutomationResult {
  id: string;
  automationType: string;
  status: 'success' | 'partial' | 'failed';
  startTime: Date;
  endTime: Date;
  itemsProcessed: number;
  itemsSuccessful: number;
  errors: string[];
  details: any;
}

export interface LGPDDashboardMetrics {
  complianceScore: number;
  activeConsents: number;
  pendingRequests: number;
  criticalIssues: number;
  lastAuditDate: Date;
  nextScheduledTasks: AutomationSchedule[];
  recentAlerts: string[];
}

/**
 * Orquestrador principal da automação LGPD
 * Coordena todos os serviços de automação e fornece interface unificada
 */
export class LGPDAutomationOrchestrator {
  private supabase: any;
  private consentService: LGPDAutoConsentService;
  private dataSubjectService: LGPDAutoDataSubjectRightsService;
  private auditService: LGPDAutoAuditService;
  private reportingService: LGPDAutoReportingService;
  private anonymizationService: LGPDAutoAnonymizationService;
  private complianceService: LGPDComplianceService;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    this.consentService = new LGPDAutoConsentService();
    this.dataSubjectService = new LGPDAutoDataSubjectRightsService();
    this.auditService = new LGPDAutoAuditService();
    this.reportingService = new LGPDAutoReportingService();
    this.anonymizationService = new LGPDAutoAnonymizationService();
    this.complianceService = new LGPDComplianceService();
  }

  /**
   * Executa automação completa para uma clínica
   */
  async executeFullAutomation(clinicId: string): Promise<AutomationResult[]> {
    const results: AutomationResult[] = [];
    const startTime = new Date();

    try {
      // 1. Verificação de saúde do compliance
      const healthCheck = await this.executeHealthCheck(clinicId);
      results.push(healthCheck);

      // 2. Processamento automático de consentimentos
      const consentResult = await this.executeConsentAutomation(clinicId);
      results.push(consentResult);

      // 3. Processamento de solicitações de direitos
      const rightsResult = await this.executeDataSubjectRightsAutomation(clinicId);
      results.push(rightsResult);

      // 4. Auditoria automática
      const auditResult = await this.executeAuditAutomation(clinicId);
      results.push(auditResult);

      // 5. Geração de relatórios
      const reportingResult = await this.executeReportingAutomation(clinicId);
      results.push(reportingResult);

      // 6. Anonimização automática
      const anonymizationResult = await this.executeAnonymizationAutomation(clinicId);
      results.push(anonymizationResult);

      // Registrar execução completa
      await this.logAutomationExecution(clinicId, results, startTime);

      return results;

    } catch (error) {
      console.error('Full automation failed:', error);
      
      const errorResult: AutomationResult = {
        id: crypto.randomUUID(),
        automationType: 'full_automation',
        status: 'failed',
        startTime,
        endTime: new Date(),
        itemsProcessed: 0,
        itemsSuccessful: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        details: { clinicId }
      };
      
      results.push(errorResult);
      return results;
    }
  }

  /**
   * Executa verificação de saúde do compliance
   */
  private async executeHealthCheck(clinicId: string): Promise<AutomationResult> {
    const startTime = new Date();
    
    try {
      const healthCheck = await this.auditService.performComplianceHealthCheck(clinicId);
      
      return {
        id: crypto.randomUUID(),
        automationType: 'health_check',
        status: healthCheck.overallScore >= 80 ? 'success' : 'partial',
        startTime,
        endTime: new Date(),
        itemsProcessed: 1,
        itemsSuccessful: healthCheck.overallScore >= 80 ? 1 : 0,
        errors: healthCheck.criticalIssues,
        details: healthCheck
      };
    } catch (error) {
      return {
        id: crypto.randomUUID(),
        automationType: 'health_check',
        status: 'failed',
        startTime,
        endTime: new Date(),
        itemsProcessed: 0,
        itemsSuccessful: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        details: { clinicId }
      };
    }
  }

  /**
   * Executa automação de consentimentos
   */
  private async executeConsentAutomation(clinicId: string): Promise<AutomationResult> {
    const startTime = new Date();
    
    try {
      const expiredConsents = await this.consentService.checkConsentExpiration(clinicId);
      const processedCount = expiredConsents.length;
      
      return {
        id: crypto.randomUUID(),
        automationType: 'consent_check',
        status: 'success',
        startTime,
        endTime: new Date(),
        itemsProcessed: processedCount,
        itemsSuccessful: processedCount,
        errors: [],
        details: { expiredConsents }
      };
    } catch (error) {
      return {
        id: crypto.randomUUID(),
        automationType: 'consent_check',
        status: 'failed',
        startTime,
        endTime: new Date(),
        itemsProcessed: 0,
        itemsSuccessful: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        details: { clinicId }
      };
    }
  }

  /**
   * Executa automação de direitos do titular
   */
  private async executeDataSubjectRightsAutomation(clinicId: string): Promise<AutomationResult> {
    const startTime = new Date();
    
    try {
      const processedRequests = await this.dataSubjectService.processAutomaticRequests(clinicId);
      
      return {
        id: crypto.randomUUID(),
        automationType: 'data_subject_rights',
        status: 'success',
        startTime,
        endTime: new Date(),
        itemsProcessed: processedRequests.length,
        itemsSuccessful: processedRequests.filter(r => r.status === 'completed').length,
        errors: [],
        details: { processedRequests }
      };
    } catch (error) {
      return {
        id: crypto.randomUUID(),
        automationType: 'data_subject_rights',
        status: 'failed',
        startTime,
        endTime: new Date(),
        itemsProcessed: 0,
        itemsSuccessful: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        details: { clinicId }
      };
    }
  }

  /**
   * Executa automação de auditoria
   */
  private async executeAuditAutomation(clinicId: string): Promise<AutomationResult> {
    const startTime = new Date();
    
    try {
      const auditResult = await this.auditService.performAutomaticAudit(clinicId);
      
      return {
        id: crypto.randomUUID(),
        automationType: 'audit',
        status: auditResult.complianceScore >= 80 ? 'success' : 'partial',
        startTime,
        endTime: new Date(),
        itemsProcessed: 1,
        itemsSuccessful: auditResult.complianceScore >= 80 ? 1 : 0,
        errors: auditResult.actionItems.filter(item => item.priority === 'critical').map(item => item.description),
        details: auditResult
      };
    } catch (error) {
      return {
        id: crypto.randomUUID(),
        automationType: 'audit',
        status: 'failed',
        startTime,
        endTime: new Date(),
        itemsProcessed: 0,
        itemsSuccessful: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        details: { clinicId }
      };
    }
  }

  /**
   * Executa automação de relatórios
   */
  private async executeReportingAutomation(clinicId: string): Promise<AutomationResult> {
    const startTime = new Date();
    
    try {
      const reportTypes = [
        ComplianceReportType.CONSENT_SUMMARY,
        ComplianceReportType.DATA_PROCESSING,
        ComplianceReportType.AUDIT_TRAIL
      ];
      
      const reports = await this.reportingService.generateComplianceReports(clinicId, reportTypes);
      
      return {
        id: crypto.randomUUID(),
        automationType: 'reporting',
        status: 'success',
        startTime,
        endTime: new Date(),
        itemsProcessed: reportTypes.length,
        itemsSuccessful: reports.length,
        errors: [],
        details: { reports }
      };
    } catch (error) {
      return {
        id: crypto.randomUUID(),
        automationType: 'reporting',
        status: 'failed',
        startTime,
        endTime: new Date(),
        itemsProcessed: 0,
        itemsSuccessful: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        details: { clinicId }
      };
    }
  }

  /**
   * Executa automação de anonimização
   */
  private async executeAnonymizationAutomation(clinicId: string): Promise<AutomationResult> {
    const startTime = new Date();
    
    try {
      const anonymizationJob = await this.anonymizationService.executeAutoAnonymization(clinicId);
      
      return {
        id: crypto.randomUUID(),
        automationType: 'anonymization',
        status: anonymizationJob.status === 'completed' ? 'success' : 'failed',
        startTime,
        endTime: new Date(),
        itemsProcessed: anonymizationJob.recordsProcessed,
        itemsSuccessful: anonymizationJob.recordsAnonymized,
        errors: anonymizationJob.errors || [],
        details: anonymizationJob
      };
    } catch (error) {
      return {
        id: crypto.randomUUID(),
        automationType: 'anonymization',
        status: 'failed',
        startTime,
        endTime: new Date(),
        itemsProcessed: 0,
        itemsSuccessful: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        details: { clinicId }
      };
    }
  }

  /**
   * Obtém métricas do dashboard LGPD
   */
  async getDashboardMetrics(clinicId: string): Promise<LGPDDashboardMetrics> {
    try {
      // Buscar dados básicos
      const [consents, requests, schedules, auditLogs] = await Promise.all([
        this.getActiveConsents(clinicId),
        this.getPendingRequests(clinicId),
        this.getScheduledTasks(clinicId),
        this.getRecentAuditLogs(clinicId)
      ]);

      // Calcular score de compliance
      const healthCheck = await this.auditService.performComplianceHealthCheck(clinicId);
      
      // Identificar issues críticos
      const criticalIssues = healthCheck.criticalIssues.length;
      
      // Próximas tarefas agendadas
      const nextScheduledTasks = schedules
        .filter(s => s.enabled)
        .sort((a, b) => a.nextRun.getTime() - b.nextRun.getTime())
        .slice(0, 5);
      
      // Alertas recentes
      const recentAlerts = auditLogs
        .filter(log => log.riskLevel === 'high' || log.riskLevel === 'critical')
        .slice(0, 5)
        .map(log => `${log.eventType}: ${log.action}`);

      return {
        complianceScore: healthCheck.overallScore,
        activeConsents: consents.length,
        pendingRequests: requests.length,
        criticalIssues,
        lastAuditDate: healthCheck.lastAuditDate,
        nextScheduledTasks,
        recentAlerts
      };
    } catch (error) {
      console.error('Error getting dashboard metrics:', error);
      throw error;
    }
  }

  /**
   * Configura automação para uma clínica
   */
  async configureAutomation(clinicId: string, config: AutomationConfig): Promise<void> {
    try {
      await this.supabase
        .from('lgpd_automation_config')
        .upsert({
          clinic_id: clinicId,
          config,
          updated_at: new Date().toISOString()
        });

      // Criar/atualizar agendamentos
      await this.updateAutomationSchedules(clinicId, config);
    } catch (error) {
      console.error('Error configuring automation:', error);
      throw error;
    }
  }

  /**
   * Executa tarefas agendadas
   */
  async executeScheduledTasks(): Promise<void> {
    try {
      const now = new Date();
      
      const { data: scheduledTasks } = await this.supabase
        .from('lgpd_automation_schedules')
        .select('*')
        .eq('enabled', true)
        .lte('next_run', now.toISOString());

      for (const task of scheduledTasks || []) {
        try {
          await this.executeScheduledTask(task);
          
          // Atualizar próxima execução
          const nextRun = this.calculateNextRun(task.frequency, now);
          await this.supabase
            .from('lgpd_automation_schedules')
            .update({
              last_run: now.toISOString(),
              next_run: nextRun.toISOString()
            })
            .eq('id', task.id);

        } catch (error) {
          console.error(`Failed to execute scheduled task ${task.id}:`, error);
        }
      }
    } catch (error) {
      console.error('Error executing scheduled tasks:', error);
    }
  }

  // Métodos auxiliares privados
  private async getActiveConsents(clinicId: string): Promise<any[]> {
    const { data } = await this.supabase
      .from('lgpd_consent_records')
      .select('id')
      .eq('clinicId', clinicId)
      .eq('status', 'granted');
    return data || [];
  }

  private async getPendingRequests(clinicId: string): Promise<any[]> {
    const { data } = await this.supabase
      .from('lgpd_data_subject_requests')
      .select('id')
      .eq('clinicId', clinicId)
      .in('status', ['pending', 'in_progress']);
    return data || [];
  }

  private async getScheduledTasks(clinicId: string): Promise<AutomationSchedule[]> {
    const { data } = await this.supabase
      .from('lgpd_automation_schedules')
      .select('*')
      .eq('clinic_id', clinicId);
    return data || [];
  }

  private async getRecentAuditLogs(clinicId: string): Promise<LGPDAuditLog[]> {
    const { data } = await this.supabase
      .from('lgpd_audit_logs')
      .select('*')
      .eq('clinicId', clinicId)
      .order('timestamp', { ascending: false })
      .limit(10);
    return data || [];
  }

  private async logAutomationExecution(
    clinicId: string, 
    results: AutomationResult[], 
    startTime: Date
  ): Promise<void> {
    const auditLog: LGPDAuditLog = {
      id: crypto.randomUUID(),
      clinicId,
      eventType: AuditEventType.SYSTEM_MAINTENANCE,
      timestamp: new Date(),
      userId: 'SYSTEM',
      userRole: 'system',
      resourceType: 'automation_execution',
      resourceId: crypto.randomUUID(),
      action: 'full_automation_execution',
      details: {
        startTime,
        endTime: new Date(),
        results,
        totalItemsProcessed: results.reduce((sum, r) => sum + r.itemsProcessed, 0),
        totalItemsSuccessful: results.reduce((sum, r) => sum + r.itemsSuccessful, 0),
        totalErrors: results.reduce((sum, r) => sum + r.errors.length, 0)
      },
      ipAddress: 'system',
      userAgent: 'LGPD Automation Orchestrator',
      riskLevel: 'low'
    };

    await this.supabase
      .from('lgpd_audit_logs')
      .insert(auditLog);
  }

  private async updateAutomationSchedules(clinicId: string, config: AutomationConfig): Promise<void> {
    // Implementar lógica de atualização de agendamentos
    // baseada na configuração fornecida
  }

  private async executeScheduledTask(task: any): Promise<void> {
    switch (task.automation_type) {
      case 'consent_check':
        await this.executeConsentAutomation(task.clinic_id);
        break;
      case 'audit':
        await this.executeAuditAutomation(task.clinic_id);
        break;
      case 'reporting':
        await this.executeReportingAutomation(task.clinic_id);
        break;
      case 'anonymization':
        await this.executeAnonymizationAutomation(task.clinic_id);
        break;
      case 'health_check':
        await this.executeHealthCheck(task.clinic_id);
        break;
    }
  }

  private calculateNextRun(frequency: string, lastRun: Date): Date {
    const next = new Date(lastRun);
    
    switch (frequency) {
      case 'daily':
        next.setDate(next.getDate() + 1);
        break;
      case 'weekly':
        next.setDate(next.getDate() + 7);
        break;
      case 'monthly':
        next.setMonth(next.getMonth() + 1);
        break;
      case 'quarterly':
        next.setMonth(next.getMonth() + 3);
        break;
    }
    
    return next;
  }
}

