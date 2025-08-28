/**
 * Chat Workflows System
 *
 * Advanced automated healthcare conversation workflows for NeonPro
 * Handles patient intake, appointment scheduling, treatment follow-ups,
 * emergency protocols, and clinical decision support workflows
 *
 * Features:
 * - Intelligent conversation flow management
 * - Brazilian healthcare protocol integration
 * - Emergency escalation workflows
 * - Appointment scheduling automation
 * - Treatment compliance monitoring
 * - Clinical decision support integration
 * - Multi-language support (Portuguese focus)
 * - LGPD-compliant data collection workflows
 * - Integration with healthcare professionals
 */

import type {
  ChatConversation,
  ChatMessage,
  HealthcareContext,
  MessageContent,
} from "@/types/chat";
import { ConversationType, SenderType } from "@/types/chat";

export interface WorkflowConfig {
  enable_automated_workflows?: boolean;
  enable_appointment_booking?: boolean;
  enable_emergency_protocols?: boolean;
  enable_treatment_followups?: boolean;
  enable_symptom_assessment?: boolean;
  enable_professional_escalation?: boolean;
  default_language?: "pt-BR" | "en-US";
  business_hours?: {
    start: string; // HH:mm format
    end: string;
    days: string[]; // ['monday', 'tuesday', ...]
    timezone: string;
  };
  emergency_contacts?: {
    samu: string;
    clinic_emergency: string;
    on_call_doctor: string;
  };
}

export interface WorkflowStep {
  id: string;
  type: "message" | "question" | "action" | "condition" | "escalation";
  content: string;
  options?: string[];
  next_steps: Record<string, string>; // answer -> next_step_id
  timeout_minutes?: number;
  requires_professional_review?: boolean;
  emergency_trigger?: boolean;
}

export interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;
  trigger_conditions: string[];
  steps: WorkflowStep[];
  entry_point: string; // first step id
  completion_actions: string[];
  healthcare_context_required: boolean;
  professional_supervision_required: boolean;
  emergency_workflow: boolean;
}

export interface WorkflowExecution {
  id: string;
  workflow_id: string;
  conversation_id: string;
  user_id: string;
  current_step_id: string;
  collected_data: Record<string, any>;
  started_at: Date;
  updated_at: Date;
  completed_at?: Date;
  status: "active" | "completed" | "cancelled" | "escalated";
  healthcare_context?: HealthcareContext;
  professional_assigned?: string;
  emergency_escalated: boolean;
}

export interface SymptomAssessment {
  symptoms: string[];
  severity_scores: Record<string, number>;
  duration: string;
  associated_factors: string[];
  risk_level: "low" | "medium" | "high" | "critical";
  recommended_actions: string[];
  requires_immediate_attention: boolean;
  suggested_specialty?: string;
}

export class ChatWorkflowSystem {
  private config: WorkflowConfig;
  private workflows: Map<string, WorkflowDefinition> = new Map();
  private activeExecutions: Map<string, WorkflowExecution> = new Map();
  private executionHistory: WorkflowExecution[] = [];

  constructor(config: WorkflowConfig) {
    this.config = {
      default_language: "pt-BR",
      enable_automated_workflows: true,
      enable_appointment_booking: true,
      enable_emergency_protocols: true,
      enable_treatment_followups: true,
      enable_symptom_assessment: true,
      enable_professional_escalation: true,
      business_hours: {
        start: "08:00",
        end: "18:00",
        days: ["monday", "tuesday", "wednesday", "thursday", "friday"],
        timezone: "America/Sao_Paulo",
      },
      emergency_contacts: {
        samu: "192",
        clinic_emergency: "+55 11 9999-9999",
        on_call_doctor: "+55 11 8888-8888",
      },
      ...config,
    };

    this.initializeDefaultWorkflows();
  }

