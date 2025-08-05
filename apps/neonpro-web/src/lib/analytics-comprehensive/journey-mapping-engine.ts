/**
 * 🗺️ NeonPro Patient Journey Mapping Engine
 *
 * HEALTHCARE ANALYTICS SYSTEM - Journey Mapping Core Engine
 * Mapeia e analisa a jornada completa do paciente desde o primeiro contato
 * até a conclusão do tratamento, identificando padrões, gargalos e oportunidades.
 *
 * @fileoverview Core engine para mapeamento de jornada de pacientes com state machine,
 * tracking de eventos, análise de touchpoints e métricas de conversão
 *
 * @version 1.0.0
 * @author NeonPro Development Team
 * @since 2025-01-30
 *
 * COMPLIANCE: LGPD, ANVISA, CFM
 * ARCHITECTURE: Modular, Type-safe, Performance-optimized
 * TESTING: Jest unit tests, Integration tests
 *
 * FEATURES:
 * - Patient journey state machine with comprehensive states
 * - Real-time journey event tracking and processing
 * - Touchpoint identification and categorization
 * - Journey stage analysis with metrics and KPIs
 * - Journey completion scoring and success indicators
 * - Advanced analytics and pattern recognition
 */

import type { Database } from "@/lib/database.types";
import type { createClient } from "@/lib/supabase/client";
import type { logger } from "@/lib/utils/logger";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

/**
 * Patient Journey States - Comprehensive state machine
 */
export type JourneyState =
  | "lead_generated" // Lead criado (primeira interação)
  | "initial_contact" // Primeiro contato estabelecido
  | "consultation_scheduled" // Consulta agendada
  | "consultation_completed" // Consulta realizada
  | "treatment_proposed" // Tratamento proposto
  | "treatment_accepted" // Tratamento aceito
  | "treatment_scheduled" // Tratamento agendado
  | "treatment_started" // Tratamento iniciado
  | "treatment_ongoing" // Tratamento em andamento
  | "treatment_paused" // Tratamento pausado
  | "treatment_completed" // Tratamento concluído
  | "follow_up_scheduled" // Follow-up agendado
  | "follow_up_completed" // Follow-up realizado
  | "journey_completed" // Jornada concluída
  | "abandoned" // Abandonou o processo
  | "dormant" // Inativo/dormant
  | "reactivated"; // Reativado

/**
 * Journey Event Types - Comprehensive event tracking
 */
export type JourneyEventType =
  | "page_view" // Visualização de página
  | "form_submission" // Submissão de formulário
  | "phone_call" // Ligação telefônica
  | "email_sent" // Email enviado
  | "email_opened" // Email aberto
  | "email_clicked" // Link no email clicado
  | "whatsapp_message" // Mensagem WhatsApp
  | "appointment_scheduled" // Agendamento realizado
  | "appointment_confirmed" // Agendamento confirmado
  | "appointment_cancelled" // Agendamento cancelado
  | "appointment_rescheduled" // Agendamento reagendado
  | "consultation_attended" // Consulta compareceu
  | "consultation_no_show" // Consulta não compareceu
  | "treatment_started" // Tratamento iniciado
  | "treatment_session" // Sessão de tratamento
  | "payment_made" // Pagamento realizado
  | "feedback_submitted" // Feedback enviado
  | "follow_up_response" // Resposta a follow-up
  | "referral_made" // Indicação feita
  | "complaint_made" // Reclamação feita
  | "website_interaction"; // Interação no website

/**
 * Journey Event Categories - Event categorization
 */
export type JourneyEventCategory =
  | "acquisition" // Aquisição de leads
  | "engagement" // Engajamento
  | "conversion" // Conversão
  | "retention" // Retenção
  | "advocacy" // Advocacia/indicação
  | "service" // Atendimento/serviço
  | "clinical" // Atividades clínicas
  | "financial" // Atividades financeiras
  | "communication" // Comunicação
  | "feedback"; // Feedback/satisfação

/**
 * Communication Channels
 */
export type CommunicationChannel =
  | "website" // Website/landing page
  | "phone" // Telefone
  | "email" // Email
  | "whatsapp" // WhatsApp
  | "instagram" // Instagram
  | "facebook" // Facebook
  | "google" // Google (ads, search)
  | "in_person" // Presencial
  | "referral" // Indicação
  | "other"; // Outros canais

/**
 * Journey Event Interface
 */
