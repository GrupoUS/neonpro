/**
 * NeonPro Escalation & Alert System
 * 
 * Sistema avançado de escalação para não-resposta de pacientes,
 * com workflows personalizados e alertas automáticos para gestores.
 * 
 * Features:
 * - Escalação automática multi-nível
 * - Workflows personalizados por tipo de consulta
 * - Alertas inteligentes para gestores
 * - Integração com CRM para ações manuais
 * - Machine learning para otimização
 * - Compliance LGPD integrado
 * 
 * @author BMad Method - NeonPro Development Team
 * @version 1.0.0
 * @since 2025-01-30
 */

import { Database } from '@/lib/database.types';
import { createClient } from '@/app/utils/supabase/server';
import { logger } from '@/lib/utils/logger';
import { auditLogger } from '@/lib/utils/audit-logger';
import { NotificationEngine } from './notification-engine';
import { PersonalizationEngine } from './personalization-engine';

// Types e Interfaces
export interface EscalationRule {
  id: string;
  name: string;
  triggerCondition: EscalationTrigger;
  targetUserId: string;
  notificationTemplateId?: string;
  delayMinutes: number;
  maxEscalations: number;
  active: boolean;
  clinicId: string;
  priority: EscalationPriority;
  conditions: EscalationConditions;
  actions: EscalationAction[];
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface EscalationConditions {
  appointmentTypes?: string[];
  procedureTypes?: string[];
  patientSegments?: string[];
  timeBeforeAppointment?: {
    min: number;
    max: number;
  };
  previousEscalations?: number;
  patientRiskScore?: {
    min: number;
    max: number;
  };
  customConditions?: Record<string, any>;
}

export interface EscalationAction {
  type: EscalationActionType;
  target: string;
  template?: string;
  channel?: string;
  priority: number;
  data: Record<string, any>;
}

export interface EscalationInstance {
  id: string;
  patientId: string;
  appointmentId: string;
  ruleId: string;
  status: EscalationStatus;
  currentLevel: number;
  maxLevel: number;
  triggeredAt: Date;
  lastActionAt?: Date;
  resolvedAt?: Date;
  resolutionType?: EscalationResolution;
  assignedUserId?: string;
  metadata: Record<string, any>;
  history: EscalationHistoryEntry[];
}

export interface EscalationHistoryEntry {
  timestamp: Date;
  action: string;
  level: number;
  userId?: string;
  result: 'success' | 'failed' | 'pending';
  details: Record<string, any>;
}

export interface EscalationAlert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  targetUserId: string;
  title: string;
  message: string;
  data: Record<string, any>;
  channels: string[];
  status: AlertStatus;
  createdAt: Date;
  sentAt?: Date;
  acknowledgedAt?: Date;
  resolvedAt?: Date;
}

export interface EscalationMetrics {
  totalEscalations: number;
  resolvedEscalations: number;
  avgResolutionTime: number;
  escalationsByLevel: Record<number, number>;
  escalationsByType: Record<string, number>;
  resolutionsByType: Record<string, number>;
  managerResponseTimes: Record<string, number>;
  patientResponseImprovement: number;
  effectivenessScore: number;
}

export interface EscalationConfig {
  enabled: boolean;
  maxConcurrentEscalations: number;
  defaultDelayMinutes: number;
  maxEscalationLevels: number;
  autoResolveAfterHours: number;
  alertChannels: string[];
  priorityWeights: Record<EscalationPriority, number>;
  mlOptimization: boolean;
  reportingEnabled: boolean;
}

// Enums
export enum EscalationTrigger {
  NO_RESPONSE_24H = 'no_response_24h',
  NO_RESPONSE_12H = 'no_response_12h',
  NO_RESPONSE_6H = 'no_response_6h',
  NO_CONFIRMATION_4H = 'no_confirmation_4h',
  NO_CONFIRMATION_2H = 'no_confirmation_2h',
  MISSED_APPOINTMENT = 'missed_appointment',
  CANCELLATION_REQUEST = 'cancellation_request',
  PAYMENT_OVERDUE = 'payment_overdue',
  COMPLAINT_RECEIVED = 'complaint_received',
  HIGH_RISK_PATIENT = 'high_risk_patient',
  CUSTOM_TRIGGER = 'custom_trigger'
}

export enum EscalationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
  EMERGENCY = 'emergency'
}

export enum EscalationStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  ESCALATED = 'escalated',
  RESOLVED = 'resolved',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired'
}

export enum EscalationResolution {
  PATIENT_RESPONDED = 'patient_responded',
  MANAGER_RESOLVED = 'manager_resolved',
  APPOINTMENT_CANCELLED = 'appointment_cancelled',
  APPOINTMENT_RESCHEDULED = 'appointment_rescheduled',
  AUTO_RESOLVED = 'auto_resolved',
  MANUAL_OVERRIDE = 'manual_override'
}