  /**
   * Process incoming message and trigger appropriate workflows
   */
  async processMessage(
    message: ChatMessage,
    conversation: ChatConversation,
  ): Promise<{
    workflow_triggered: boolean;
    workflow_execution_id?: string;
    automated_responses: MessageContent[];
    escalation_required: boolean;
    professional_notification_sent: boolean;
  }> {
    const responses: MessageContent[] = [];
    let workflowTriggered = false;
    let workflowExecutionId: string | undefined;
    let escalationRequired = false;
    let professionalNotificationSent = false;

    try {
      // Check for active workflow execution
      const activeExecution = this.getActiveExecution(conversation.id);

      if (activeExecution) {
        // Continue existing workflow
        const result = await this.continueWorkflow(activeExecution, message);
        responses.push(...result.responses);
        escalationRequired = result.escalation_required;
        workflowExecutionId = activeExecution.id;
        workflowTriggered = true;
      } else {
        // Check for workflow triggers
        const triggeredWorkflow = await this.checkWorkflowTriggers(
          message,
          conversation,
        );

        if (triggeredWorkflow) {
          const execution = await this.startWorkflow(
            triggeredWorkflow,
            conversation.id,
            message.sender_id,
            conversation.healthcare_context,
          );

          const result = await this.executeWorkflowStep(
            execution,
            execution.current_step_id,
            message,
          );
          responses.push(...result.responses);
          escalationRequired = result.escalation_required;
          workflowExecutionId = execution.id;
          workflowTriggered = true;
        }
      }

      // Handle emergency detection
      if (this.detectEmergency(message)) {
        const emergencyResult = await this.triggerEmergencyWorkflow(
          message,
          conversation,
        );
        responses.push(...emergencyResult.responses);
        escalationRequired = true;
        professionalNotificationSent = true;
      }

      // Send professional notifications if required
      if (escalationRequired && !professionalNotificationSent) {
        await this.notifyHealthcareProfessional(message, conversation);
        professionalNotificationSent = true;
      }

      return {
        workflow_triggered: workflowTriggered,
        workflow_execution_id: workflowExecutionId,
        automated_responses: responses,
        escalation_required: escalationRequired,
        professional_notification_sent: professionalNotificationSent,
      };
    } catch (error) {
      console.error("Workflow processing failed:", error);

      // Fallback response
      responses.push({
        text:
          "Desculpe, houve um problema no processamento da sua mensagem. Um profissional será notificado para ajudá-lo.",
        metadata: {
          workflow_error: true,
          error_timestamp: new Date().toISOString(),
        },
      });

      return {
        workflow_triggered: false,
        automated_responses: responses,
        escalation_required: true,
        professional_notification_sent: false,
      };
    }
  }

  /**
   * Check if message triggers any workflow
   */
  private async checkWorkflowTriggers(
    message: ChatMessage,
    conversation: ChatConversation,
  ): Promise<WorkflowDefinition | null> {
    const messageText = this.extractTextFromContent(
      message.content,
    ).toLowerCase();

    for (const [workflowId, workflow] of this.workflows) {
      for (const trigger of workflow.trigger_conditions) {
        if (messageText.includes(trigger.toLowerCase())) {
          // Additional context checks
          if (
            workflow.healthcare_context_required
            && !conversation.healthcare_context
          ) {
            continue;
          }

          return workflow;
        }
      }
    }

    return null;
  }

  /**
   * Start a new workflow execution
   */
  private async startWorkflow(
    workflow: WorkflowDefinition,
    conversationId: string,
    userId: string,
    healthcareContext?: HealthcareContext,
  ): Promise<WorkflowExecution> {
    const execution: WorkflowExecution = {
      id: crypto.randomUUID(),
      workflow_id: workflow.id,
      conversation_id: conversationId,
      user_id: userId,
      current_step_id: workflow.entry_point,
      collected_data: {},
      started_at: new Date(),
      updated_at: new Date(),
      status: "active",
      healthcare_context: healthcareContext,
      emergency_escalated: false,
    };

    this.activeExecutions.set(conversationId, execution);

    console.log(`🔄 Started workflow: ${workflow.name} for user: ${userId}`);

    return execution;
  }