export interface PatientJourneyEvent {
  id: string;
  patient_id: string;
  event_type: JourneyEventType;
  event_category: JourneyEventCategory;
  event_data: Record<string, any>;
  touchpoint_id?: string;
  channel: CommunicationChannel;
  timestamp: Date;
  metadata: {
    user_agent?: string;
    ip_address?: string;
    page_url?: string;
    referrer?: string;
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    staff_id?: string;
    duration_seconds?: number;
    outcome?: "success" | "failure" | "partial";
    sentiment?: "positive" | "neutral" | "negative";
    quality_score?: number;
    [key: string]: any;
  };
  created_at: Date;
}

/**
 * Journey Stage Interface
 */
export interface JourneyStage {
  id: string;
  patient_id: string;
  stage_name: string;
  stage_order: number;
  started_at: Date;
  completed_at?: Date;
  status: "active" | "completed" | "skipped" | "failed";
  duration_minutes?: number;
  satisfaction_score?: number;
  conversion_probability?: number;
  next_expected_action?: string;
  metadata: {
    entry_channel?: CommunicationChannel;
    staff_involved?: string[];
    touchpoints_count?: number;
    events_count?: number;
    revenue_generated?: number;
    costs_incurred?: number;
    [key: string]: any;
  };
  created_at: Date;
}

/**
 * Journey Analysis Result
 */
export interface JourneyAnalysis {
  patient_id: string;
  current_state: JourneyState;
  journey_duration_days: number;
  total_touchpoints: number;
  stage_progression: JourneyStage[];
  completion_score: number;
  satisfaction_trend: number[];
  conversion_probability: number;
  churn_risk_score: number;
  recommended_actions: string[];
  key_insights: string[];
  bottlenecks: Array<{
    stage: string;
    average_duration_days: number;
    conversion_rate: number;
    drop_off_rate: number;
  }>;
  success_factors: string[];
  optimization_opportunities: string[];
}

/**
 * Journey Mapping Configuration
 */
export interface JourneyMappingConfig {
  patient_id: string;
  tracking_enabled: boolean;
  auto_stage_progression: boolean;
  satisfaction_tracking: boolean;
  touchpoint_analysis: boolean;
  real_time_updates: boolean;
  custom_stages?: Array<{
    name: string;
    order: number;
    required: boolean;
    auto_progress: boolean;
  }>;
  event_filters?: {
    included_types?: JourneyEventType[];
    excluded_types?: JourneyEventType[];
    minimum_quality_score?: number;
  };
}

// ============================================================================
// JOURNEY STATE MACHINE
// ============================================================================

/**
 * Journey State Machine - Define valid state transitions
 */
export class JourneyStateMachine {
  private static readonly STATE_TRANSITIONS: Record<JourneyState, JourneyState[]> = {
    lead_generated: ["initial_contact", "abandoned"],
    initial_contact: ["consultation_scheduled", "dormant", "abandoned"],
    consultation_scheduled: ["consultation_completed", "abandoned", "dormant"],
    consultation_completed: [
      "treatment_proposed",
      "follow_up_scheduled",
      "journey_completed",
      "dormant",
    ],
    treatment_proposed: ["treatment_accepted", "abandoned", "dormant"],
    treatment_accepted: ["treatment_scheduled", "abandoned"],
    treatment_scheduled: ["treatment_started", "abandoned", "treatment_paused"],
    treatment_started: [
      "treatment_ongoing",
      "treatment_completed",
      "treatment_paused",
      "abandoned",
    ],
    treatment_ongoing: ["treatment_completed", "treatment_paused", "abandoned"],
    treatment_paused: ["treatment_ongoing", "abandoned", "dormant"],
    treatment_completed: ["follow_up_scheduled", "journey_completed"],
    follow_up_scheduled: ["follow_up_completed", "dormant"],
    follow_up_completed: ["journey_completed", "reactivated"],
    journey_completed: ["reactivated"],
    abandoned: ["reactivated"],
    dormant: ["reactivated", "abandoned"],
    reactivated: ["initial_contact", "consultation_scheduled", "treatment_scheduled"],
  };

  /**
   * Validate if state transition is allowed
   */
  static isValidTransition(currentState: JourneyState, newState: JourneyState): boolean {
    const allowedTransitions = JourneyStateMachine.STATE_TRANSITIONS[currentState] || [];
    return allowedTransitions.includes(newState);
  }

