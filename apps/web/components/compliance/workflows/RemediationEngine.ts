/**
 * RemediationEngine - Automated remediation workflow system for compliance violations
 * Provides remediation suggestions, tracks progress, and manages violation resolution workflows
 */

import type { ComplianceFramework, ComplianceViolation, ViolationSeverity } from "../types";
import type { ViolationDetectionRule } from "./ViolationDetector";

export interface RemediationAction {
  id: string;
  type: "manual" | "automated" | "semi_automated";
  title: string;
  description: string;
  framework: ComplianceFramework;
  category: string;
  estimatedEffort: "low" | "medium" | "high";
  estimatedDuration: number; // hours
  prerequisites: string[];
  steps: RemediationStep[];
  validation: {
    type: "automatic" | "manual" | "peer_review";
    criteria: string[];
  };
  resources: RemediationResource[];
}

export interface RemediationStep {
  id: string;
  order: number;
  title: string;
  description: string;
  type: "code_change" | "configuration" | "documentation" | "testing" | "review";
  assignee?: string;
  status: "pending" | "in_progress" | "completed" | "blocked";
  blockingReason?: string;
  estimatedDuration: number; // minutes
  actualDuration?: number;
  completedAt?: Date;
  evidence?: string[];
  automationPossible: boolean;
  automationScript?: string;
}

export interface RemediationResource {
  type: "documentation" | "tool" | "tutorial" | "template" | "checklist";
  title: string;
  url: string;
  description: string;
}

export interface RemediationWorkflow {
  id: string;
  violationId: string;
  framework: ComplianceFramework;
  status: "created" | "assigned" | "in_progress" | "review" | "completed" | "cancelled";
  priority: "low" | "medium" | "high" | "critical";
  assignedTo?: string;
  createdAt: Date;
  updatedAt: Date;
  dueDate?: Date;
  completedAt?: Date;
  actions: RemediationAction[];
  selectedAction?: string;
  progress: {
    totalSteps: number;
    completedSteps: number;
    percentage: number;
  };
  timeline: RemediationTimelineEvent[];
  estimatedEffort: number; // total hours
  actualEffort?: number; // actual hours spent
  blockers: {
    id: string;
    description: string;
    severity: "low" | "medium" | "high";
    createdAt: Date;
    resolvedAt?: Date;
  }[];
  metrics: {
    timeToResolution?: number; // hours
    escalations: number;
    reopenCount: number;
    satisfactionRating?: number; // 1-5
  };
}

export interface RemediationTimelineEvent {
  id: string;
  type:
    | "created"
    | "assigned"
    | "started"
    | "paused"
    | "resumed"
    | "completed"
    | "escalated"
    | "commented";
  timestamp: Date;
  user: string;
  description: string;
  data?: unknown;
}

export interface AutoRemediationResult {
  success: boolean;
  violationId: string;
  action: string;
  appliedFixes: string[];
  verification: {
    passed: boolean;
    details: string;
  };
  rollbackAvailable: boolean;
  error?: string;
}

export class RemediationEngine {
  private workflows: Map<string, RemediationWorkflow> = new Map();
  private actions: Map<string, RemediationAction> = new Map();
  private autoRemediationQueue: string[] = [];
  private isProcessingQueue: boolean = false;

  constructor() {
    this.initializeRemediationActions();
    this.startQueueProcessor();
  }