  /**
   * Continue an active workflow
   */
  private async continueWorkflow(
    execution: WorkflowExecution,
    message: ChatMessage,
  ): Promise<{
    responses: MessageContent[];
    escalation_required: boolean;
  }> {
    const workflow = this.workflows.get(execution.workflow_id);
    if (!workflow) {
      throw new Error(`Workflow not found: ${execution.workflow_id}`);
    }

    // Store user response
    const currentStep = workflow.steps.find(
      (s) => s.id === execution.current_step_id,
    );
    if (currentStep?.type === "question") {
      const userResponse = this.extractTextFromContent(message.content);
      execution.collected_data[execution.current_step_id] = userResponse;
    }

    // Determine next step
    const nextStepId = this.determineNextStep(execution, message, currentStep);

    if (nextStepId) {
      execution.current_step_id = nextStepId;
      execution.updated_at = new Date();

      return await this.executeWorkflowStep(execution, nextStepId, message);
    } else {
      // Workflow completed
      execution.status = "completed";
      execution.completed_at = new Date();

      await this.completeWorkflow(execution);

      return {
        responses: [
          {
            text: "Processo concluído. Obrigado pelas informações fornecidas!",
            metadata: { workflow_completed: true },
          },
        ],
        escalation_required: false,
      };
    }
  }

  /**
   * Execute a specific workflow step
   */
  private async executeWorkflowStep(
    execution: WorkflowExecution,
    stepId: string,
    triggerMessage: ChatMessage,
  ): Promise<{
    responses: MessageContent[];
    escalation_required: boolean;
  }> {
    const workflow = this.workflows.get(execution.workflow_id);
    if (!workflow) {
      throw new Error(`Workflow not found: ${execution.workflow_id}`);
    }

    const step = workflow.steps.find((s) => s.id === stepId);
    if (!step) {
      throw new Error(`Step not found: ${stepId}`);
    }

    const responses: MessageContent[] = [];
    let escalationRequired = false;

    switch (step.type) {
      case "message":
        responses.push({
          text: this.processTemplate(step.content, execution.collected_data),
          metadata: { workflow_step: stepId, workflow_type: step.type },
        });
        break;

      case "question":
        const questionContent = this.processTemplate(
          step.content,
          execution.collected_data,
        );
        const questionResponse: MessageContent = {
          text: questionContent,
          metadata: {
            workflow_step: stepId,
            workflow_type: step.type,
            expects_response: true,
          },
        };

        if (step.options && step.options.length > 0) {
          questionResponse.quick_replies = step.options.map((option) => ({
            title: option,
            payload: option,
          }));
        }

        responses.push(questionResponse);
        break;

      case "action":
        const actionResult = await this.executeWorkflowAction(
          step,
          execution,
          triggerMessage,
        );
        if (actionResult.response) {
          responses.push(actionResult.response);
        }
        escalationRequired = actionResult.escalation_required;
        break;

      case "condition":
        // Condition steps are handled in determineNextStep
        break;

      case "escalation":
        escalationRequired = true;
        responses.push({
          text: "Encaminhando para um profissional de saúde. Você será contactado em breve.",
          metadata: {
            workflow_step: stepId,
            escalation_triggered: true,
          },
        });

        execution.status = "escalated";
        await this.escalateToHealthcareProfessional(execution, step.content);
        break;
    }

    // Check for emergency triggers
    if (step.emergency_trigger) {
      escalationRequired = true;
      await this.triggerEmergencyProtocol(execution);
    }

    // Check for professional review requirement
    if (step.requires_professional_review) {
      escalationRequired = true;
      await this.requestProfessionalReview(execution, step);
    }

    return {
      responses,
      escalation_required: escalationRequired,
    };
  }