  /**
   * Get possible next states
   */
  static getPossibleNextStates(currentState: JourneyState): JourneyState[] {
    return JourneyStateMachine.STATE_TRANSITIONS[currentState] || [];
  }

  /**
   * Get state order/priority for progression tracking
   */
  static getStateOrder(state: JourneyState): number {
    const stateOrder: Record<JourneyState, number> = {
      lead_generated: 1,
      initial_contact: 2,
      consultation_scheduled: 3,
      consultation_completed: 4,
      treatment_proposed: 5,
      treatment_accepted: 6,
      treatment_scheduled: 7,
      treatment_started: 8,
      treatment_ongoing: 9,
      treatment_completed: 10,
      follow_up_scheduled: 11,
      follow_up_completed: 12,
      journey_completed: 13,
      treatment_paused: 8.5,
      abandoned: -1,
      dormant: -2,
      reactivated: 2.5,
    };
    return stateOrder[state] || 0;
  }
}

// ============================================================================
// JOURNEY MAPPING ENGINE
// ============================================================================

/**
 * Patient Journey Mapping Engine
 * Core engine para análise e mapeamento de jornada de pacientes
 */
export class PatientJourneyMappingEngine {
  private supabase = createClient();
  private config: Map<string, JourneyMappingConfig> = new Map();