export enum EscalationActionType {
  SEND_NOTIFICATION = 'send_notification',
  CREATE_ALERT = 'create_alert',
  ASSIGN_MANAGER = 'assign_manager',
  UPDATE_CRM = 'update_crm',
  CALL_WEBHOOK = 'call_webhook',
  BLOCK_SCHEDULING = 'block_scheduling',
  UPDATE_PATIENT_SCORE = 'update_patient_score',
  GENERATE_REPORT = 'generate_report'
}

export enum AlertType {
  ESCALATION_TRIGGERED = 'escalation_triggered',
  ESCALATION_RESOLVED = 'escalation_resolved',
  HIGH_PRIORITY_PATIENT = 'high_priority_patient',
  SYSTEM_OVERLOAD = 'system_overload',
  UNUSUAL_PATTERN = 'unusual_pattern',
  PERFORMANCE_ALERT = 'performance_alert'
}

export enum AlertSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

export enum AlertStatus {
  PENDING = 'pending',
  SENT = 'sent',
  ACKNOWLEDGED = 'acknowledged',
  RESOLVED = 'resolved',
  EXPIRED = 'expired'
}

/**
 * Sistema principal de escalação e alertas
 */
export class EscalationSystem {
  private supabase;
  private notificationEngine: NotificationEngine;
  private personalizationEngine: PersonalizationEngine;
  private config: EscalationConfig;
  private activeEscalations: Map<string, EscalationInstance> = new Map();
  private processingQueue: Map<string, Date> = new Map();

  constructor(
    notificationEngine: NotificationEngine,
    personalizationEngine: PersonalizationEngine,
    config?: Partial<EscalationConfig>
  ) {
    this.supabase = createClient();
    this.notificationEngine = notificationEngine;
    this.personalizationEngine = personalizationEngine;
    this.config = {
      enabled: true,
      maxConcurrentEscalations: 100,
      defaultDelayMinutes: 60,
      maxEscalationLevels: 3,
      autoResolveAfterHours: 48,
      alertChannels: ['email', 'sms', 'push'],
      priorityWeights: {
        [EscalationPriority.LOW]: 1,
        [EscalationPriority.MEDIUM]: 2,
        [EscalationPriority.HIGH]: 3,
        [EscalationPriority.CRITICAL]: 4,
        [EscalationPriority.EMERGENCY]: 5
      },
      mlOptimization: true,
      reportingEnabled: true,
      ...config
    };

    this.initializeEscalationMonitoring();
  }

  /**
   * Inicializa o monitoramento contínuo de escalações
   */
  private async initializeEscalationMonitoring(): Promise<void> {
    try {
      // Carrega escalações ativas do banco
      await this.loadActiveEscalations();

      // Inicia processamento contínuo
      this.startEscalationProcessor();

      // Configura limpeza automática
      this.startCleanupProcess();

      logger.info('Sistema de escalação inicializado', {
        activeEscalations: this.activeEscalations.size,
        config: this.config
      });

    } catch (error) {
      logger.error('Erro ao inicializar sistema de escalação:', error);
      throw error;
    }
  }

  /**
   * Carrega escalações ativas do banco de dados
   */
  private async loadActiveEscalations(): Promise<void> {
    try {
      const { data: escalations, error } = await this.supabase
        .from('escalation_instances')
        .select(`
          *,
          escalation_rules(*),
          patients(*),
          appointments(*)
        `)
        .in('status', [EscalationStatus.PENDING, EscalationStatus.IN_PROGRESS, EscalationStatus.ESCALATED]);

      if (error) throw error;

      escalations?.forEach(escalation => {
        this.activeEscalations.set(escalation.id, escalation as EscalationInstance);
      });

    } catch (error) {
      logger.error('Erro ao carregar escalações ativas:', error);
      throw error;
    }
  }

  /**
   * Inicia processador contínuo de escalações
   */
  private startEscalationProcessor(): void {
    setInterval(async () => {
      try {
        await this.processEscalations();
      } catch (error) {
        logger.error('Erro no processamento de escalações:', error);
      }
    }, 60000); // Executa a cada minuto
  }

  /**
   * Inicia processo de limpeza automática
   */
  private startCleanupProcess(): void {
    setInterval(async () => {
      try {
        await this.cleanupExpiredEscalations();
      } catch (error) {
        logger.error('Erro na limpeza de escalações:', error);
      }
    }, 3600000); // Executa a cada hora
  }

