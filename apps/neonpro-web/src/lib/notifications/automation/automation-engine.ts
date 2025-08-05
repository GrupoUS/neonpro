/**
 * NeonPro Notification System - Automation Engine
 * Story 1.7: Sistema de Notificações
 *
 * Motor de automação para notificações baseadas em eventos e regras
 * Suporte a triggers, condições e ações automatizadas
 */

import type { NotificationManager } from "../notification-manager";
import type { TemplateEngine } from "../template-engine";
import type {
  AutomationAction,
  AutomationCondition,
  AutomationRule,
  AutomationTrigger,
  NotificationChannel,
  NotificationContext,
  NotificationPriority,
  NotificationRecipient,
  NotificationType,
} from "../types";

// ============================================================================
// INTERFACES
// ============================================================================

interface EventData {
  type: string;
  entityId: string;
  entityType: string;
  userId?: string;
  clinicId: string;
  timestamp: Date;
  data: Record<string, any>;
  metadata?: Record<string, any>;
}

interface RuleExecution {
  ruleId: string;
  eventId: string;
  triggered: boolean;
  conditionsMet: boolean;
  actionsExecuted: number;
  errors: string[];
  executedAt: Date;
  duration: number;
}

interface AutomationStats {
  totalRules: number;
  activeRules: number;
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  averageExecutionTime: number;
}

// ============================================================================
// AUTOMATION ENGINE
// ============================================================================

/**
 * Motor de automação de notificações
 */
export class AutomationEngine {
  private rules: Map<string, AutomationRule> = new Map();
  private executionHistory: RuleExecution[] = [];
  private isRunning = false;

  constructor(
    private notificationManager: NotificationManager,
    private templateEngine: TemplateEngine,
  ) {}

  // ============================================================================
  // GERENCIAMENTO DE REGRAS
  // ============================================================================

  /**
   * Adiciona regra de automação
   */
  addRule(rule: AutomationRule): void {
    this.validateRule(rule);
    this.rules.set(rule.id, rule);
    console.log(`📋 Regra de automação adicionada: ${rule.name}`);
  }

  /**
   * Remove regra de automação
   */
  removeRule(ruleId: string): boolean {
    const removed = this.rules.delete(ruleId);
    if (removed) {
      console.log(`🗑️ Regra de automação removida: ${ruleId}`);
    }
    return removed;
  }

  /**
   * Atualiza regra de automação
   */
  updateRule(ruleId: string, updates: Partial<AutomationRule>): boolean {
    const rule = this.rules.get(ruleId);
    if (!rule) return false;

    const updatedRule = { ...rule, ...updates, id: ruleId };
    this.validateRule(updatedRule);
    this.rules.set(ruleId, updatedRule);

    console.log(`✏️ Regra de automação atualizada: ${rule.name}`);
    return true;
  }

  /**
   * Obtém regra por ID
   */
  getRule(ruleId: string): AutomationRule | undefined {
    return this.rules.get(ruleId);
  }

  /**
   * Lista todas as regras
   */
  getAllRules(): AutomationRule[] {
    return Array.from(this.rules.values());
  }

  /**
   * Lista regras ativas
   */
  getActiveRules(): AutomationRule[] {
    return Array.from(this.rules.values()).filter((rule) => rule.isActive);
  }

  // ============================================================================
  // PROCESSAMENTO DE EVENTOS
  // ============================================================================

  /**
   * Processa evento e executa regras aplicáveis
   */
  async processEvent(event: EventData): Promise<RuleExecution[]> {
    if (!this.isRunning) {
      console.warn("⚠️ Motor de automação não está rodando");
      return [];
    }

    const executions: RuleExecution[] = [];
    const applicableRules = this.findApplicableRules(event);

    console.log(
      `🔄 Processando evento ${event.type} - ${applicableRules.length} regras aplicáveis`,
    );

    for (const rule of applicableRules) {
      const execution = await this.executeRule(rule, event);
      executions.push(execution);
      this.executionHistory.push(execution);
    }

    // Limitar histórico
    if (this.executionHistory.length > 1000) {
      this.executionHistory = this.executionHistory.slice(-1000);
    }

    return executions;
  }