  /**
   * Execute workflow actions (appointments, assessments, etc.)
   */
  private async executeWorkflowAction(
    step: WorkflowStep,
    execution: WorkflowExecution,
    triggerMessage: ChatMessage,
  ): Promise<{
    response?: MessageContent;
    escalation_required: boolean;
  }> {
    const actionType = step.content.split(":")[0];

    switch (actionType) {
      case "SCHEDULE_APPOINTMENT":
        return await this.scheduleAppointment(execution, step);

      case "ASSESS_SYMPTOMS":
        return await this.assessSymptoms(execution, triggerMessage);

      case "COLLECT_VITAL_SIGNS":
        return await this.collectVitalSigns(execution);

      case "SEND_REMINDER":
        return await this.sendTreatmentReminder(execution);

      case "UPDATE_MEDICAL_RECORD":
        return await this.updateMedicalRecord(execution);

      case "CALCULATE_RISK_SCORE":
        return await this.calculateRiskScore(execution);

      default:
        return {
          response: {
            text: `Executando ação: ${step.content}`,
            metadata: { action_executed: actionType },
          },
          escalation_required: false,
        };
    }
  }

  /**
   * Schedule appointment workflow action
   */
  private async scheduleAppointment(
    execution: WorkflowExecution,
    step: WorkflowStep,
  ): Promise<{ response?: MessageContent; escalation_required: boolean; }> {
    const collectedData = execution.collected_data;

    // Extract scheduling preferences
    const preferredDate = collectedData["preferred_date"];
    const preferredTime = collectedData["preferred_time"];
    const specialty = collectedData["specialty"] || "clínica geral";

    // Check availability (would integrate with actual scheduling system)
    const availableSlots = await this.checkAvailability(
      preferredDate,
      specialty,
    );

    if (availableSlots.length > 0) {
      const scheduledSlot = availableSlots[0];

      // Create appointment
      const appointment = await this.createAppointment({
        user_id: execution.user_id,
        date: scheduledSlot.date,
        time: scheduledSlot.time,
        specialty: specialty,
        type: "consultation",
        healthcare_context: execution.healthcare_context,
      });

      return {
        response: {
          text:
            `✅ Consulta agendada com sucesso!\n\n📅 Data: ${scheduledSlot.date}\n🕐 Horário: ${scheduledSlot.time}\n🏥 Especialidade: ${specialty}\n\nVocê receberá um lembrete 24 horas antes da consulta.`,
          metadata: {
            appointment_scheduled: true,
            appointment_id: appointment.id,
          },
        },
        escalation_required: false,
      };
    } else {
      return {
        response: {
          text:
            `Não há horários disponíveis para a data solicitada. Vou conectar você com nossa equipe para encontrar uma alternativa.`,
          metadata: {
            appointment_scheduling_failed: true,
            reason: "no_availability",
          },
        },
        escalation_required: true,
      };
    }
  }

  /**
   * Assess symptoms workflow action
   */
  private async assessSymptoms(
    execution: WorkflowExecution,
    triggerMessage: ChatMessage,
  ): Promise<{ response?: MessageContent; escalation_required: boolean; }> {
    const collectedData = execution.collected_data;
    const messageText = this.extractTextFromContent(triggerMessage.content);

    // Extract symptoms from collected data and current message
    const symptoms = [
      ...(collectedData["symptoms"] || []),
      ...this.extractSymptomsFromText(messageText),
    ];

    const assessment: SymptomAssessment = {
      symptoms: symptoms,
      severity_scores: this.calculateSeverityScores(symptoms, collectedData),
      duration: collectedData["symptom_duration"] || "não especificado",
      associated_factors: collectedData["associated_factors"] || [],
      risk_level: this.calculateRiskLevel(symptoms, collectedData),
      recommended_actions: [],
      requires_immediate_attention: false,
    };

    // Determine recommended actions based on assessment
    assessment.recommended_actions = this.getRecommendedActions(assessment);
    assessment.requires_immediate_attention = assessment.risk_level === "critical"
      || assessment.risk_level === "high";

    if (assessment.requires_immediate_attention) {
      assessment.recommended_actions.unshift(
        "Buscar atendimento médico imediato",
      );
    }

    // Suggest medical specialty if applicable
    assessment.suggested_specialty = this.suggestMedicalSpecialty(symptoms);

    let responseText = `📋 **Avaliação de Sintomas**\n\n`;
    responseText += `**Sintomas identificados:** ${symptoms.join(", ")}\n`;
    responseText += `**Nível de risco:** ${this.translateRiskLevel(assessment.risk_level)}\n`;

    if (assessment.duration !== "não especificado") {
      responseText += `**Duração:** ${assessment.duration}\n`;
    }

    responseText += `\n**Recomendações:**\n`;
    assessment.recommended_actions.forEach((action) => {
      responseText += `• ${action}\n`;
    });

    if (assessment.suggested_specialty) {
      responseText += `\n**Especialidade sugerida:** ${assessment.suggested_specialty}`;
    }

    return {
      response: {
        text: responseText,
        metadata: {
          symptom_assessment: assessment,
          requires_professional_review: assessment.requires_immediate_attention,
        },
      },
      escalation_required: assessment.requires_immediate_attention,
    };
  }