  /**
   * Processa todas as escalações ativas
   */
  private async processEscalations(): Promise<void> {
    const now = new Date();
    const escalationsToProcess = Array.from(this.activeEscalations.values())
      .filter(escalation => this.shouldProcessEscalation(escalation, now));

    for (const escalation of escalationsToProcess) {
      try {
        await this.processEscalation(escalation);
      } catch (error) {
        logger.error(`Erro ao processar escalação ${escalation.id}:`, error);
      }
    }
  }

  /**
   * Verifica se uma escalação deve ser processada
   */
  private shouldProcessEscalation(escalation: EscalationInstance, now: Date): boolean {
    // Evita processamento duplo
    if (this.processingQueue.has(escalation.id)) {
      const lastProcessing = this.processingQueue.get(escalation.id)!;
      if (now.getTime() - lastProcessing.getTime() < 30000) {
        return false;
      }
    }

    // Verifica se já está no nível máximo
    if (escalation.currentLevel >= escalation.maxLevel) {
      return false;
    }

    // Verifica delay necessário
    const lastAction = escalation.lastActionAt || escalation.triggeredAt;
    const timeSinceLastAction = now.getTime() - lastAction.getTime();
    const requiredDelay = this.getEscalationDelay(escalation);

    return timeSinceLastAction >= requiredDelay;
  }

  /**
   * Processa uma escalação específica
   */
  private async processEscalation(escalation: EscalationInstance): Promise<void> {
    this.processingQueue.set(escalation.id, new Date());

    try {
      // Carrega regra de escalação
      const rule = await this.getEscalationRule(escalation.ruleId);
      if (!rule || !rule.active) {
        await this.resolveEscalation(escalation.id, EscalationResolution.AUTO_RESOLVED);
        return;
      }

      // Verifica se ainda precisa escalar
      const shouldContinue = await this.checkEscalationConditions(escalation, rule);
      if (!shouldContinue) {
        await this.resolveEscalation(escalation.id, EscalationResolution.PATIENT_RESPONDED);
        return;
      }

      // Executa próximo nível de escalação
      await this.executeEscalationLevel(escalation, rule);

      // Atualiza escalação
      escalation.currentLevel += 1;
      escalation.lastActionAt = new Date();
      await this.updateEscalation(escalation);

      // Registra na auditoria
      await auditLogger.log({
        action: 'escalation_processed',
        resourceType: 'escalation',
        resourceId: escalation.id,
        details: {
          level: escalation.currentLevel,
          ruleId: escalation.ruleId,
          patientId: escalation.patientId
        }
      });

    } catch (error) {
      logger.error(`Erro ao processar escalação ${escalation.id}:`, error);
    } finally {
      this.processingQueue.delete(escalation.id);
    }
  }

  /**
   * Executa ações de um nível de escalação
   */
  private async executeEscalationLevel(
    escalation: EscalationInstance,
    rule: EscalationRule
  ): Promise<void> {
    const level = escalation.currentLevel + 1;
    const actions = rule.actions.filter(action => action.priority === level);

    for (const action of actions) {
      try {
        await this.executeEscalationAction(escalation, action, rule);
      } catch (error) {
        logger.error(`Erro ao executar ação de escalação:`, error);
      }
    }
  }

  /**
   * Executa uma ação específica de escalação
   */
  private async executeEscalationAction(
    escalation: EscalationInstance,
    action: EscalationAction,
    rule: EscalationRule
  ): Promise<void> {
    switch (action.type) {
      case EscalationActionType.SEND_NOTIFICATION:
        await this.sendEscalationNotification(escalation, action, rule);
        break;

      case EscalationActionType.CREATE_ALERT:
        await this.createEscalationAlert(escalation, action, rule);
        break;

      case EscalationActionType.ASSIGN_MANAGER:
        await this.assignManagerToEscalation(escalation, action, rule);
        break;

      case EscalationActionType.UPDATE_CRM:
        await this.updateCRMRecord(escalation, action, rule);
        break;

      case EscalationActionType.CALL_WEBHOOK:
        await this.callEscalationWebhook(escalation, action, rule);
        break;

      case EscalationActionType.BLOCK_SCHEDULING:
        await this.blockPatientScheduling(escalation, action, rule);
        break;

      case EscalationActionType.UPDATE_PATIENT_SCORE:
        await this.updatePatientRiskScore(escalation, action, rule);
        break;

      case EscalationActionType.GENERATE_REPORT:
        await this.generateEscalationReport(escalation, action, rule);
        break;

      default:
        logger.warn(`Tipo de ação não suportada: ${action.type}`);
    }
  }