  /**
   * Encontra regras aplicáveis ao evento
   */
  private findApplicableRules(event: EventData): AutomationRule[] {
    return this.getActiveRules().filter((rule) => {
      // Verificar se o trigger corresponde ao evento
      return this.matchesTrigger(rule.trigger, event);
    });
  }

  /**
   * Verifica se o trigger corresponde ao evento
   */
  private matchesTrigger(trigger: AutomationTrigger, event: EventData): boolean {
    // Verificar tipo de evento
    if (trigger.eventType !== event.type) {
      return false;
    }

    // Verificar tipo de entidade se especificado
    if (trigger.entityType && trigger.entityType !== event.entityType) {
      return false;
    }

    // Verificar clínica se especificado
    if (trigger.clinicId && trigger.clinicId !== event.clinicId) {
      return false;
    }

    // Verificar condições do trigger
    if (trigger.conditions && trigger.conditions.length > 0) {
      return this.evaluateConditions(trigger.conditions, event);
    }

    return true;
  }

  // ============================================================================
  // EXECUÇÃO DE REGRAS
  // ============================================================================

  /**
   * Executa regra específica
   */
  private async executeRule(rule: AutomationRule, event: EventData): Promise<RuleExecution> {
    const startTime = Date.now();
    const execution: RuleExecution = {
      ruleId: rule.id,
      eventId: event.entityId,
      triggered: true,
      conditionsMet: false,
      actionsExecuted: 0,
      errors: [],
      executedAt: new Date(),
      duration: 0,
    };

    try {
      // Avaliar condições
      if (rule.conditions && rule.conditions.length > 0) {
        execution.conditionsMet = this.evaluateConditions(rule.conditions, event);
      } else {
        execution.conditionsMet = true;
      }

      // Executar ações se condições foram atendidas
      if (execution.conditionsMet) {
        for (const action of rule.actions) {
          try {
            await this.executeAction(action, event, rule);
            execution.actionsExecuted++;
          } catch (error) {
            const errorMsg = error instanceof Error ? error.message : "Erro desconhecido";
            execution.errors.push(`Ação ${action.type}: ${errorMsg}`);
            console.error(`❌ Erro ao executar ação ${action.type}:`, error);
          }
        }
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Erro desconhecido";
      execution.errors.push(`Execução da regra: ${errorMsg}`);
      console.error(`❌ Erro ao executar regra ${rule.name}:`, error);
    }

    execution.duration = Date.now() - startTime;

    console.log(
      `✅ Regra ${rule.name} executada em ${execution.duration}ms - ` +
        `${execution.actionsExecuted} ações, ${execution.errors.length} erros`,
    );

    return execution;
  }

  /**
   * Avalia condições
   */
  private evaluateConditions(conditions: AutomationCondition[], event: EventData): boolean {
    return conditions.every((condition) => this.evaluateCondition(condition, event));
  }

  /**
   * Avalia condição individual
   */
  private evaluateCondition(condition: AutomationCondition, event: EventData): boolean {
    const value = this.getValueFromEvent(condition.field, event);

    switch (condition.operator) {
      case "equals":
        return value === condition.value;
      case "not_equals":
        return value !== condition.value;
      case "greater_than":
        return Number(value) > Number(condition.value);
      case "less_than":
        return Number(value) < Number(condition.value);
      case "greater_equal":
        return Number(value) >= Number(condition.value);
      case "less_equal":
        return Number(value) <= Number(condition.value);
      case "contains":
        return String(value).includes(String(condition.value));
      case "not_contains":
        return !String(value).includes(String(condition.value));
      case "starts_with":
        return String(value).startsWith(String(condition.value));
      case "ends_with":
        return String(value).endsWith(String(condition.value));
      case "in":
        return Array.isArray(condition.value) && condition.value.includes(value);
      case "not_in":
        return Array.isArray(condition.value) && !condition.value.includes(value);
      case "exists":
        return value !== undefined && value !== null;
      case "not_exists":
        return value === undefined || value === null;
      default:
        console.warn(`⚠️ Operador desconhecido: ${condition.operator}`);
        return false;
    }
  }

  /**
   * Obtém valor do evento baseado no campo
   */
  private getValueFromEvent(field: string, event: EventData): any {
    const parts = field.split(".");
    let value: any = event;

    for (const part of parts) {
      if (value && typeof value === "object") {
        value = value[part];
      } else {
        return undefined;
      }
    }

    return value;
  }

  // ============================================================================
  // EXECUÇÃO DE AÇÕES
  // ============================================================================

  /**
   * Executa ação específica
   */
  private async executeAction(
    action: AutomationAction,
    event: EventData,
    rule: AutomationRule,
  ): Promise<void> {
    switch (action.type) {
      case "send_notification":
        await this.executeSendNotificationAction(action, event, rule);
        break;
      case "delay":
        await this.executeDelayAction(action);
        break;
      case "webhook":
        await this.executeWebhookAction(action, event);
        break;
      case "update_entity":
        await this.executeUpdateEntityAction(action, event);
        break;
      default:
        throw new Error(`Tipo de ação não suportado: ${action.type}`);
    }
  }

  /**
   * Executa ação de envio de notificação
   */
  private async executeSendNotificationAction(
    action: AutomationAction,
    event: EventData,
    rule: AutomationRule,
  ): Promise<void> {
    const config = action.config;

    // Determinar destinatários
    const recipients = await this.resolveRecipients(config.recipients, event);

    // Renderizar template
    const templateData = this.buildTemplateData(event, rule);
    const content = await this.templateEngine.render(config.templateId, templateData);

    // Enviar notificação para cada destinatário
    for (const recipient of recipients) {
      const context: NotificationContext = {
        notificationId: `auto_${rule.id}_${Date.now()}`,
        type: config.notificationType || NotificationType.SYSTEM,
        priority: config.priority || NotificationPriority.MEDIUM,
        channels: config.channels || [NotificationChannel.IN_APP],
        recipient,
        clinic: {
          id: event.clinicId,
          name: "Clínica", // TODO: Buscar nome real da clínica
        },
        timestamp: new Date(),
        metadata: {
          automationRuleId: rule.id,
          automationRuleName: rule.name,
          triggerEvent: event.type,
          triggerEntityId: event.entityId,
        },
      };

      await this.notificationManager.send(context, content);
    }
  }

  /**
   * Executa ação de delay
   */
  private async executeDelayAction(action: AutomationAction): Promise<void> {
    const delayMs = action.config.duration || 1000;
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }

  /**
   * Executa ação de webhook
   */
  private async executeWebhookAction(action: AutomationAction, event: EventData): Promise<void> {
    const config = action.config;

    const response = await fetch(config.url, {
      method: config.method || "POST",
      headers: {
        "Content-Type": "application/json",
        ...config.headers,
      },
      body: JSON.stringify({
        event,
        timestamp: new Date().toISOString(),
        ...config.payload,
      }),
    });

    if (!response.ok) {
      throw new Error(`Webhook falhou: ${response.status} ${response.statusText}`);
    }
  }

  /**
   * Executa ação de atualização de entidade
   */
  private async executeUpdateEntityAction(
    action: AutomationAction,
    event: EventData,
  ): Promise<void> {
    // Implementar atualização de entidade
    console.log("🔄 Atualizando entidade:", {
      entityId: event.entityId,
      entityType: event.entityType,
      updates: action.config.updates,
    });
  }

  // ============================================================================
  // UTILITÁRIOS
  // ============================================================================

  /**
   * Resolve destinatários baseado na configuração
   */
  private async resolveRecipients(
    recipientConfig: any,
    event: EventData,
  ): Promise<NotificationRecipient[]> {
    const recipients: NotificationRecipient[] = [];

    // Destinatários específicos
    if (recipientConfig.userIds) {
      for (const userId of recipientConfig.userIds) {
        recipients.push({
          id: userId,
          type: "user",
          name: `Usuário ${userId}`, // TODO: Buscar nome real
          email: `user${userId}@example.com`, // TODO: Buscar email real
          phone: undefined,
        });
      }
    }

    // Destinatários por papel
    if (recipientConfig.roles) {
      // TODO: Implementar busca de usuários por papel
    }

    // Destinatário do evento
    if (recipientConfig.includeEventUser && event.userId) {
      recipients.push({
        id: event.userId,
        type: "user",
        name: `Usuário ${event.userId}`,
        email: `user${event.userId}@example.com`,
        phone: undefined,
      });
    }

    return recipients;
  }

  /**
   * Constrói dados para template
   */
  private buildTemplateData(event: EventData, rule: AutomationRule): Record<string, any> {
    return {
      event: {
        type: event.type,
        entityId: event.entityId,
        entityType: event.entityType,
        timestamp: event.timestamp,
        data: event.data,
      },
      rule: {
        id: rule.id,
        name: rule.name,
        description: rule.description,
      },
      clinic: {
        id: event.clinicId,
      },
      now: new Date(),
      ...event.data,
    };
  }

  /**
   * Valida regra de automação
   */
  private validateRule(rule: AutomationRule): void {
    if (!rule.id) {
      throw new Error("ID da regra é obrigatório");
    }

    if (!rule.name) {
      throw new Error("Nome da regra é obrigatório");
    }

    if (!rule.trigger) {
      throw new Error("Trigger da regra é obrigatório");
    }

    if (!rule.actions || rule.actions.length === 0) {
      throw new Error("Pelo menos uma ação é obrigatória");
    }

    // Validar ações
    for (const action of rule.actions) {
      if (!action.type) {
        throw new Error("Tipo da ação é obrigatório");
      }

      if (action.type === "send_notification" && !action.config.templateId) {
        throw new Error("Template ID é obrigatório para ação de notificação");
      }
    }
  }

  // ============================================================================
  // CONTROLE DO MOTOR
  // ============================================================================

  /**
   * Inicia o motor de automação
   */
  start(): void {
    this.isRunning = true;
    console.log("🚀 Motor de automação iniciado");
  }

  /**
   * Para o motor de automação
   */
  stop(): void {
    this.isRunning = false;
    console.log("⏹️ Motor de automação parado");
  }

  /**
   * Verifica se o motor está rodando
   */
  get running(): boolean {
    return this.isRunning;
  }

  // ============================================================================
  // ESTATÍSTICAS E MONITORAMENTO
  // ============================================================================

  /**
   * Obtém estatísticas de automação
   */
  getStats(): AutomationStats {
    const totalExecutions = this.executionHistory.length;
    const successfulExecutions = this.executionHistory.filter((e) => e.errors.length === 0).length;
    const failedExecutions = totalExecutions - successfulExecutions;

    const totalDuration = this.executionHistory.reduce((sum, e) => sum + e.duration, 0);
    const averageExecutionTime = totalExecutions > 0 ? totalDuration / totalExecutions : 0;

    return {
      totalRules: this.rules.size,
      activeRules: this.getActiveRules().length,
      totalExecutions,
      successfulExecutions,
      failedExecutions,
      averageExecutionTime,
    };
  }

  /**
   * Obtém histórico de execuções
   */
  getExecutionHistory(limit = 100): RuleExecution[] {
    return this.executionHistory.slice(-limit);
  }

  /**
   * Limpa histórico de execuções
   */
  clearExecutionHistory(): void {
    this.executionHistory = [];
    console.log("🧹 Histórico de execuções limpo");
  }
}

export default AutomationEngine;