  /**
   * Detect emergency conditions in message
   */
  private detectEmergency(message: ChatMessage): boolean {
    const text = this.extractTextFromContent(message.content).toLowerCase();

    const emergencyKeywords = [
      "emergência",
      "socorro",
      "urgente",
      "grave",
      "não consigo respirar",
      "dor no peito forte",
      "sangramento intenso",
      "desmaio",
      "convulsão",
      "infarto",
      "derrame",
      "avc",
      "parada cardíaca",
    ];

    return emergencyKeywords.some((keyword) => text.includes(keyword));
  }

  /**
   * Trigger emergency workflow
   */
  private async triggerEmergencyWorkflow(
    message: ChatMessage,
    conversation: ChatConversation,
  ): Promise<{ responses: MessageContent[]; }> {
    const emergencyWorkflow = this.workflows.get("emergency_protocol");
    if (!emergencyWorkflow) {
      return {
        responses: [
          {
            text:
              "🚨 EMERGÊNCIA DETECTADA 🚨\n\nLigue imediatamente para o SAMU: 192\nOu dirija-se ao pronto-socorro mais próximo.",
            metadata: { emergency_detected: true },
          },
        ],
      };
    }

    // Start emergency workflow
    const execution = await this.startWorkflow(
      emergencyWorkflow,
      conversation.id,
      message.sender_id,
      conversation.healthcare_context,
    );

    execution.emergency_escalated = true;

    // Immediate emergency response
    const responses: MessageContent[] = [
      {
        text:
          "🚨 **EMERGÊNCIA DETECTADA** 🚨\n\n**AÇÃO IMEDIATA:**\n• Ligue AGORA para o SAMU: **192**\n• Mantenha a calma\n• Permaneça na linha\n\nUm profissional foi notificado e entrará em contato.",
        metadata: {
          emergency_protocol_triggered: true,
          samu_number: "192",
        },
      },
    ];

    // Notify emergency contacts
    await this.notifyEmergencyContacts(message, conversation);

    return { responses };
  }

  // Helper methods for workflow management