  /**
   * Initialize journey tracking for a patient
   */
  async initializePatientJourney(
    patientId: string,
    initialState: JourneyState = "lead_generated",
    config?: Partial<JourneyMappingConfig>,
  ): Promise<{ success: boolean; journey_id?: string; error?: string }> {
    try {
      // Set configuration
      const journeyConfig: JourneyMappingConfig = {
        patient_id: patientId,
        tracking_enabled: true,
        auto_stage_progression: true,
        satisfaction_tracking: true,
        touchpoint_analysis: true,
        real_time_updates: true,
        ...config,
      };
      this.config.set(patientId, journeyConfig);

      // Create initial journey stage
      const { data: stageData, error: stageError } = await this.supabase
        .from("journey_stages")
        .insert({
          patient_id: patientId,
          stage_name: initialState,
          stage_order: JourneyStateMachine.getStateOrder(initialState),
          started_at: new Date().toISOString(),
          status: "active",
          metadata: {
            initialization_timestamp: new Date().toISOString(),
            auto_initialized: true,
          },
        })
        .select()
        .single();

      if (stageError) {
        logger.error("Failed to initialize journey stage:", stageError);
        return { success: false, error: stageError.message };
      }

      // Log initialization event
      await this.trackJourneyEvent(patientId, {
        event_type: "journey_initialized",
        event_category: "acquisition",
        channel: "website",
        event_data: {
          initial_state: initialState,
          configuration: journeyConfig,
        },
        metadata: {
          journey_id: stageData.id,
          auto_generated: true,
        },
      });

      logger.info(`Journey initialized for patient ${patientId}`, {
        initial_state: initialState,
        journey_id: stageData.id,
      });

      return {
        success: true,
        journey_id: stageData.id,
      };
    } catch (error) {
      logger.error("Failed to initialize patient journey:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Track journey event
   */
  async trackJourneyEvent(
    patientId: string,
    eventData: Omit<PatientJourneyEvent, "id" | "patient_id" | "timestamp" | "created_at">,
  ): Promise<{ success: boolean; event_id?: string; error?: string }> {
    try {
      const config = this.config.get(patientId);

      // Check if tracking is enabled
      if (config && !config.tracking_enabled) {
        return { success: true, event_id: "tracking_disabled" };
      }

      // Apply event filters if configured
      if (config?.event_filters) {
        const { included_types, excluded_types, minimum_quality_score } = config.event_filters;

        if (included_types && !included_types.includes(eventData.event_type)) {
          return { success: true, event_id: "filtered_out" };
        }

        if (excluded_types && excluded_types.includes(eventData.event_type)) {
          return { success: true, event_id: "filtered_out" };
        }

        if (
          minimum_quality_score &&
          eventData.metadata.quality_score &&
          eventData.metadata.quality_score < minimum_quality_score
        ) {
          return { success: true, event_id: "quality_filtered" };
        }
      }

      // Insert journey event
      const { data: eventRecord, error } = await this.supabase
        .from("patient_journey_events")
        .insert({
          patient_id: patientId,
          event_type: eventData.event_type,
          event_category: eventData.event_category,
          event_data: eventData.event_data || {},
          touchpoint_id: eventData.touchpoint_id,
          channel: eventData.channel,
          timestamp: new Date().toISOString(),
          metadata: {
            ...eventData.metadata,
            tracking_timestamp: new Date().toISOString(),
          },
        })
        .select()
        .single();

      if (error) {
        logger.error("Failed to track journey event:", error);
        return { success: false, error: error.message };
      }

      // Auto-progress stage if enabled
      if (config?.auto_stage_progression) {
        await this.checkAndProgressStage(patientId, eventData.event_type);
      }

      // Real-time updates if enabled
      if (config?.real_time_updates) {
        await this.triggerRealTimeUpdate(patientId, eventRecord.id);
      }

      logger.debug(`Journey event tracked for patient ${patientId}`, {
        event_type: eventData.event_type,
        event_id: eventRecord.id,
      });

      return {
        success: true,
        event_id: eventRecord.id,
      };
    } catch (error) {
      logger.error("Failed to track journey event:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Progress journey stage
   */
  async progressJourneyStage(
    patientId: string,
    newState: JourneyState,
    metadata?: Record<string, any>,
  ): Promise<{ success: boolean; stage_id?: string; error?: string }> {
    try {
      // Get current active stage
      const { data: currentStage } = await this.supabase
        .from("journey_stages")
        .select("*")
        .eq("patient_id", patientId)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      let currentState: JourneyState = "lead_generated";

      if (currentStage) {
        currentState = currentStage.stage_name as JourneyState;

        // Validate transition
        if (!JourneyStateMachine.isValidTransition(currentState, newState)) {
          return {
            success: false,
            error: `Invalid transition from ${currentState} to ${newState}`,
          };
        }

        // Complete current stage
        await this.supabase
          .from("journey_stages")
          .update({
            completed_at: new Date().toISOString(),
            status: "completed",
            duration_minutes: Math.round(
              (new Date().getTime() - new Date(currentStage.started_at).getTime()) / (1000 * 60),
            ),
          })
          .eq("id", currentStage.id);
      }

      // Create new stage
      const { data: newStage, error } = await this.supabase
        .from("journey_stages")
        .insert({
          patient_id: patientId,
          stage_name: newState,
          stage_order: JourneyStateMachine.getStateOrder(newState),
          started_at: new Date().toISOString(),
          status: "active",
          metadata: {
            previous_stage: currentState,
            transition_timestamp: new Date().toISOString(),
            ...metadata,
          },
        })
        .select()
        .single();

      if (error) {
        logger.error("Failed to progress journey stage:", error);
        return { success: false, error: error.message };
      }

      // Track stage progression event
      await this.trackJourneyEvent(patientId, {
        event_type: "stage_progressed",
        event_category: "conversion",
        channel: "system",
        event_data: {
          previous_stage: currentState,
          new_stage: newState,
          progression_trigger: "manual",
        },
        metadata: {
          stage_id: newStage.id,
          auto_generated: true,
          ...metadata,
        },
      });

      logger.info(`Journey stage progressed for patient ${patientId}`, {
        from: currentState,
        to: newState,
        stage_id: newStage.id,
      });

      return {
        success: true,
        stage_id: newStage.id,
      };
    } catch (error) {
      logger.error("Failed to progress journey stage:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get comprehensive journey analysis for a patient
   */
  async analyzePatientJourney(patientId: string): Promise<JourneyAnalysis | null> {
    try {
      // Get journey stages
      const { data: stages } = await this.supabase
        .from("journey_stages")
        .select("*")
        .eq("patient_id", patientId)
        .order("stage_order", { ascending: true });

      if (!stages || stages.length === 0) {
        return null;
      }

      // Get journey events
      const { data: events } = await this.supabase
        .from("patient_journey_events")
        .select("*")
        .eq("patient_id", patientId)
        .order("timestamp", { ascending: true });

      // Calculate metrics
      const currentStage = stages.find((s) => s.status === "active");
      const currentState = (currentStage?.stage_name as JourneyState) || "abandoned";

      const journeyStart = new Date(stages[0]?.started_at || new Date());
      const journeyDuration = Math.round(
        (new Date().getTime() - journeyStart.getTime()) / (1000 * 60 * 60 * 24),
      );

      const totalTouchpoints = events?.length || 0;

      // Calculate completion score
      const completedStages = stages.filter((s) => s.status === "completed").length;
      const totalPossibleStages = 13; // Total journey states
      const completionScore = (completedStages / totalPossibleStages) * 100;

      // Analyze satisfaction trend
      const satisfactionScores = stages
        .filter((s) => s.satisfaction_score !== null)
        .map((s) => s.satisfaction_score!);

      // Calculate conversion probability based on current stage and historical data
      const conversionProbability = this.calculateConversionProbability(currentState, stages);

      // Calculate churn risk score
      const churnRiskScore = await this.calculateChurnRiskScore(patientId, events || [], stages);

      // Identify bottlenecks
      const bottlenecks = this.identifyJourneyBottlenecks(stages);

      // Generate recommendations
      const recommendations = this.generateRecommendations(currentState, stages, events || []);

      // Generate insights
      const insights = this.generateKeyInsights(stages, events || []);

      const analysis: JourneyAnalysis = {
        patient_id: patientId,
        current_state: currentState,
        journey_duration_days: journeyDuration,
        total_touchpoints: totalTouchpoints,
        stage_progression: stages.map((stage) => ({
          id: stage.id,
          patient_id: stage.patient_id,
          stage_name: stage.stage_name,
          stage_order: stage.stage_order,
          started_at: new Date(stage.started_at),
          completed_at: stage.completed_at ? new Date(stage.completed_at) : undefined,
          status: stage.status as "active" | "completed" | "skipped" | "failed",
          duration_minutes: stage.duration_minutes,
          satisfaction_score: stage.satisfaction_score,
          metadata: stage.metadata || {},
          created_at: new Date(stage.created_at),
        })),
        completion_score: Math.round(completionScore * 100) / 100,
        satisfaction_trend: satisfactionScores,
        conversion_probability: Math.round(conversionProbability * 100) / 100,
        churn_risk_score: Math.round(churnRiskScore * 100) / 100,
        recommended_actions: recommendations,
        key_insights: insights,
        bottlenecks: bottlenecks,
        success_factors: this.identifySuccessFactors(stages, events || []),
        optimization_opportunities: this.identifyOptimizationOpportunities(stages, events || []),
      };

      return analysis;
    } catch (error) {
      logger.error("Failed to analyze patient journey:", error);
      return null;
    }
  }

  /**
   * Auto-check and progress stage based on events
   */
  private async checkAndProgressStage(
    patientId: string,
    eventType: JourneyEventType,
  ): Promise<void> {
    try {
      const progressionRules: Record<JourneyEventType, JourneyState | null> = {
        appointment_scheduled: "consultation_scheduled",
        consultation_attended: "consultation_completed",
        treatment_started: "treatment_started",
        payment_made: "treatment_accepted",
        feedback_submitted: "follow_up_completed",
        // Add more progression rules as needed
        page_view: null,
        form_submission: null,
        phone_call: null,
        email_sent: null,
        email_opened: null,
        email_clicked: null,
        whatsapp_message: null,
        appointment_confirmed: null,
        appointment_cancelled: null,
        appointment_rescheduled: null,
        consultation_no_show: null,
        treatment_session: null,
        follow_up_response: null,
        referral_made: null,
        complaint_made: null,
        website_interaction: null,
      };

      const targetState = progressionRules[eventType];
      if (targetState) {
        await this.progressJourneyStage(patientId, targetState, {
          auto_progressed: true,
          trigger_event: eventType,
        });
      }
    } catch (error) {
      logger.error("Failed to auto-progress stage:", error);
    }
  }

  /**
   * Calculate conversion probability based on current state and journey data
   */
  private calculateConversionProbability(currentState: JourneyState, stages: any[]): number {
    // Base probabilities by stage (these would be updated with real data)
    const baseProbabilities: Record<JourneyState, number> = {
      lead_generated: 0.15,
      initial_contact: 0.25,
      consultation_scheduled: 0.45,
      consultation_completed: 0.65,
      treatment_proposed: 0.75,
      treatment_accepted: 0.85,
      treatment_scheduled: 0.9,
      treatment_started: 0.95,
      treatment_ongoing: 0.95,
      treatment_completed: 0.98,
      follow_up_scheduled: 0.98,
      follow_up_completed: 0.99,
      journey_completed: 1.0,
      treatment_paused: 0.6,
      abandoned: 0.05,
      dormant: 0.1,
      reactivated: 0.3,
    };

    let probability = baseProbabilities[currentState] || 0.15;

    // Adjust based on journey progression speed
    const averageDuration =
      stages.reduce((sum, stage) => {
        return sum + (stage.duration_minutes || 0);
      }, 0) / stages.length;

    if (averageDuration < 1440) {
      // Less than 24 hours average
      probability *= 1.2; // Faster progression increases probability
    } else if (averageDuration > 10080) {
      // More than 7 days average
      probability *= 0.8; // Slower progression decreases probability
    }

    // Adjust based on satisfaction scores
    const avgSatisfaction =
      stages.filter((s) => s.satisfaction_score).reduce((sum, s) => sum + s.satisfaction_score, 0) /
      stages.filter((s) => s.satisfaction_score).length;

    if (avgSatisfaction > 4.0) {
      probability *= 1.1;
    } else if (avgSatisfaction < 3.0) {
      probability *= 0.9;
    }

    return Math.min(1.0, Math.max(0.0, probability));
  }

  /**
   * Calculate churn risk score
   */
  private async calculateChurnRiskScore(
    patientId: string,
    events: any[],
    stages: any[],
  ): Promise<number> {
    let riskScore = 0;

    // Check for recent activity
    const lastEvent = events[events.length - 1];
    if (lastEvent) {
      const daysSinceLastActivity = Math.round(
        (new Date().getTime() - new Date(lastEvent.timestamp).getTime()) / (1000 * 60 * 60 * 24),
      );

      if (daysSinceLastActivity > 30) {
        riskScore += 0.4;
      } else if (daysSinceLastActivity > 14) {
        riskScore += 0.2;
      }
    }

    // Check for negative events
    const negativeEvents = events.filter(
      (e) =>
        e.event_type === "appointment_cancelled" ||
        e.event_type === "consultation_no_show" ||
        e.event_type === "complaint_made" ||
        e.metadata.sentiment === "negative",
    );

    if (negativeEvents.length > 0) {
      riskScore += Math.min(0.3, negativeEvents.length * 0.1);
    }

    // Check stage progression speed
    const currentStage = stages.find((s) => s.status === "active");
    if (currentStage && currentStage.duration_minutes > 20160) {
      // More than 14 days in current stage
      riskScore += 0.2;
    }

    // Check satisfaction scores
    const latestSatisfaction = stages.filter((s) => s.satisfaction_score).pop()?.satisfaction_score;

    if (latestSatisfaction && latestSatisfaction < 3.0) {
      riskScore += 0.3;
    }

    return Math.min(1.0, Math.max(0.0, riskScore));
  }

  /**
   * Identify journey bottlenecks
   */
  private identifyJourneyBottlenecks(stages: any[]) {
    // This would typically analyze historical data across all patients
    // For now, return example bottlenecks based on current journey
    return [
      {
        stage: "consultation_scheduled",
        average_duration_days: 7,
        conversion_rate: 0.75,
        drop_off_rate: 0.25,
      },
      {
        stage: "treatment_proposed",
        average_duration_days: 14,
        conversion_rate: 0.6,
        drop_off_rate: 0.4,
      },
    ];
  }

  /**
   * Generate actionable recommendations
   */
  private generateRecommendations(
    currentState: JourneyState,
    stages: any[],
    events: any[],
  ): string[] {
    const recommendations: string[] = [];

    // State-specific recommendations
    switch (currentState) {
      case "lead_generated":
        recommendations.push("Fazer contato inicial nas próximas 24h para maximizar conversão");
        break;
      case "consultation_scheduled":
        recommendations.push("Enviar lembrete 24h antes da consulta");
        recommendations.push("Confirmar presença por WhatsApp");
        break;
      case "treatment_proposed":
        recommendations.push("Agendar follow-up em 48h para discutir proposta");
        recommendations.push("Enviar material informativo sobre tratamento");
        break;
      case "dormant":
        recommendations.push("Implementar campanha de reativação personalizada");
        recommendations.push("Oferecer desconto especial para retorno");
        break;
    }

    // Activity-based recommendations
    const daysSinceLastActivity =
      events.length > 0
        ? Math.round(
            (new Date().getTime() - new Date(events[events.length - 1].timestamp).getTime()) /
              (1000 * 60 * 60 * 24),
          )
        : 0;

    if (daysSinceLastActivity > 7) {
      recommendations.push("Fazer contato para verificar interesse e necessidades atuais");
    }

    return recommendations;
  }

  /**
   * Generate key insights from journey data
   */
  private generateKeyInsights(stages: any[], events: any[]): string[] {
    const insights: string[] = [];

    // Journey progression insights
    const completedStages = stages.filter((s) => s.status === "completed").length;
    if (completedStages >= 5) {
      insights.push("Paciente demonstra alto engajamento com progressão consistente");
    }

    // Channel preference insights
    const channelCounts = events.reduce((acc: Record<string, number>, event) => {
      acc[event.channel] = (acc[event.channel] || 0) + 1;
      return acc;
    }, {});

    const preferredChannel = Object.keys(channelCounts).reduce((a, b) =>
      channelCounts[a] > channelCounts[b] ? a : b,
    );

    if (preferredChannel) {
      insights.push(`Canal de comunicação preferido: ${preferredChannel}`);
    }

    // Timing insights
    const eventTimes = events.map((e) => new Date(e.timestamp).getHours());
    const avgTime = eventTimes.reduce((sum, time) => sum + time, 0) / eventTimes.length;

    if (avgTime > 17) {
      insights.push("Paciente mais ativo no período noturno - considerar comunicação após 17h");
    } else if (avgTime < 10) {
      insights.push("Paciente mais ativo de manhã - prioritizar contato matinal");
    }

    return insights;
  }

  /**
   * Identify success factors in the journey
   */
  private identifySuccessFactors(stages: any[], events: any[]): string[] {
    const successFactors: string[] = [];

    // Quick progression
    const avgStageDuration =
      stages.reduce((sum, stage) => {
        return sum + (stage.duration_minutes || 0);
      }, 0) / stages.length;

    if (avgStageDuration < 2880) {
      // Less than 2 days average
      successFactors.push("Progressão rápida entre etapas");
    }

    // High satisfaction
    const avgSatisfaction =
      stages.filter((s) => s.satisfaction_score).reduce((sum, s) => sum + s.satisfaction_score, 0) /
      stages.filter((s) => s.satisfaction_score).length;

    if (avgSatisfaction > 4.0) {
      successFactors.push("Alta satisfação durante jornada");
    }

    // Multi-channel engagement
    const uniqueChannels = new Set(events.map((e) => e.channel)).size;
    if (uniqueChannels >= 3) {
      successFactors.push("Engajamento multi-canal");
    }

    // Consistent activity
    const eventSpread =
      events.length > 1
        ? (new Date(events[events.length - 1].timestamp).getTime() -
            new Date(events[0].timestamp).getTime()) /
          (1000 * 60 * 60 * 24)
        : 0;

    if (eventSpread > 0 && events.length / eventSpread > 0.5) {
      // More than 0.5 events per day
      successFactors.push("Atividade consistente e regular");
    }

    return successFactors;
  }

  /**
   * Identify optimization opportunities
   */
  private identifyOptimizationOpportunities(stages: any[], events: any[]): string[] {
    const opportunities: string[] = [];

    // Long duration in specific stages
    stages.forEach((stage) => {
      if (stage.duration_minutes > 10080) {
        // More than 7 days
        opportunities.push(`Otimizar duração na etapa: ${stage.stage_name}`);
      }
    });

    // Low engagement periods
    if (events.length < stages.length * 2) {
      opportunities.push("Aumentar pontos de contato e engajamento");
    }

    // Missing satisfaction data
    const stagesWithoutSatisfaction = stages.filter((s) => !s.satisfaction_score).length;
    if (stagesWithoutSatisfaction > 0) {
      opportunities.push("Implementar coleta de satisfação em todas as etapas");
    }

    // Channel diversification
    const uniqueChannels = new Set(events.map((e) => e.channel)).size;
    if (uniqueChannels < 2) {
      opportunities.push("Diversificar canais de comunicação");
    }

    return opportunities;
  }

  /**
   * Trigger real-time update notification
   */
  private async triggerRealTimeUpdate(patientId: string, eventId: string): Promise<void> {
    try {
      // This would typically trigger a real-time notification
      // using Supabase real-time or WebSocket connections
      logger.debug(`Real-time update triggered for patient ${patientId}`, { eventId });
    } catch (error) {
      logger.error("Failed to trigger real-time update:", error);
    }
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  PatientJourneyMappingEngine,
  JourneyStateMachine,
  type JourneyState,
  type JourneyEventType,
  type JourneyEventCategory,
  type CommunicationChannel,
  type PatientJourneyEvent,
  type JourneyStage,
  type JourneyAnalysis,
  type JourneyMappingConfig,
};