  /**
   * Envia notificação de escalação
   */
  private async sendEscalationNotification(
    escalation: EscalationInstance,
    action: EscalationAction,
    rule: EscalationRule
  ): Promise<void> {
    const template = action.template || rule.notificationTemplateId;
    if (!template) return;

    await this.notificationEngine.sendNotification({
      type: 'escalation',
      recipientId: action.target,
      templateId: template,
      channel: action.channel || 'email',
      data: {
        escalationLevel: escalation.currentLevel + 1,
        patientId: escalation.patientId,
        appointmentId: escalation.appointmentId,
        ruleName: rule.name,
        ...action.data
      },
      priority: rule.priority,
      metadata: {
        escalationId: escalation.id,
        ruleId: rule.id
      }
    });
  }

  /**
   * Cria alerta para gerentes
   */
  private async createEscalationAlert(
    escalation: EscalationInstance,
    action: EscalationAction,
    rule: EscalationRule
  ): Promise<void> {
    const alert: Omit<EscalationAlert, 'id' | 'createdAt'> = {
      type: AlertType.ESCALATION_TRIGGERED,
      severity: this.mapPriorityToSeverity(rule.priority),
      targetUserId: action.target,
      title: `Escalação Nível ${escalation.currentLevel + 1}: ${rule.name}`,
      message: this.buildAlertMessage(escalation, rule),
      data: {
        escalationId: escalation.id,
        patientId: escalation.patientId,
        appointmentId: escalation.appointmentId,
        level: escalation.currentLevel + 1,
        ...action.data
      },
      channels: action.data.channels || this.config.alertChannels,
      status: AlertStatus.PENDING
    };

    await this.createAlert(alert);
  }

  /**
   * Atribui gerente à escalação
   */
  private async assignManagerToEscalation(
    escalation: EscalationInstance,
    action: EscalationAction,
    rule: EscalationRule
  ): Promise<void> {
    escalation.assignedUserId = action.target;
    await this.updateEscalation(escalation);

    // Notifica o gerente atribuído
    await this.createEscalationAlert(escalation, {
      type: EscalationActionType.CREATE_ALERT,
      target: action.target,
      priority: escalation.currentLevel + 1,
      data: {
        ...action.data,
        assigned: true,
        message: 'Escalação atribuída para sua resolução'
      }
    }, rule);
  }

  /**
   * Atualiza registro no CRM
   */
  private async updateCRMRecord(
    escalation: EscalationInstance,
    action: EscalationAction,
    rule: EscalationRule
  ): Promise<void> {
    // Implementar integração com CRM
    // Exemplo: adicionar nota no histórico do paciente
    const { error } = await this.supabase
      .from('patient_notes')
      .insert({
        patient_id: escalation.patientId,
        note_type: 'escalation',
        content: `Escalação automática - ${rule.name} - Nível ${escalation.currentLevel + 1}`,
        created_by: 'system',
        metadata: {
          escalationId: escalation.id,
          ruleId: rule.id,
          level: escalation.currentLevel + 1,
          ...action.data
        }
      });

    if (error) {
      logger.error('Erro ao atualizar CRM:', error);
    }
  }