  /**
   * Create remediation workflow for a detected violation
   */
  async createWorkflow(
    violation: ComplianceViolation,
    detectionRule?: ViolationDetectionRule,
  ): Promise<RemediationWorkflow> {
    console.log(`🔧 Creating remediation workflow for violation: ${violation.rule}`);

    // Generate appropriate remediation actions
    const actions = await this.generateRemediationActions(violation, detectionRule);

    const workflow: RemediationWorkflow = {
      id: `workflow_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      violationId: violation.id,
      framework: violation.framework,
      status: "created",
      priority: this.mapSeverityToPriority(violation.severity),
      createdAt: new Date(),
      updatedAt: new Date(),
      dueDate: this.calculateDueDate(violation.severity),
      actions,
      progress: {
        totalSteps: 0,
        completedSteps: 0,
        percentage: 0,
      },
      timeline: [{
        id: `event_${Date.now()}`,
        type: "created",
        timestamp: new Date(),
        user: "system",
        description: "Remediation workflow created automatically",
      }],
      estimatedEffort: actions.reduce((total, action) => total + action.estimatedDuration, 0),
      blockers: [],
      metrics: {
        escalations: 0,
        reopenCount: 0,
      },
    };

    // Store workflow
    this.workflows.set(workflow.id, workflow);

    // Queue for auto-remediation if applicable
    const hasAutoAction = actions.some(action => action.type === "automated");
    if (hasAutoAction) {
      this.autoRemediationQueue.push(workflow.id);
    }

    console.log(
      `✅ Remediation workflow created: ${workflow.id} (${actions.length} actions, ${workflow.estimatedEffort}h estimated)`,
    );

    return workflow;
  }

  /**
   * Assign workflow to a team member
   */
  async assignWorkflow(
    workflowId: string,
    assignee: string,
    reason?: string,
  ): Promise<RemediationWorkflow> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow not found: ${workflowId}`);
    }

    workflow.assignedTo = assignee;
    workflow.status = "assigned";
    workflow.updatedAt = new Date();

    // Add timeline event
    workflow.timeline.push({
      id: `event_${Date.now()}`,
      type: "assigned",
      timestamp: new Date(),
      user: "system",
      description: `Assigned to ${assignee}${reason ? ` - ${reason}` : ""}`,
      data: { assignee, reason },
    });

    console.log(`👥 Workflow ${workflowId} assigned to ${assignee}`);