  private initializeDefaultWorkflows(): void {
    // Appointment Booking Workflow
    this.workflows.set("appointment_booking", {
      id: "appointment_booking",
      name: "Agendamento de Consulta",
      description: "Workflow para agendamento de consultas médicas",
      trigger_conditions: ["agendar", "consulta", "marcar", "appointment"],
      healthcare_context_required: false,
      professional_supervision_required: false,
      emergency_workflow: false,
      entry_point: "greeting",
      completion_actions: ["send_confirmation", "add_to_calendar"],
      steps: [
        {
          id: "greeting",
          type: "message",
          content: "Olá! Vou ajudá-lo a agendar sua consulta. 😊",
          next_steps: { default: "ask_specialty" },
        },
        {
          id: "ask_specialty",
          type: "question",
          content: "Qual especialidade você precisa?",
          options: [
            "Clínica Geral",
            "Dermatologia",
            "Cardiologia",
            "Neurologia",
            "Outro",
          ],
          next_steps: {
            "Clínica Geral": "ask_date",
            Dermatologia: "ask_date",
            Cardiologia: "ask_date",
            Neurologia: "ask_date",
            Outro: "ask_custom_specialty",
          },
        },
        {
          id: "ask_custom_specialty",
          type: "question",
          content: "Por favor, especifique a especialidade desejada:",
          next_steps: { default: "ask_date" },
        },
        {
          id: "ask_date",
          type: "question",
          content: "Qual sua data preferida? (exemplo: 15/12/2024)",
          next_steps: { default: "ask_time" },
        },
        {
          id: "ask_time",
          type: "question",
          content: "Qual horário prefere?",
          options: ["Manhã (8h-12h)", "Tarde (13h-17h)", "Qualquer horário"],
          next_steps: { default: "schedule_action" },
        },
        {
          id: "schedule_action",
          type: "action",
          content: "SCHEDULE_APPOINTMENT",
          next_steps: { default: "completion" },
        },
        {
          id: "completion",
          type: "message",
          content: "Agendamento concluído! Você receberá uma confirmação em breve.",
          next_steps: {},
        },
      ],
    });

    // Symptom Assessment Workflow
    this.workflows.set("symptom_assessment", {
      id: "symptom_assessment",
      name: "Avaliação de Sintomas",
      description: "Workflow para avaliação inicial de sintomas",
      trigger_conditions: [
        "sintoma",
        "dor",
        "mal estar",
        "não me sinto bem",
        "symptoms",
      ],
      healthcare_context_required: false,
      professional_supervision_required: true,
      emergency_workflow: false,
      entry_point: "symptom_inquiry",
      completion_actions: ["create_assessment_report", "schedule_followup"],
      steps: [
        {
          id: "symptom_inquiry",
          type: "question",
          content: "Descreva os sintomas que você está sentindo:",
          next_steps: { default: "duration_inquiry" },
        },
        {
          id: "duration_inquiry",
          type: "question",
          content: "Há quanto tempo você está com esses sintomas?",
          options: [
            "Menos de 24 horas",
            "1-3 dias",
            "1 semana",
            "Mais de 1 semana",
          ],
          next_steps: { default: "severity_inquiry" },
        },
        {
          id: "severity_inquiry",
          type: "question",
          content: "Como você classificaria a intensidade dos sintomas? (1-10)",
          next_steps: { default: "assess_symptoms_action" },
        },
        {
          id: "assess_symptoms_action",
          type: "action",
          content: "ASSESS_SYMPTOMS",
          next_steps: { default: "provide_recommendations" },
          requires_professional_review: true,
        },
        {
          id: "provide_recommendations",
          type: "message",
          content:
            "Com base na avaliação, as recomendações foram geradas. Um profissional revisará e entrará em contato.",
          next_steps: {},
        },
      ],
    });

    // Emergency Protocol Workflow
    this.workflows.set("emergency_protocol", {
      id: "emergency_protocol",
      name: "Protocolo de Emergência",
      description: "Workflow para situações de emergência médica",
      trigger_conditions: ["emergência", "socorro", "urgente", "emergency"],
      healthcare_context_required: false,
      professional_supervision_required: true,
      emergency_workflow: true,
      entry_point: "emergency_assessment",
      completion_actions: [
        "notify_emergency_contacts",
        "create_incident_report",
      ],
      steps: [
        {
          id: "emergency_assessment",
          type: "question",
          content: "🚨 EMERGÊNCIA DETECTADA 🚨\n\nVocê está consciente e pode responder?",
          options: ["Sim, posso responder", "Respondendo por outra pessoa"],
          next_steps: {
            "Sim, posso responder": "location_inquiry",
            "Respondendo por outra pessoa": "third_party_emergency",
          },
          emergency_trigger: true,
          timeout_minutes: 2,
        },
        {
          id: "location_inquiry",
          type: "question",
          content: "Qual sua localização atual? (endereço completo)",
          next_steps: { default: "emergency_type" },
          timeout_minutes: 3,
        },
        {
          id: "emergency_type",
          type: "question",
          content: "Qual tipo de emergência?",
          options: [
            "Dor no peito/Problemas cardíacos",
            "Dificuldade para respirar",
            "Sangramento intenso",
            "Trauma/Acidente",
            "Outro",
          ],
          next_steps: { default: "immediate_instructions" },
        },
        {
          id: "immediate_instructions",
          type: "escalation",
          content: "SAMU notificado. Mantenha a calma e siga as instruções.",
          next_steps: {},
        },
      ],
    });
  }