  /**
   * Chama webhook de escalação
   */
  private async callEscalationWebhook(
    escalation: EscalationInstance,
    action: EscalationAction,
    rule: EscalationRule
  ): Promise<void> {
    const webhookUrl = action.target;
    const payload = {
      event: 'escalation_triggered',
      escalation: {
        id: escalation.id,
        level: escalation.currentLevel + 1,
        patientId: escalation.patientId,
        appointmentId: escalation.appointmentId,
        ruleId: rule.id,
        ruleName: rule.name,
        triggeredAt: escalation.triggeredAt,
        metadata: escalation.metadata
      },
      action: action.data
    };

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'NeonPro-EscalationSystem/1.0'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Webhook failed: ${response.status} ${response.statusText}`);
      }

    } catch (error) {
      logger.error('Erro ao chamar webhook de escalação:', error);
    }
  }

  /**
   * Bloqueia agendamento do paciente
   */
  private async blockPatientScheduling(
    escalation: EscalationInstance,
    action: EscalationAction,
    rule: EscalationRule
  ): Promise<void> {
    const blockDuration = action.data.blockDurationHours || 24;
    const blockUntil = new Date(Date.now() + blockDuration * 60 * 60 * 1000);

    const { error } = await this.supabase
      .from('patient_restrictions')
      .insert({
        patient_id: escalation.patientId,
        restriction_type: 'scheduling_blocked',
        reason: `Escalação automática - ${rule.name}`,
        blocked_until: blockUntil.toISOString(),
        created_by: 'system',
        metadata: {
          escalationId: escalation.id,
          ruleId: rule.id,
          level: escalation.currentLevel + 1
        }
      });

    if (error) {
      logger.error('Erro ao bloquear agendamento:', error);
    }
  }

  /**
   * Atualiza score de risco do paciente
   */
  private async updatePatientRiskScore(
    escalation: EscalationInstance,
    action: EscalationAction,
    rule: EscalationRule
  ): Promise<void> {
    const scoreChange = action.data.scoreChange || 10;

    const { error } = await this.supabase.rpc('update_patient_risk_score', {
      p_patient_id: escalation.patientId,
      p_score_change: scoreChange,
      p_reason: `Escalação: ${rule.name} - Nível ${escalation.currentLevel + 1}`
    });

    if (error) {
      logger.error('Erro ao atualizar score de risco:', error);
    }
  }

  /**
   * Gera relatório de escalação
   */
  private async generateEscalationReport(
    escalation: EscalationInstance,
    action: EscalationAction,
    rule: EscalationRule
  ): Promise<void> {
    // Implementar geração de relatório
    const reportData = {
      escalationId: escalation.id,
      patientId: escalation.patientId,
      appointmentId: escalation.appointmentId,
      rule: rule.name,
      level: escalation.currentLevel + 1,
      triggeredAt: escalation.triggeredAt,
      history: escalation.history,
      currentStatus: escalation.status
    };

    // Salvar ou enviar relatório conforme configuração
    logger.info('Relatório de escalação gerado:', reportData);
  }

  /**
   * Cria uma nova escalação
   */
  async createEscalation(
    patientId: string,
    appointmentId: string,
    trigger: EscalationTrigger,
    metadata: Record<string, any> = {}
  ): Promise<string> {
    try {
      // Busca regras aplicáveis
      const rules = await this.getApplicableRules(patientId, appointmentId, trigger);
      if (rules.length === 0) {
        logger.info('Nenhuma regra de escalação aplicável encontrada', {
          patientId,
          appointmentId,
          trigger
        });
        return '';
      }

      // Seleciona regra com maior prioridade
      const rule = rules.reduce((highest, current) => 
        this.config.priorityWeights[current.priority] > this.config.priorityWeights[highest.priority] 
          ? current 
          : highest
      );

      // Verifica se já existe escalação ativa
      const existingEscalation = await this.getActiveEscalation(patientId, appointmentId);
      if (existingEscalation) {
        logger.info('Escalação já existe para esta consulta', { 
          existingId: existingEscalation.id 
        });
        return existingEscalation.id;
      }

      // Cria nova escalação
      const escalationId = await this.createEscalationInstance(
        patientId,
        appointmentId,
        rule,
        trigger,
        metadata
      );

      logger.info('Nova escalação criada', { 
        escalationId, 
        ruleId: rule.id, 
        trigger 
      });

      return escalationId;

    } catch (error) {
      logger.error('Erro ao criar escalação:', error);
      throw error;
    }
  }

  /**
   * Busca regras aplicáveis para uma situação
   */
  private async getApplicableRules(
    patientId: string,
    appointmentId: string,
    trigger: EscalationTrigger
  ): Promise<EscalationRule[]> {
    // Busca dados necessários para avaliação
    const { data: appointment } = await this.supabase
      .from('appointments')
      .select(`
        *,
        patients(*),
        procedures(*)
      `)
      .eq('id', appointmentId)
      .single();

    if (!appointment) return [];

    // Busca todas as regras ativas para a clínica
    const { data: rules } = await this.supabase
      .from('escalation_rules')
      .select('*')
      .eq('clinic_id', appointment.clinic_id)
      .eq('active', true)
      .eq('trigger_condition', trigger);

    if (!rules) return [];

    // Filtra regras aplicáveis baseado nas condições
    const applicableRules = rules.filter(rule => 
      this.evaluateRuleConditions(rule, appointment, trigger)
    );

    return applicableRules as EscalationRule[];
  }

  /**
   * Avalia se uma regra se aplica à situação atual
   */
  private evaluateRuleConditions(
    rule: any,
    appointment: any,
    trigger: EscalationTrigger
  ): boolean {
    const conditions = rule.conditions || {};

    // Verifica tipos de consulta
    if (conditions.appointmentTypes?.length > 0) {
      if (!conditions.appointmentTypes.includes(appointment.type)) {
        return false;
      }
    }

    // Verifica tipos de procedimento
    if (conditions.procedureTypes?.length > 0) {
      const procedureType = appointment.procedures?.type;
      if (!procedureType || !conditions.procedureTypes.includes(procedureType)) {
        return false;
      }
    }

    // Verifica segmentos de paciente
    if (conditions.patientSegments?.length > 0) {
      const patientSegment = appointment.patients?.segment;
      if (!patientSegment || !conditions.patientSegments.includes(patientSegment)) {
        return false;
      }
    }

    // Verifica tempo antes da consulta
    if (conditions.timeBeforeAppointment) {
      const now = new Date();
      const appointmentTime = new Date(appointment.scheduled_at);
      const hoursUntilAppointment = (appointmentTime.getTime() - now.getTime()) / (1000 * 60 * 60);
      
      if (hoursUntilAppointment < conditions.timeBeforeAppointment.min ||
          hoursUntilAppointment > conditions.timeBeforeAppointment.max) {
        return false;
      }
    }

    // Verifica score de risco do paciente
    if (conditions.patientRiskScore) {
      const riskScore = appointment.patients?.risk_score || 50;
      if (riskScore < conditions.patientRiskScore.min ||
          riskScore > conditions.patientRiskScore.max) {
        return false;
      }
    }

    return true;
  }

  /**
   * Cria instância de escalação no banco
   */
  private async createEscalationInstance(
    patientId: string,
    appointmentId: string,
    rule: EscalationRule,
    trigger: EscalationTrigger,
    metadata: Record<string, any>
  ): Promise<string> {
    const escalation: Omit<EscalationInstance, 'id' | 'history'> = {
      patientId,
      appointmentId,
      ruleId: rule.id,
      status: EscalationStatus.PENDING,
      currentLevel: 0,
      maxLevel: rule.maxEscalations,
      triggeredAt: new Date(),
      metadata: {
        trigger,
        ruleName: rule.name,
        priority: rule.priority,
        ...metadata
      }
    };

    const { data, error } = await this.supabase
      .from('escalation_instances')
      .insert(escalation)
      .select()
      .single();

    if (error) throw error;

    // Adiciona à cache de escalações ativas
    const instance = {
      ...data,
      history: []
    } as EscalationInstance;
    
    this.activeEscalations.set(data.id, instance);

    return data.id;
  }

  /**
   * Resolve uma escalação
   */
  async resolveEscalation(
    escalationId: string,
    resolution: EscalationResolution,
    userId?: string,
    notes?: string
  ): Promise<void> {
    try {
      const escalation = this.activeEscalations.get(escalationId);
      if (!escalation) {
        throw new Error(`Escalação ${escalationId} não encontrada`);
      }

      // Atualiza status
      escalation.status = EscalationStatus.RESOLVED;
      escalation.resolvedAt = new Date();
      escalation.resolutionType = resolution;

      // Adiciona entrada no histórico
      escalation.history.push({
        timestamp: new Date(),
        action: 'resolved',
        level: escalation.currentLevel,
        userId,
        result: 'success',
        details: {
          resolution,
          notes,
          resolvedBy: userId || 'system'
        }
      });

      // Atualiza no banco
      await this.updateEscalation(escalation);

      // Remove da cache de ativos
      this.activeEscalations.delete(escalationId);

      // Cria alerta de resolução se necessário
      if (escalation.assignedUserId) {
        await this.createAlert({
          type: AlertType.ESCALATION_RESOLVED,
          severity: AlertSeverity.INFO,
          targetUserId: escalation.assignedUserId,
          title: 'Escalação Resolvida',
          message: `Escalação ${escalationId} foi resolvida: ${resolution}`,
          data: {
            escalationId,
            resolution,
            resolvedBy: userId || 'system',
            notes
          },
          channels: ['push'],
          status: AlertStatus.PENDING
        });
      }

      // Log de auditoria
      await auditLogger.log({
        action: 'escalation_resolved',
        resourceType: 'escalation',
        resourceId: escalationId,
        userId,
        details: {
          resolution,
          notes,
          level: escalation.currentLevel
        }
      });

      logger.info('Escalação resolvida', { 
        escalationId, 
        resolution, 
        userId 
      });

    } catch (error) {
      logger.error('Erro ao resolver escalação:', error);
      throw error;
    }
  }

  /**
   * Busca escalação ativa para consulta
   */
  private async getActiveEscalation(
    patientId: string,
    appointmentId: string
  ): Promise<EscalationInstance | null> {
    const { data } = await this.supabase
      .from('escalation_instances')
      .select('*')
      .eq('patient_id', patientId)
      .eq('appointment_id', appointmentId)
      .in('status', [EscalationStatus.PENDING, EscalationStatus.IN_PROGRESS, EscalationStatus.ESCALATED])
      .single();

    return data as EscalationInstance | null;
  }

  /**
   * Busca regra de escalação
   */
  private async getEscalationRule(ruleId: string): Promise<EscalationRule | null> {
    const { data } = await this.supabase
      .from('escalation_rules')
      .select('*')
      .eq('id', ruleId)
      .single();

    return data as EscalationRule | null;
  }

  /**
   * Verifica condições de escalação
   */
  private async checkEscalationConditions(
    escalation: EscalationInstance,
    rule: EscalationRule
  ): Promise<boolean> {
    // Verifica se paciente respondeu
    const hasResponse = await this.checkPatientResponse(
      escalation.patientId,
      escalation.appointmentId,
      escalation.triggeredAt
    );

    if (hasResponse) {
      return false;
    }

    // Verifica se consulta foi cancelada/reagendada
    const { data: appointment } = await this.supabase
      .from('appointments')
      .select('status')
      .eq('id', escalation.appointmentId)
      .single();

    if (appointment?.status === 'cancelled' || appointment?.status === 'rescheduled') {
      return false;
    }

    return true;
  }

  /**
   * Verifica se paciente respondeu após escalação
   */
  private async checkPatientResponse(
    patientId: string,
    appointmentId: string,
    since: Date
  ): Promise<boolean> {
    const { data } = await this.supabase
      .from('notification_queue')
      .select('*')
      .eq('patient_id', patientId)
      .eq('appointment_id', appointmentId)
      .gte('created_at', since.toISOString())
      .not('replied_at', 'is', null);

    return (data?.length || 0) > 0;
  }

  /**
   * Calcula delay para próxima escalação
   */
  private getEscalationDelay(escalation: EscalationInstance): number {
    // Delay exponencial baseado no nível
    const baseDelay = this.config.defaultDelayMinutes * 60 * 1000; // Convert to milliseconds
    return baseDelay * Math.pow(2, escalation.currentLevel);
  }

  /**
   * Atualiza escalação no banco
   */
  private async updateEscalation(escalation: EscalationInstance): Promise<void> {
    const { error } = await this.supabase
      .from('escalation_instances')
      .update({
        status: escalation.status,
        current_level: escalation.currentLevel,
        last_action_at: escalation.lastActionAt?.toISOString(),
        resolved_at: escalation.resolvedAt?.toISOString(),
        resolution_type: escalation.resolutionType,
        assigned_user_id: escalation.assignedUserId,
        metadata: escalation.metadata,
        history: escalation.history
      })
      .eq('id', escalation.id);

    if (error) {
      throw error;
    }
  }

  /**
   * Cria alerta
   */
  private async createAlert(
    alertData: Omit<EscalationAlert, 'id' | 'createdAt'>
  ): Promise<string> {
    const alert = {
      ...alertData,
      created_at: new Date().toISOString()
    };

    const { data, error } = await this.supabase
      .from('escalation_alerts')
      .insert(alert)
      .select()
      .single();

    if (error) throw error;

    // Envia alerta pelos canais configurados
    await this.sendAlert(data);

    return data.id;
  }

  /**
   * Envia alerta pelos canais configurados
   */
  private async sendAlert(alert: EscalationAlert): Promise<void> {
    for (const channel of alert.channels) {
      try {
        await this.notificationEngine.sendNotification({
          type: 'alert',
          recipientId: alert.targetUserId,
          templateId: 'escalation_alert',
          channel,
          data: {
            title: alert.title,
            message: alert.message,
            severity: alert.severity,
            type: alert.type,
            ...alert.data
          },
          priority: this.mapSeverityToPriority(alert.severity),
          metadata: {
            alertId: alert.id
          }
        });
      } catch (error) {
        logger.error(`Erro ao enviar alerta por ${channel}:`, error);
      }
    }

    // Marca como enviado
    await this.supabase
      .from('escalation_alerts')
      .update({ 
        status: AlertStatus.SENT,
        sent_at: new Date().toISOString()
      })
      .eq('id', alert.id);
  }

  /**
   * Limpa escalações expiradas
   */
  private async cleanupExpiredEscalations(): Promise<void> {
    const cutoffTime = new Date(
      Date.now() - this.config.autoResolveAfterHours * 60 * 60 * 1000
    );

    // Busca escalações expiradas
    const { data: expiredEscalations } = await this.supabase
      .from('escalation_instances')
      .select('id')
      .in('status', [EscalationStatus.PENDING, EscalationStatus.IN_PROGRESS])
      .lt('triggered_at', cutoffTime.toISOString());

    // Resolve escalações expiradas
    for (const escalation of expiredEscalations || []) {
      try {
        await this.resolveEscalation(
          escalation.id,
          EscalationResolution.AUTO_RESOLVED,
          undefined,
          'Resolvido automaticamente por expiração'
        );
      } catch (error) {
        logger.error(`Erro ao resolver escalação expirada ${escalation.id}:`, error);
      }
    }

    if (expiredEscalations?.length) {
      logger.info(`${expiredEscalations.length} escalações expiradas resolvidas automaticamente`);
    }
  }

  /**
   * Gera métricas de escalação
   */
  async getEscalationMetrics(
    clinicId: string,
    startDate: Date,
    endDate: Date
  ): Promise<EscalationMetrics> {
    try {
      const { data: escalations } = await this.supabase
        .from('escalation_instances')
        .select(`
          *,
          escalation_rules(clinic_id)
        `)
        .eq('escalation_rules.clinic_id', clinicId)
        .gte('triggered_at', startDate.toISOString())
        .lte('triggered_at', endDate.toISOString());

      if (!escalations?.length) {
        return this.getEmptyMetrics();
      }

      const totalEscalations = escalations.length;
      const resolvedEscalations = escalations.filter(e => 
        e.status === EscalationStatus.RESOLVED
      ).length;

      const resolutionTimes = escalations
        .filter(e => e.resolved_at)
        .map(e => {
          const triggered = new Date(e.triggered_at);
          const resolved = new Date(e.resolved_at);
          return resolved.getTime() - triggered.getTime();
        });

      const avgResolutionTime = resolutionTimes.length > 0
        ? resolutionTimes.reduce((a, b) => a + b, 0) / resolutionTimes.length
        : 0;

      const escalationsByLevel = escalations.reduce((acc, e) => {
        acc[e.current_level] = (acc[e.current_level] || 0) + 1;
        return acc;
      }, {} as Record<number, number>);

      const escalationsByType = escalations.reduce((acc, e) => {
        const trigger = e.metadata?.trigger || 'unknown';
        acc[trigger] = (acc[trigger] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const resolutionsByType = escalations
        .filter(e => e.resolution_type)
        .reduce((acc, e) => {
          acc[e.resolution_type] = (acc[e.resolution_type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

      const effectivenessScore = totalEscalations > 0 
        ? (resolvedEscalations / totalEscalations) * 100
        : 0;

      return {
        totalEscalations,
        resolvedEscalations,
        avgResolutionTime: Math.round(avgResolutionTime / (1000 * 60)), // em minutos
        escalationsByLevel,
        escalationsByType,
        resolutionsByType,
        managerResponseTimes: {}, // Implementar se necessário
        patientResponseImprovement: 0, // Implementar cálculo de melhoria
        effectivenessScore: Math.round(effectivenessScore * 100) / 100
      };

    } catch (error) {
      logger.error('Erro ao gerar métricas de escalação:', error);
      return this.getEmptyMetrics();
    }
  }

  /**
   * Retorna métricas vazias
   */
  private getEmptyMetrics(): EscalationMetrics {
    return {
      totalEscalations: 0,
      resolvedEscalations: 0,
      avgResolutionTime: 0,
      escalationsByLevel: {},
      escalationsByType: {},
      resolutionsByType: {},
      managerResponseTimes: {},
      patientResponseImprovement: 0,
      effectivenessScore: 0
    };
  }

  /**
   * Mapeia prioridade para severidade
   */
  private mapPriorityToSeverity(priority: EscalationPriority): AlertSeverity {
    const mapping = {
      [EscalationPriority.LOW]: AlertSeverity.INFO,
      [EscalationPriority.MEDIUM]: AlertSeverity.WARNING,
      [EscalationPriority.HIGH]: AlertSeverity.ERROR,
      [EscalationPriority.CRITICAL]: AlertSeverity.CRITICAL,
      [EscalationPriority.EMERGENCY]: AlertSeverity.CRITICAL
    };
    return mapping[priority];
  }

  /**
   * Mapeia severidade para prioridade
   */
  private mapSeverityToPriority(severity: AlertSeverity): string {
    const mapping = {
      [AlertSeverity.INFO]: 'low',
      [AlertSeverity.WARNING]: 'medium',
      [AlertSeverity.ERROR]: 'high',
      [AlertSeverity.CRITICAL]: 'critical'
    };
    return mapping[severity];
  }

  /**
   * Constrói mensagem de alerta
   */
  private buildAlertMessage(escalation: EscalationInstance, rule: EscalationRule): string {
    return `Escalação de nível ${escalation.currentLevel + 1} foi acionada para a regra "${rule.name}". ` +
           `Paciente: ${escalation.patientId}, Consulta: ${escalation.appointmentId}. ` +
           `Ação necessária conforme política de escalação.`;
  }

  /**
   * Obtém configuração atual
   */
  getConfig(): EscalationConfig {
    return { ...this.config };
  }

  /**
   * Atualiza configuração
   */
  updateConfig(newConfig: Partial<EscalationConfig>): void {
    this.config = { ...this.config, ...newConfig };
    logger.info('Configuração de escalação atualizada', { config: this.config });
  }

  /**
   * Obtém estatísticas do sistema
   */
  getSystemStats(): {
    activeEscalations: number;
    processingQueue: number;
    config: EscalationConfig;
  } {
    return {
      activeEscalations: this.activeEscalations.size,
      processingQueue: this.processingQueue.size,
      config: this.config
    };
  }
}