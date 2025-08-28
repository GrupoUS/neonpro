/**
 * Phase 4: Workflow Automation Service
 *
 * Orchestrates automated intervention workflows based on ML predictions.
 * Integrates with existing no-show prediction and intervention services
 * to create seamless staff workflows with real-time risk management.
 *
 * Features:
 * - Rule-based automation engine
 * - Real-time staff alert generation
 * - Intervention scheduling and escalation
 * - Performance monitoring and ROI tracking
 */

import type { RiskScoreData, StaffAlert, StaffMember } from "@/components/no-show-activation";

// Workflow Configuration Types
export interface WorkflowRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  priority: number;
  triggers: WorkflowTrigger[];
  conditions: WorkflowCondition[];
  actions: WorkflowAction[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface WorkflowTrigger {
  type:
    | "risk_threshold"
    | "time_based"
    | "manual"
    | "appointment_created"
    | "patient_behavior";
  config: {
    riskThreshold?: number;
    timeBeforeAppointment?: number;
    schedulePattern?: string;
    behaviorPattern?: string;
    [key: string]: any;
  };
}

export interface WorkflowCondition {
  field: string;
  operator: "equals" | "greater_than" | "less_than" | "contains" | "not_equals";
  value: any;
  logicalOperator?: "AND" | "OR";
}

export interface WorkflowAction {
  type:
    | "send_alert"
    | "schedule_intervention"
    | "assign_staff"
    | "update_status"
    | "log_event";
  config: {
    alertType?: "high_risk" | "critical_risk" | "intervention_needed";
    staffRole?: string[];
    staffMember?: string;
    interventionType?: "sms" | "email" | "phone_call";
    delayMinutes?: number;
    template?: string;
    [key: string]: any;
  };
}

export interface WorkflowExecution {
  id: string;
  workflowRuleId: string;
  appointmentId: string;
  patientId: string;
  triggeredBy: string;
  triggeredAt: string;
  status: "pending" | "running" | "completed" | "failed" | "cancelled";
  steps: WorkflowStep[];
  results: WorkflowResult[];
  error?: string;
}

export interface WorkflowStep {
  id: string;
  actionType: string;
  status: "pending" | "running" | "completed" | "failed" | "skipped";
  startedAt?: string;
  completedAt?: string;
  result?: any;
  error?: string;
}

export interface WorkflowResult {
  stepId: string;
  success: boolean;
  data?: any;
  message?: string;
  timestamp: string;
}

export interface AutomationMetrics {
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  averageExecutionTime: number;
  alertsSent: number;
  interventionsTriggered: number;
  staffEngagement: {
    totalAlerts: number;
    acknowledgedAlerts: number;
    responseTime: number;
  };
  riskPrevention: {
    highRiskPrevented: number;
    estimatedSavings: number;
    interventionSuccess: number;
  };
}

class WorkflowAutomationService {
  private static instance: WorkflowAutomationService;
  private rules: Map<string, WorkflowRule> = new Map();
  private executions: Map<string, WorkflowExecution> = new Map();
  private alertCallbacks: ((alert: StaffAlert) => void)[] = [];
  private metricsCallbacks: ((metrics: AutomationMetrics) => void)[] = [];

  private constructor() {
    this.initializeDefaultRules();
    this.startPeriodicChecks();
  }

  public static getInstance(): WorkflowAutomationService {
    if (!WorkflowAutomationService.instance) {
      WorkflowAutomationService.instance = new WorkflowAutomationService();
    }
    return WorkflowAutomationService.instance;
  }

  // Rule Management
  public addRule(
    rule: Omit<WorkflowRule, "id" | "createdAt" | "updatedAt">,
  ): string {
    const ruleId = `rule_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const fullRule: WorkflowRule = {
      ...rule,
      id: ruleId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.rules.set(ruleId, fullRule);
    console.log(`🔧 Workflow rule added: ${rule.name}`);
    return ruleId;
  }

  public updateRule(ruleId: string, updates: Partial<WorkflowRule>): boolean {
    const rule = this.rules.get(ruleId);
    if (!rule) {
      return false;
    }

    const updatedRule = {
      ...rule,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.rules.set(ruleId, updatedRule);
    console.log(`🔧 Workflow rule updated: ${ruleId}`);
    return true;
  }

  public deleteRule(ruleId: string): boolean {
    const deleted = this.rules.delete(ruleId);
    if (deleted) {
      console.log(`🔧 Workflow rule deleted: ${ruleId}`);
    }
    return deleted;
  }

  public getRules(): WorkflowRule[] {
    return Array.from(this.rules.values()).sort(
      (a, b) => b.priority - a.priority,
    );
  }

  // Workflow Execution
  public async processRiskScore(
    appointmentId: string,
    patientId: string,
    riskData: RiskScoreData,
    staffMembers: StaffMember[],
  ): Promise<string[]> {
    console.log(
      `🤖 Processing risk score for appointment ${appointmentId}: ${
        Math.round(
          riskData.noShowProbability * 100,
        )
      }%`,
    );

    const applicableRules = this.findApplicableRules(riskData, appointmentId);
    const executionIds: string[] = [];

    for (const rule of applicableRules) {
      if (!rule.enabled) {
        continue;
      }

      const executionId = await this.executeWorkflow(
        rule,
        appointmentId,
        patientId,
        riskData,
        staffMembers,
      );
      if (executionId) {
        executionIds.push(executionId);
      }
    }

    return executionIds;
  }

  private async executeWorkflow(
    rule: WorkflowRule,
    appointmentId: string,
    patientId: string,
    riskData: RiskScoreData,
    staffMembers: StaffMember[],
  ): Promise<string | null> {
    const executionId = `exec_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

    const execution: WorkflowExecution = {
      id: executionId,
      workflowRuleId: rule.id,
      appointmentId,
      patientId,
      triggeredBy: "system",
      triggeredAt: new Date().toISOString(),
      status: "pending",
      steps: [],
      results: [],
    };

    this.executions.set(executionId, execution);

    try {
      execution.status = "running";
      console.log(
        `⚡ Executing workflow: ${rule.name} for appointment ${appointmentId}`,
      );

      // Execute each action in the workflow
      for (let i = 0; i < rule.actions.length; i++) {
        const action = rule.actions[i];
        const stepId = `step_${i}_${Date.now()}`;

        const step: WorkflowStep = {
          id: stepId,
          actionType: action.type,
          status: "running",
          startedAt: new Date().toISOString(),
        };

        execution.steps.push(step);

        try {
          const result = await this.executeAction(
            action,
            appointmentId,
            patientId,
            riskData,
            staffMembers,
          );

          step.status = "completed";
          step.completedAt = new Date().toISOString();
          step.result = result;

          execution.results.push({
            stepId,
            success: true,
            data: result,
            message: `Action ${action.type} completed successfully`,
            timestamp: new Date().toISOString(),
          });
        } catch (error) {
          step.status = "failed";
          step.error = error instanceof Error ? error.message : String(error);
          step.completedAt = new Date().toISOString();

          execution.results.push({
            stepId,
            success: false,
            message: `Action ${action.type} failed: ${step.error}`,
            timestamp: new Date().toISOString(),
          });

          console.error(`❌ Workflow step failed: ${action.type}`, error);
        }
      }

      execution.status = "completed";
      console.log(`✅ Workflow completed: ${rule.name}`);
    } catch (error) {
      execution.status = "failed";
      execution.error = error instanceof Error ? error.message : String(error);
      console.error(`❌ Workflow execution failed: ${rule.name}`, error);
    }

    this.executions.set(executionId, execution);
    return executionId;
  }

  private async executeAction(
    action: WorkflowAction,
    appointmentId: string,
    patientId: string,
    riskData: RiskScoreData,
    staffMembers: StaffMember[],
  ): Promise<any> {
    switch (action.type) {
      case "send_alert":
        return this.sendStaffAlert(
          action,
          appointmentId,
          patientId,
          riskData,
          staffMembers,
        );

      case "schedule_intervention":
        return this.scheduleIntervention(
          action,
          appointmentId,
          patientId,
          riskData,
        );

      case "assign_staff":
        return this.assignStaff(action, appointmentId, staffMembers);

      case "update_status":
        return this.updateAppointmentStatus(action, appointmentId);

      case "log_event":
        return this.logWorkflowEvent(
          action,
          appointmentId,
          patientId,
          riskData,
        );

      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }
  }

  private async sendStaffAlert(
    action: WorkflowAction,
    appointmentId: string,
    patientId: string,
    riskData: RiskScoreData,
    staffMembers: StaffMember[],
  ): Promise<any> {
    const alertType = action.config.alertType || "high_risk";
    const targetStaff = this.findTargetStaff(action.config, staffMembers);

    for (const staff of targetStaff) {
      const alert: StaffAlert = {
        id: `alert_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
        type: alertType,
        priority: riskData.riskCategory === "critical"
          ? "critical"
          : riskData.riskCategory === "high"
          ? "high"
          : "medium",
        title: this.generateAlertTitle(alertType, riskData),
        message: this.generateAlertMessage(alertType, riskData, appointmentId),
        appointmentId,
        patientId,
        assignedTo: staff.id,
        assignedToName: staff.name,
        createdAt: new Date().toISOString(),
        status: "unread",
        actions: this.generateAlertActions(alertType, appointmentId),
        metadata: {
          riskScore: riskData.noShowProbability,
          appointmentTime: new Date().toISOString(), // Would get actual appointment time
          interventionsCount: 0,
        },
      };

      // Send alert through callbacks
      this.alertCallbacks.forEach((callback) => callback(alert));
    }

    return {
      alertsSent: targetStaff.length,
      targetStaff: targetStaff.map((s) => s.id),
    };
  }

  private async scheduleIntervention(
    action: WorkflowAction,
    appointmentId: string,
    patientId: string,
    riskData: RiskScoreData,
  ): Promise<any> {
    // Integration point with existing intervention service
    const interventionType = action.config.interventionType || "sms";
    const delayMinutes = action.config.delayMinutes || 0;

    console.log(
      `📅 Scheduling ${interventionType} intervention for appointment ${appointmentId} in ${delayMinutes} minutes`,
    );

    // This would integrate with packages/ai/src/services/automated-intervention-service.ts
    return {
      scheduled: true,
      interventionType,
      scheduledFor: new Date(Date.now() + delayMinutes * 60_000).toISOString(),
      appointmentId,
      patientId,
    };
  }

  private async assignStaff(
    action: WorkflowAction,
    appointmentId: string,
    staffMembers: StaffMember[],
  ): Promise<any> {
    const targetStaff = this.findTargetStaff(action.config, staffMembers);
    if (targetStaff.length === 0) {
      throw new Error("No available staff members found for assignment");
    }

    const assignedStaff = targetStaff[0]; // Assign to first available
    console.log(
      `👤 Assigning appointment ${appointmentId} to ${assignedStaff.name}`,
    );

    return {
      assigned: true,
      appointmentId,
      staffId: assignedStaff.id,
      staffName: assignedStaff.name,
    };
  }

  private async updateAppointmentStatus(
    action: WorkflowAction,
    appointmentId: string,
  ): Promise<any> {
    const newStatus = action.config.status || "flagged_for_intervention";
    console.log(
      `🔄 Updating appointment ${appointmentId} status to ${newStatus}`,
    );

    return {
      updated: true,
      appointmentId,
      previousStatus: "scheduled", // Would get actual status
      newStatus,
    };
  }

  private async logWorkflowEvent(
    action: WorkflowAction,
    appointmentId: string,
    patientId: string,
    riskData: RiskScoreData,
  ): Promise<any> {
    const event = {
      timestamp: new Date().toISOString(),
      type: "workflow_automation",
      appointmentId,
      patientId,
      riskScore: riskData.noShowProbability,
      riskCategory: riskData.riskCategory,
      confidence: riskData.confidenceScore,
      message: action.config.message || "Workflow automation event logged",
    };

    console.log(`📝 Logging workflow event:`, event);
    return event;
  }

  // Utility Methods
  private findApplicableRules(
    riskData: RiskScoreData,
    appointmentId: string,
  ): WorkflowRule[] {
    return Array.from(this.rules.values()).filter((rule) => {
      return rule.triggers.some((trigger) => {
        switch (trigger.type) {
          case "risk_threshold":
            return (
              riskData.noShowProbability
                >= (trigger.config.riskThreshold || 0.75)
            );
          case "time_based":
            // Would implement time-based triggers
            return true;
          default:
            return false;
        }
      });
    });
  }

  private findTargetStaff(
    config: any,
    staffMembers: StaffMember[],
  ): StaffMember[] {
    if (config.staffMember) {
      const staff = staffMembers.find((s) => s.id === config.staffMember);
      return staff ? [staff] : [];
    }

    if (config.staffRole && Array.isArray(config.staffRole)) {
      return staffMembers.filter(
        (staff) => config.staffRole.includes(staff.role) && staff.online,
      );
    }

    // Default: return all online staff
    return staffMembers.filter((staff) => staff.online);
  }

  private generateAlertTitle(
    alertType: string,
    riskData: RiskScoreData,
  ): string {
    const riskPercentage = Math.round(riskData.noShowProbability * 100);

    switch (alertType) {
      case "critical_risk":
        return `🚨 Risco Crítico de Falta - ${riskPercentage}%`;
      case "high_risk":
        return `⚠️ Alto Risco de Falta - ${riskPercentage}%`;
      case "intervention_needed":
        return `📞 Intervenção Necessária - ${riskPercentage}%`;
      default:
        return `📊 Alerta de Risco - ${riskPercentage}%`;
    }
  }

  private generateAlertMessage(
    alertType: string,
    riskData: RiskScoreData,
    appointmentId: string,
  ): string {
    const riskPercentage = Math.round(riskData.noShowProbability * 100);
    const confidence = Math.round(riskData.confidenceScore * 100);

    return `Consulta ${appointmentId} apresenta ${riskPercentage}% de probabilidade de falta (confiança: ${confidence}%). ${
      alertType === "critical_risk"
        ? "Ação imediata recomendada."
        : alertType === "high_risk"
        ? "Considere entrar em contato com o paciente."
        : "Monitore a situação e considere intervenção."
    }`;
  }

  private generateAlertActions(
    alertType: string,
    appointmentId: string,
  ): any[] {
    const baseActions = [
      {
        id: "acknowledge",
        label: "Reconhecer",
        type: "secondary",
        handler: "acknowledge_alert",
      },
      {
        id: "view_details",
        label: "Ver Detalhes",
        type: "primary",
        handler: "view_appointment_details",
      },
    ];

    if (alertType === "critical_risk" || alertType === "high_risk") {
      baseActions.push(
        {
          id: "contact_patient",
          label: "Contatar Paciente",
          type: "primary",
          handler: "contact_patient",
        },
        {
          id: "schedule_intervention",
          label: "Agendar Intervenção",
          type: "primary",
          handler: "schedule_intervention",
        },
      );
    }

    return baseActions;
  }

  private initializeDefaultRules(): void {
    // Critical Risk Alert Rule
    this.addRule({
      name: "Alerta de Risco Crítico",
      description: "Envia alerta para equipe quando risco de falta for crítico (>85%)",
      enabled: true,
      priority: 100,
      triggers: [
        {
          type: "risk_threshold",
          config: { riskThreshold: 0.85 },
        },
      ],
      conditions: [],
      actions: [
        {
          type: "send_alert",
          config: {
            alertType: "critical_risk",
            staffRole: ["reception", "nurse", "coordinator"],
          },
        },
      ],
      createdBy: "system",
    });

    // High Risk Intervention Rule
    this.addRule({
      name: "Intervenção Alto Risco",
      description: "Agenda intervenção automática para consultas de alto risco (>65%)",
      enabled: true,
      priority: 80,
      triggers: [
        {
          type: "risk_threshold",
          config: { riskThreshold: 0.65 },
        },
      ],
      conditions: [],
      actions: [
        {
          type: "send_alert",
          config: {
            alertType: "intervention_needed",
            staffRole: ["reception"],
          },
        },
        {
          type: "schedule_intervention",
          config: {
            interventionType: "sms",
            delayMinutes: 30,
            template: "high_risk_reminder",
          },
        },
      ],
      createdBy: "system",
    });

    console.log(`🔧 Initialized ${this.rules.size} default workflow rules`);
  }

  private startPeriodicChecks(): void {
    // Run periodic checks every minute
    setInterval(() => {
      this.runPeriodicTasks();
    }, 60_000);
  }

  private runPeriodicTasks(): void {
    // Clean up old executions
    const cutoffTime = Date.now() - 24 * 60 * 60 * 1000; // 24 hours

    for (const [id, execution] of this.executions) {
      if (new Date(execution.triggeredAt).getTime() < cutoffTime) {
        this.executions.delete(id);
      }
    }
  }

  // Public API for registering callbacks
  public onAlertGenerated(callback: (alert: StaffAlert) => void): void {
    this.alertCallbacks.push(callback);
  }

  public onMetricsUpdate(callback: (metrics: AutomationMetrics) => void): void {
    this.metricsCallbacks.push(callback);
  }

  // Metrics and Monitoring
  public getExecutionMetrics(): AutomationMetrics {
    const executions = Array.from(this.executions.values());
    const successful = executions.filter((e) => e.status === "completed");
    const failed = executions.filter((e) => e.status === "failed");

    const totalExecTime = successful.reduce((sum, exec) => {
      const start = new Date(exec.triggeredAt).getTime();
      const lastStep = exec.steps[exec.steps.length - 1];
      if (lastStep?.completedAt) {
        const end = new Date(lastStep.completedAt).getTime();
        return sum + (end - start);
      }
      return sum;
    }, 0);

    return {
      totalExecutions: executions.length,
      successfulExecutions: successful.length,
      failedExecutions: failed.length,
      averageExecutionTime: successful.length > 0 ? totalExecTime / successful.length : 0,
      alertsSent: this.countActionResults("send_alert"),
      interventionsTriggered: this.countActionResults("schedule_intervention"),
      staffEngagement: {
        totalAlerts: this.countActionResults("send_alert"),
        acknowledgedAlerts: 0, // Would track from actual alert interactions
        responseTime: 0, // Would calculate from alert interactions
      },
      riskPrevention: {
        highRiskPrevented: 0, // Would track prevented no-shows
        estimatedSavings: 0, // Would calculate based on prevented no-shows
        interventionSuccess: 0, // Would track intervention success rate
      },
    };
  }

  private countActionResults(actionType: string): number {
    let count = 0;
    for (const execution of this.executions.values()) {
      count += execution.results.filter(
        (r) =>
          r.success
          && execution.steps.find(
            (s) => s.id === r.stepId && s.actionType === actionType,
          ),
      ).length;
    }
    return count;
  }

  public getExecutions(): WorkflowExecution[] {
    return Array.from(this.executions.values()).sort(
      (a, b) => new Date(b.triggeredAt).getTime() - new Date(a.triggeredAt).getTime(),
    );
  }
}

// Export singleton instance
export const workflowAutomationService = WorkflowAutomationService.getInstance();
export default WorkflowAutomationService;