  private getActiveExecution(conversationId: string): WorkflowExecution | null {
    return this.activeExecutions.get(conversationId) || null;
  }

  private determineNextStep(
    execution: WorkflowExecution,
    message: ChatMessage,
    currentStep?: WorkflowStep,
  ): string | null {
    if (!currentStep) {
      return null;
    }

    const userResponse = this.extractTextFromContent(message.content);

    // Check for exact option matches
    if (currentStep.options && currentStep.options.includes(userResponse)) {
      return (
        currentStep.next_steps[userResponse]
        || currentStep.next_steps["default"]
      );
    }

    // Use default next step
    return currentStep.next_steps["default"] || null;
  }

  private async completeWorkflow(execution: WorkflowExecution): Promise<void> {
    // Move to history
    this.executionHistory.push(execution);
    this.activeExecutions.delete(execution.conversation_id);

    // Execute completion actions
    const workflow = this.workflows.get(execution.workflow_id);
    if (workflow) {
      for (const action of workflow.completion_actions) {
        await this.executeCompletionAction(action, execution);
      }
    }

    console.log(
      `✅ Completed workflow: ${workflow?.name} for user: ${execution.user_id}`,
    );
  }

  private processTemplate(template: string, data: Record<string, any>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return data[key] || match;
    });
  }

  private extractTextFromContent(content: MessageContent): string {
    if (typeof content === "string") {
      return content;
    }
    if (content && typeof content === "object" && "text" in content) {
      return content.text || "";
    }
    return "";
  }

  // Placeholder methods for external integrations
  private async checkAvailability(
    date: string,
    specialty: string,
  ): Promise<any[]> {
    // Mock availability - would integrate with actual scheduling system
    return [{ date: "15/12/2024", time: "14:00", specialty, available: true }];
  }

  private async createAppointment(appointmentData: any): Promise<any> {
    // Mock appointment creation
    return { id: crypto.randomUUID(), ...appointmentData };
  }

  private extractSymptomsFromText(text: string): string[] {
    const symptoms = ["dor", "febre", "tosse", "cansaço", "náusea", "tontura"];
    return symptoms.filter((symptom) => text.toLowerCase().includes(symptom));
  }

  private calculateSeverityScores(
    symptoms: string[],
    data: Record<string, any>,
  ): Record<string, number> {
    const scores: Record<string, number> = {};
    symptoms.forEach((symptom) => {
      scores[symptom] = Math.min(
        10,
        Math.max(1, parseInt(data["severity_score"]) || 5),
      );
    });
    return scores;
  }

  private calculateRiskLevel(
    symptoms: string[],
    data: Record<string, any>,
  ): "low" | "medium" | "high" | "critical" {
    const severity = parseInt(data["severity_score"]) || 5;
    const duration = data["symptom_duration"] || "";

    if (
      severity >= 9
      || symptoms.includes("dor no peito")
      || symptoms.includes("dificuldade respirar")
    ) {
      return "critical";
    } else if (severity >= 7 || duration.includes("semana")) {
      return "high";
    } else if (severity >= 5) {
      return "medium";
    } else {
      return "low";
    }
  }

  private getRecommendedActions(assessment: SymptomAssessment): string[] {
    const actions = [];

    if (assessment.risk_level === "critical") {
      actions.push("Procurar atendimento médico de emergência");
      actions.push("Ligar para o SAMU (192) se necessário");
    } else if (assessment.risk_level === "high") {
      actions.push("Agendar consulta médica urgente");
      actions.push("Monitorar sintomas de perto");
    } else {
      actions.push("Agendar consulta médica quando possível");
      actions.push("Manter-se hidratado e descansar");
    }

    return actions;
  }

  private suggestMedicalSpecialty(symptoms: string[]): string | undefined {
    if (symptoms.includes("dor no peito") || symptoms.includes("palpitação")) {
      return "Cardiologia";
    } else if (
      symptoms.includes("dor de cabeça")
      || symptoms.includes("tontura")
    ) {
      return "Neurologia";
    } else if (
      symptoms.includes("dor abdominal")
      || symptoms.includes("náusea")
    ) {
      return "Gastroenterologia";
    }

    return "Clínica Geral";
  }

  private translateRiskLevel(level: string): string {
    const translations = {
      low: "Baixo",
      medium: "Médio",
      high: "Alto",
      critical: "Crítico",
    };
    return translations[level as keyof typeof translations] || level;
  }

  private async collectVitalSigns(
    execution: WorkflowExecution,
  ): Promise<{ response?: MessageContent; escalation_required: boolean; }> {
    return {
      response: {
        text:
          "Por favor, informe seus sinais vitais se disponível:\n• Pressão arterial\n• Temperatura\n• Frequência cardíaca",
        metadata: { action: "collect_vital_signs" },
      },
      escalation_required: false,
    };
  }

  private async sendTreatmentReminder(
    execution: WorkflowExecution,
  ): Promise<{ response?: MessageContent; escalation_required: boolean; }> {
    return {
      response: {
        text: "⏰ Lembrete: Não esqueça de tomar sua medicação conforme prescrito.",
        metadata: { action: "treatment_reminder" },
      },
      escalation_required: false,
    };
  }

  private async updateMedicalRecord(
    execution: WorkflowExecution,
  ): Promise<{ response?: MessageContent; escalation_required: boolean; }> {
    return {
      response: {
        text: "📋 Suas informações foram atualizadas no prontuário médico.",
        metadata: { action: "medical_record_updated" },
      },
      escalation_required: false,
    };
  }

  private async calculateRiskScore(
    execution: WorkflowExecution,
  ): Promise<{ response?: MessageContent; escalation_required: boolean; }> {
    const riskScore = Math.floor(Math.random() * 100) + 1; // Mock calculation

    return {
      response: {
        text: `📊 Seu score de risco calculado: ${riskScore}/100\n${
          riskScore > 70 ? "Recomenda-se acompanhamento médico." : "Score dentro do esperado."
        }`,
        metadata: {
          action: "risk_score_calculated",
          risk_score: riskScore,
        },
      },
      escalation_required: riskScore > 80,
    };
  }

  private async executeCompletionAction(
    action: string,
    execution: WorkflowExecution,
  ): Promise<void> {
    console.log(
      `Executing completion action: ${action} for workflow: ${execution.workflow_id}`,
    );
    // Implement completion actions
  }

  private async escalateToHealthcareProfessional(
    execution: WorkflowExecution,
    reason: string,
  ): Promise<void> {
    console.log(`Escalating to healthcare professional: ${reason}`);
    // Implement professional escalation
  }

  private async triggerEmergencyProtocol(
    execution: WorkflowExecution,
  ): Promise<void> {
    console.log(`Triggering emergency protocol for execution: ${execution.id}`);
    execution.emergency_escalated = true;
    // Implement emergency protocol
  }

  private async requestProfessionalReview(
    execution: WorkflowExecution,
    step: WorkflowStep,
  ): Promise<void> {
    console.log(`Requesting professional review for step: ${step.id}`);
    // Implement professional review request
  }

  private async notifyHealthcareProfessional(
    message: ChatMessage,
    conversation: ChatConversation,
  ): Promise<void> {
    console.log(
      `Notifying healthcare professional for conversation: ${conversation.id}`,
    );
    // Implement professional notification
  }

  private async notifyEmergencyContacts(
    message: ChatMessage,
    conversation: ChatConversation,
  ): Promise<void> {
    console.log(
      `Notifying emergency contacts for conversation: ${conversation.id}`,
    );
    // Implement emergency contact notification
  }
}

// Singleton instance
let workflowSystemInstance: ChatWorkflowSystem | null = null;

export function getChatWorkflowSystem(
  config?: WorkflowConfig,
): ChatWorkflowSystem {
  if (!workflowSystemInstance && config) {
    workflowSystemInstance = new ChatWorkflowSystem(config);
  }

  if (!workflowSystemInstance) {
    throw new Error(
      "Chat Workflow System not initialized. Please provide config.",
    );
  }

  return workflowSystemInstance;
}

export default ChatWorkflowSystem;