    return workflow;
  }

  /**
   * Start workflow execution
   */
  async startWorkflow(workflowId: string, selectedActionId?: string): Promise<RemediationWorkflow> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow not found: ${workflowId}`);
    }

    // Select remediation action
    if (selectedActionId) {
      workflow.selectedAction = selectedActionId;
    } else {
      // Auto-select best action based on priority and effort
      const bestAction = this.selectBestAction(workflow.actions);
      workflow.selectedAction = bestAction?.id;
    }

    if (!workflow.selectedAction) {
      throw new Error("No remediation action selected");
    }

    const selectedAction = workflow.actions.find(a => a.id === workflow.selectedAction);
    if (!selectedAction) {
      throw new Error("Selected action not found");
    }

    // Initialize step statuses
    selectedAction.steps.forEach(step => {
      if (step.status === "pending") {
        step.status = "pending";
      }
    });

    // Update workflow status
    workflow.status = "in_progress";
    workflow.updatedAt = new Date();
    workflow.progress = this.calculateProgress(selectedAction);

    // Add timeline event
    workflow.timeline.push({
      id: `event_${Date.now()}`,
      type: "started",
      timestamp: new Date(),
      user: workflow.assignedTo || "system",
      description: `Workflow started with action: ${selectedAction.title}`,
      data: { actionId: selectedAction.id },
    });

    console.log(`🚀 Workflow ${workflowId} started with action: ${selectedAction.title}`);

    return workflow;
  }

  /**
   * Update step status in workflow
   */
  async updateStepStatus(
    workflowId: string,
    stepId: string,
    status: RemediationStep["status"],
    evidence?: string[],
    blockingReason?: string,
  ): Promise<RemediationWorkflow> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow || !workflow.selectedAction) {
      throw new Error(`Workflow or selected action not found: ${workflowId}`);
    }

    const action = workflow.actions.find(a => a.id === workflow.selectedAction);
    if (!action) {
      throw new Error("Selected action not found");
    }

    const step = action.steps.find(s => s.id === stepId);
    if (!step) {
      throw new Error(`Step not found: ${stepId}`);
    }

    // Update step
    const previousStatus = step.status;
    step.status = status;
    step.blockingReason = blockingReason;

    if (evidence) {
      step.evidence = [...(step.evidence || []), ...evidence];
    }

    if (status === "completed") {
      step.completedAt = new Date();
      if (step.estimatedDuration) {
        step.actualDuration = step.estimatedDuration; // Mock - would track actual time
      }
    }

    // Update workflow progress
    workflow.progress = this.calculateProgress(action);
    workflow.updatedAt = new Date();

    // Check if workflow is completed
    if (workflow.progress.percentage === 100) {
      workflow.status = "review";
      workflow.timeline.push({
        id: `event_${Date.now()}`,
        type: "completed",
        timestamp: new Date(),
        user: workflow.assignedTo || "system",
        description: "All workflow steps completed - ready for review",
      });
    }

    // Handle blockers
    if (status === "blocked" && blockingReason) {
      workflow.blockers.push({
        id: `blocker_${Date.now()}`,
        description: blockingReason,
        severity: "medium",
        createdAt: new Date(),
      });
    }

    console.log(`📝 Step ${stepId} updated: ${previousStatus} → ${status}`);

    return workflow;
  }

  /**
   * Complete workflow
   */
  async completeWorkflow(
    workflowId: string,
    satisfactionRating?: number,
  ): Promise<RemediationWorkflow> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow not found: ${workflowId}`);
    }

    workflow.status = "completed";
    workflow.completedAt = new Date();
    workflow.updatedAt = new Date();

    // Calculate metrics
    const createdAt = workflow.createdAt.getTime();
    const completedAt = workflow.completedAt.getTime();
    workflow.metrics.timeToResolution = (completedAt - createdAt) / (1000 * 60 * 60); // hours

    if (satisfactionRating) {
      workflow.metrics.satisfactionRating = satisfactionRating;
    }

    // Add timeline event
    workflow.timeline.push({
      id: `event_${Date.now()}`,
      type: "completed",
      timestamp: new Date(),
      user: workflow.assignedTo || "system",
      description: "Workflow completed successfully",
      data: { satisfactionRating },
    });

    console.log(
      `✅ Workflow ${workflowId} completed in ${workflow.metrics.timeToResolution?.toFixed(1)}h`,
    );

    return workflow;
  }

  /**
   * Execute automatic remediation
   */
  async executeAutoRemediation(workflowId: string): Promise<AutoRemediationResult> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow not found: ${workflowId}`);
    }

    const autoActions = workflow.actions.filter(action => action.type === "automated");
    if (autoActions.length === 0) {
      throw new Error("No automated actions available");
    }

    const action = autoActions[0]; // Use first automated action
    console.log(`🤖 Executing auto-remediation: ${action.title}`);

    try {
      // Execute automated fixes
      const appliedFixes: string[] = [];

      for (const step of action.steps) {
        if (step.automationPossible && step.automationScript) {
          // Mock automation execution
          appliedFixes.push(`${step.title}: ${step.description}`);
          step.status = "completed";
          step.completedAt = new Date();
        }
      }

      // Verify fixes
      const verification = await this.verifyAutoRemediation(workflow.violationId, appliedFixes);

      const result: AutoRemediationResult = {
        success: verification.passed,
        violationId: workflow.violationId,
        action: action.id,
        appliedFixes,
        verification,
        rollbackAvailable: true,
      };

      // Update workflow if successful
      if (verification.passed) {
        workflow.selectedAction = action.id;
        workflow.status = "completed";
        workflow.completedAt = new Date();
        workflow.progress = {
          totalSteps: action.steps.length,
          completedSteps: action.steps.length,
          percentage: 100,
        };
      }

      console.log(
        `${result.success ? "✅" : "❌"} Auto-remediation ${
          result.success ? "successful" : "failed"
        } for ${workflowId}`,
      );

      return result;
    } catch (error) {
      return {
        success: false,
        violationId: workflow.violationId,
        action: action.id,
        appliedFixes: [],
        verification: { passed: false, details: "Execution failed" },
        rollbackAvailable: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get workflow by ID
   */
  getWorkflow(workflowId: string): RemediationWorkflow | undefined {
    return this.workflows.get(workflowId);
  }

  /**
   * Get workflows by status
   */
  getWorkflowsByStatus(status: RemediationWorkflow["status"]): RemediationWorkflow[] {
    return Array.from(this.workflows.values()).filter(w => w.status === status);
  }

  /**
   * Get workflows by assignee
   */
  getWorkflowsByAssignee(assignee: string): RemediationWorkflow[] {
    return Array.from(this.workflows.values()).filter(w => w.assignedTo === assignee);
  }

  /**
   * Get workflow statistics
   */
  getWorkflowStatistics(): {
    total: number;
    byStatus: Record<RemediationWorkflow["status"], number>;
    averageResolutionTime: number;
    autoRemediationRate: number;
  } {
    const workflows = Array.from(this.workflows.values());

    const byStatus = workflows.reduce((acc, workflow) => {
      acc[workflow.status] = (acc[workflow.status] || 0) + 1;
      return acc;
    }, {} as Record<RemediationWorkflow["status"], number>);

    const completedWorkflows = workflows.filter(w =>
      w.status === "completed" && w.metrics.timeToResolution
    );
    const averageResolutionTime = completedWorkflows.length > 0
      ? completedWorkflows.reduce((sum, w) => sum + (w.metrics.timeToResolution || 0), 0)
        / completedWorkflows.length
      : 0;

    const autoRemediatedWorkflows = workflows.filter(w =>
      w.actions.some(a => a.type === "automated") && w.status === "completed"
    );
    const autoRemediationRate = workflows.length > 0
      ? autoRemediatedWorkflows.length / workflows.length
      : 0;

    return {
      total: workflows.length,
      byStatus,
      averageResolutionTime,
      autoRemediationRate,
    };
  }

  /**
   * Generate remediation actions for a violation
   */
  private async generateRemediationActions(
    violation: ComplianceViolation,
    _detectionRule?: ViolationDetectionRule,
  ): Promise<RemediationAction[]> {
    // Get framework-specific actions
    const frameworkActions = Array.from(this.actions.values()).filter(action =>
      action.framework === violation.framework
    );

    // Filter actions based on violation characteristics
    const relevantActions = frameworkActions.filter(action => {
      // Would implement sophisticated matching logic here
      return action.category === this.categorizeViolation(violation);
    });

    // Add generic actions if no specific ones found
    if (relevantActions.length === 0) {
      relevantActions.push(...this.getGenericRemediationActions(violation));
    }

    return relevantActions.slice(0, 3); // Return top 3 most relevant actions
  }

  /**
   * Select best remediation action based on criteria
   */
  private selectBestAction(actions: RemediationAction[]): RemediationAction | undefined {
    if (actions.length === 0) return undefined;

    // Priority: automated > low effort > high impact
    return actions.sort((a, b) => {
      if (a.type === "automated" && b.type !== "automated") return -1;
      if (b.type === "automated" && a.type !== "automated") return 1;

      const effortWeight = { low: 3, medium: 2, high: 1 };
      return effortWeight[a.estimatedEffort] - effortWeight[b.estimatedEffort];
    })[0];
  }

  /**
   * Calculate workflow progress
   */
  private calculateProgress(action: RemediationAction): RemediationWorkflow["progress"] {
    const totalSteps = action.steps.length;
    const completedSteps = action.steps.filter(s => s.status === "completed").length;
    const percentage = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

    return { totalSteps, completedSteps, percentage };
  }

  /**
   * Process auto-remediation queue
   */
  private async startQueueProcessor(): void {
    setInterval(async () => {
      if (this.isProcessingQueue || this.autoRemediationQueue.length === 0) {
        return;
      }

      this.isProcessingQueue = true;

      try {
        while (this.autoRemediationQueue.length > 0) {
          const workflowId = this.autoRemediationQueue.shift();
          if (workflowId) {
            await this.executeAutoRemediation(workflowId);
          }
        }
      } catch (error) {
        console.error("Error processing auto-remediation queue:", error);
      } finally {
        this.isProcessingQueue = false;
      }
    }, 30_000); // Process every 30 seconds
  }

  /**
   * Initialize built-in remediation actions
   */
  private initializeRemediationActions(): void {
    // WCAG remediation actions
    this.actions.set("wcag_fix_color_contrast", {
      id: "wcag_fix_color_contrast",
      type: "manual",
      title: "Fix Color Contrast Issues",
      description: "Adjust colors to meet WCAG AA contrast requirements",
      framework: "WCAG",
      category: "accessibility",
      estimatedEffort: "low",
      estimatedDuration: 1,
      prerequisites: ["Design system access", "CSS modification permissions"],
      steps: [
        {
          id: "step1",
          order: 1,
          title: "Identify problematic color combinations",
          description: "Use contrast checking tools to identify failing combinations",
          type: "testing",
          status: "pending",
          estimatedDuration: 15,
          automationPossible: true,
        },
        {
          id: "step2",
          order: 2,
          title: "Adjust colors in design system",
          description: "Modify colors to achieve 4.5:1 contrast ratio",
          type: "code_change",
          status: "pending",
          estimatedDuration: 30,
          automationPossible: false,
        },
        {
          id: "step3",
          order: 3,
          title: "Verify contrast ratios",
          description: "Re-test all color combinations",
          type: "testing",
          status: "pending",
          estimatedDuration: 15,
          automationPossible: true,
        },
      ],
      validation: {
        type: "automatic",
        criteria: ["All text has 4.5:1 contrast ratio", "No WCAG contrast violations"],
      },
      resources: [
        {
          type: "tool",
          title: "WebAIM Contrast Checker",
          url: "https://webaim.org/resources/contrastchecker/",
          description: "Online tool for checking color contrast ratios",
        },
      ],
    });

    // LGPD remediation actions
    this.actions.set("lgpd_implement_consent", {
      id: "lgpd_implement_consent",
      type: "automated",
      title: "Implement Consent Collection",
      description: "Add consent collection mechanism for data processing",
      framework: "LGPD",
      category: "privacy",
      estimatedEffort: "medium",
      estimatedDuration: 2,
      prerequisites: ["Consent management system", "Legal approval"],
      steps: [
        {
          id: "step1",
          order: 1,
          title: "Deploy consent modal",
          description: "Add consent collection modal to affected pages",
          type: "code_change",
          status: "pending",
          estimatedDuration: 60,
          automationPossible: true,
          automationScript: "deploy_consent_modal.js",
        },
        {
          id: "step2",
          order: 2,
          title: "Configure consent options",
          description: "Set up granular consent options for different data uses",
          type: "configuration",
          status: "pending",
          estimatedDuration: 30,
          automationPossible: true,
          automationScript: "configure_consent_options.js",
        },
      ],
      validation: {
        type: "automatic",
        criteria: ["Consent modal appears before data collection", "User choices are recorded"],
      },
      resources: [],
    });

    console.log(`📚 Initialized ${this.actions.size} remediation actions`);
  }

  // Helper methods
  private mapSeverityToPriority(severity: ViolationSeverity): RemediationWorkflow["priority"] {
    const mapping: Record<ViolationSeverity, RemediationWorkflow["priority"]> = {
      low: "low",
      medium: "medium",
      high: "high",
      critical: "critical",
    };
    return mapping[severity];
  }

  private calculateDueDate(severity: ViolationSeverity): Date {
    const now = new Date();
    const daysMap = { critical: 1, high: 3, medium: 7, low: 14 };
    const days = daysMap[severity];

    return new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  }

  private categorizeViolation(violation: ComplianceViolation): string {
    // Mock categorization - would use more sophisticated logic
    if (violation.rule.toLowerCase().includes("contrast")) return "accessibility";
    if (violation.rule.toLowerCase().includes("consent")) return "privacy";
    if (violation.rule.toLowerCase().includes("signature")) return "medical_records";
    return "general";
  }

  private getGenericRemediationActions(violation: ComplianceViolation): RemediationAction[] {
    return [{
      id: "generic_manual_fix",
      type: "manual",
      title: "Manual Investigation and Fix",
      description: "Manually investigate and remediate the compliance violation",
      framework: violation.framework,
      category: "general",
      estimatedEffort: "medium",
      estimatedDuration: 2,
      prerequisites: ["Domain expertise", "System access"],
      steps: [
        {
          id: "investigate",
          order: 1,
          title: "Investigate violation",
          description: "Analyze the violation details and determine root cause",
          type: "review",
          status: "pending",
          estimatedDuration: 60,
          automationPossible: false,
        },
        {
          id: "implement_fix",
          order: 2,
          title: "Implement fix",
          description: "Apply appropriate remediation based on investigation",
          type: "code_change",
          status: "pending",
          estimatedDuration: 60,
          automationPossible: false,
        },
      ],
      validation: {
        type: "manual",
        criteria: ["Violation no longer detected", "Solution documented"],
      },
      resources: [],
    }];
  }

  private async verifyAutoRemediation(
    _violationId: string,
    _appliedFixes: string[],
  ): Promise<{ passed: boolean; details: string; }> {
    // Mock verification - would implement actual verification logic
    const passed = Math.random() > 0.1; // 90% success rate
    return {
      passed,
      details: passed ? "All fixes verified successfully" : "Some fixes failed verification",
    };
  }
}

// Export singleton instance
export const remediationEngine = new RemediationEngine();
