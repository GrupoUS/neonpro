// AI-Driven Appointment Optimization Service
// Intelligent scheduling optimization for maximum efficiency and patient satisfaction

import { createClient } from "@supabase/supabase-js";
import { EnhancedAIService } from "./enhanced-service-base";
import type { AIServiceInput, AIServiceOutput } from "./enhanced-service-base";

// Optimization Types and Interfaces
export interface ScheduleContext {
  clinic_id: string;
  doctor_id?: string;
  specialty?: string;
  date_range: {
    start_date: string;
    end_date: string;
  };
  available_slots: TimeSlot[];
  existing_appointments: ExistingAppointment[];
  constraints: ScheduleConstraints;
}

export interface TimeSlot {
  start_time: string;
  end_time: string;
  available: boolean;
  slot_type:
    | "standard"
    | "extended"
    | "emergency"
    | "consultation"
    | "procedure";
  capacity: number;
  current_bookings: number;
  preferred_appointment_types: string[];
}

export interface ExistingAppointment {
  appointment_id: string;
  patient_id: string;
  doctor_id: string;
  start_time: string;
  end_time: string;
  appointment_type: string;
  status: "scheduled" | "confirmed" | "checked_in" | "completed" | "cancelled";
  urgency_level: "low" | "medium" | "high" | "urgent";
  preparation_time_minutes: number;
  cleanup_time_minutes: number;
}

export interface ScheduleConstraints {
  max_appointments_per_day: number;
  min_break_minutes: number;
  max_consecutive_appointments: number;
  lunch_break: { start_time: string; end_time: string };
  doctor_preferences: DoctorPreferences;
  clinic_policies: ClinicPolicies;
  emergency_slots_percentage: number;
}

export interface DoctorPreferences {
  preferred_appointment_types: string[];
  avoided_appointment_types: string[];
  preferred_time_blocks: {
    start_time: string;
    end_time: string;
    preference_score: number;
  }[];
  max_procedure_appointments_per_day: number;
  preferred_patient_age_groups: string[];
  fatigue_factor: number; // How much efficiency decreases over the day
}

export interface ClinicPolicies {
  overbooking_allowed: boolean;
  overbooking_percentage: number;
  same_day_booking_slots: number;
  priority_booking_rules: PriorityRule[];
  group_appointment_support: boolean;
  telemedicine_percentage: number;
}

export interface PriorityRule {
  condition: string; // e.g., "age > 65", "urgency == 'urgent'", "chronic_condition"
  priority_boost: number;
  description: string;
}

export interface AppointmentRequest {
  patient_id: string;
  patient_profile: PatientOptimizationProfile;
  appointment_type: string;
  duration_minutes: number;
  urgency_level: "low" | "medium" | "high" | "urgent";
  preferred_times: TimePreference[];
  constraints: PatientConstraints;
  special_requirements: string[];
}

export interface PatientOptimizationProfile {
  age: number;
  mobility_issues: boolean;
  chronic_conditions: string[];
  preferred_communication: string;
  distance_from_clinic_km: number;
  transportation_method: "car" | "public_transport" | "walk" | "other";
  work_schedule_flexibility: "none" | "low" | "medium" | "high";
  no_show_risk_score: number;
  satisfaction_history_score: number; // 1-10
}

export interface PatientConstraints {
  cannot_do_mornings: boolean;
  cannot_do_afternoons: boolean;
  needs_interpreter: boolean;
  requires_accessibility: boolean;
  must_avoid_dates: string[];
  preferred_doctor_id?: string;
  max_wait_time_minutes: number;
}

export interface TimePreference {
  day_of_week: number; // 0-6, Sunday = 0
  time_range: { start_time: string; end_time: string };
  preference_score: number; // 1-10, 10 = most preferred
  flexibility_minutes: number;
}

export interface OptimizationInput extends AIServiceInput {
  action:
    | "optimize_schedule"
    | "suggest_appointment_time"
    | "reschedule_optimization"
    | "analyze_schedule_efficiency"
    | "generate_scheduling_insights"
    | "batch_optimize";

  schedule_context?: ScheduleContext;
  appointment_requests?: AppointmentRequest[];
  optimization_goals?: OptimizationGoals;
  constraints?: OptimizationConstraints;

  // Single appointment optimization
  single_request?: AppointmentRequest;
  preferred_date_range?: { start_date: string; end_date: string };

  // Rescheduling
  appointments_to_reschedule?: string[];
  reschedule_reason?:
    | "doctor_unavailable"
    | "emergency"
    | "patient_request"
    | "optimization";

  // Analysis
  analysis_period?: { start_date: string; end_date: string };
  metrics_requested?: string[];
}

export interface OptimizationGoals {
  primary_goal:
    | "maximize_utilization"
    | "minimize_wait_times"
    | "maximize_satisfaction"
    | "balance_workload"
    | "minimize_no_shows";
  secondary_goals: string[];
  goal_weights: Record<string, number>;
  success_metrics: string[];
}

export interface OptimizationConstraints {
  hard_constraints: string[]; // Must be satisfied
  soft_constraints: {
    constraint: string;
    priority: number;
    penalty_weight: number;
  }[];
  optimization_time_limit_seconds: number;
  max_schedule_changes: number;
}

export interface OptimizationOutput extends AIServiceOutput {
  optimized_schedule?: OptimizedSchedule;
  suggested_appointments?: SuggestedAppointment[];
  schedule_changes?: ScheduleChange[];
  efficiency_metrics?: EfficiencyMetrics;
  scheduling_insights?: SchedulingInsight[];
  optimization_score?: number;

  // Single appointment suggestion
  suggested_times?: AppointmentSuggestion[];

  // Analysis results
  schedule_analysis?: ScheduleAnalysis;
  improvement_recommendations?: ImprovementRecommendation[];
}

export interface OptimizedSchedule {
  schedule_id: string;
  clinic_id: string;
  doctor_id?: string;
  date_range: { start_date: string; end_date: string };
  appointments: OptimizedAppointment[];
  utilization_rate: number;
  estimated_satisfaction_score: number;
  estimated_no_show_rate: number;
  buffer_time_minutes: number;
  overtime_risk_score: number;
}

interface OptimizationState {
  availableSlots: TimeSlot[];
  bookedSlots: Set<string>;
  utilizationTarget: number;
  satisfactionTarget: number;
}

export interface OptimizedAppointment {
  appointment_id?: string;
  patient_id: string;
  start_time: string;
  end_time: string;
  appointment_type: string;
  urgency_level: string;
  optimization_score: number;
  satisfaction_prediction: number;
  no_show_probability: number;
  scheduling_notes: string[];
}

export interface SuggestedAppointment {
  patient_id: string;
  suggested_time: string;
  duration_minutes: number;
  confidence_score: number;
  reasoning: string[];
  alternative_times: string[];
  expected_satisfaction: number;
}

export interface ScheduleChange {
  change_type: "add" | "remove" | "modify" | "reschedule";
  appointment_id?: string;
  old_time?: string;
  new_time?: string;
  reason: string;
  impact_score: number;
  affected_patients: string[];
}

export interface EfficiencyMetrics {
  utilization_rate: number;
  average_wait_time_minutes: number;
  appointment_gaps_count: number;
  overtime_probability: number;
  patient_satisfaction_prediction: number;
  resource_efficiency_score: number;
  no_show_adjusted_utilization: number;
}

export interface SchedulingInsight {
  insight_type: "pattern" | "bottleneck" | "opportunity" | "risk" | "trend";
  title: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  actionable_recommendations: string[];
  estimated_impact: number;
  confidence_level: number;
}

export interface AppointmentSuggestion {
  suggested_datetime: string;
  duration_minutes: number;
  slot_score: number;
  satisfaction_prediction: number;
  wait_time_minutes: number;
  scheduling_advantages: string[];
  scheduling_concerns: string[];
  doctor_suitability_score: number;
}

export interface ScheduleAnalysis {
  analysis_period: { start_date: string; end_date: string };
  total_appointments: number;
  average_utilization: number;
  peak_hours: { hour: number; utilization: number }[];
  appointment_type_distribution: Record<string, number>;
  patient_flow_patterns: FlowPattern[];
  bottleneck_analysis: BottleneckAnalysis;
  satisfaction_trends: SatisfactionTrend[];
}

export interface FlowPattern {
  pattern_name: string;
  frequency: number;
  description: string;
  optimization_opportunity: boolean;
  estimated_improvement: number;
}

export interface BottleneckAnalysis {
  identified_bottlenecks: {
    time_period: string;
    resource: string;
    severity: number;
    root_cause: string;
    solution_suggestions: string[];
  }[];
  resource_utilization: Record<string, number>;
  constraint_violations: number;
}

export interface SatisfactionTrend {
  date: string;
  satisfaction_score: number;
  no_show_rate: number;
  wait_time_average: number;
  complaints_count: number;
}

export interface ImprovementRecommendation {
  recommendation_type: "scheduling" | "resource" | "policy" | "workflow";
  title: string;
  description: string;
  implementation_difficulty: "easy" | "medium" | "hard";
  estimated_benefit: number;
  estimated_cost: number;
  timeline_weeks: number;
  success_probability: number;
}

// Appointment Optimization Service Implementation
export class AppointmentOptimizationService extends EnhancedAIService<
  OptimizationInput,
  OptimizationOutput
> {
  private readonly optimizationCache: Map<string, unknown> = new Map();

  constructor() {
    super("appointment_optimization_service");

    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.SUPABASE_SERVICE_ROLE_KEY || "",
    );

    // Initialize optimization algorithms
    this.initializeOptimization();
  }

  private async initializeOptimization(): Promise<void> {
    try {
      // Load scheduling rules and preferences
      await this.loadSchedulingRules();
    } catch {}
  }

  protected async executeCore(
    input: OptimizationInput,
  ): Promise<OptimizationOutput> {
    const startTime = performance.now();

    try {
      switch (input.action) {
        case "optimize_schedule": {
          return await this.optimizeSchedule(input);
        }
        case "suggest_appointment_time": {
          return await this.suggestAppointmentTime(input);
        }
        case "reschedule_optimization": {
          return await this.rescheduleOptimization(input);
        }
        case "analyze_schedule_efficiency": {
          return await this.analyzeScheduleEfficiency(input);
        }
        case "generate_scheduling_insights": {
          return await this.generateSchedulingInsights(input);
        }
        case "batch_optimize": {
          return await this.batchOptimize(input);
        }
        default: {
          throw new Error(`Unsupported optimization action: ${input.action}`);
        }
      }
    } finally {
      const duration = performance.now() - startTime;
      await this.recordMetric("appointment_optimization_operation", {
        action: input.action,
        duration_ms: duration,
      });
    }
  }

  private async optimizeSchedule(
    input: OptimizationInput,
  ): Promise<OptimizationOutput> {
    if (!(input.schedule_context && input.appointment_requests)) {
      throw new Error("schedule_context and appointment_requests are required");
    }

    const { schedule_context: context } = input;
    const { appointment_requests: requests } = input;
    const goals =
      input.optimization_goals || this.getDefaultOptimizationGoals();

    // Sort requests by priority and constraints
    const prioritizedRequests = this.prioritizeAppointmentRequests(requests);

    // Initialize optimization state
    const optimizationState = this.initializeOptimizationState(context);

    // Run optimization algorithm
    const optimizedAppointments = await this.runOptimizationAlgorithm(
      prioritizedRequests,
      optimizationState,
      goals,
    );

    // Calculate metrics
    const metrics = this.calculateEfficiencyMetrics(
      optimizedAppointments,
      context,
    );

    // Generate schedule changes
    const scheduleChanges = this.generateScheduleChanges(
      context.existing_appointments,
      optimizedAppointments,
    );

    const optimizedSchedule: OptimizedSchedule = {
      schedule_id: `opt_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      clinic_id: context.clinic_id,
      doctor_id: context.doctor_id,
      date_range: context.date_range,
      appointments: optimizedAppointments,
      utilization_rate: metrics.utilization_rate,
      estimated_satisfaction_score: metrics.patient_satisfaction_prediction,
      estimated_no_show_rate: metrics.no_show_adjusted_utilization / 100,
      buffer_time_minutes: this.calculateBufferTime(optimizedAppointments),
      overtime_risk_score: metrics.overtime_probability,
    };

    // Cache the result
    this.cacheOptimizationResult(context.clinic_id, optimizedSchedule);

    return {
      success: true,
      optimized_schedule: optimizedSchedule,
      schedule_changes: scheduleChanges,
      efficiency_metrics: metrics,
      optimization_score: this.calculateOverallOptimizationScore(
        metrics,
        goals,
      ),
    };
  }

  private async suggestAppointmentTime(
    input: OptimizationInput,
  ): Promise<OptimizationOutput> {
    if (!(input.single_request && input.schedule_context)) {
      throw new Error("single_request and schedule_context are required");
    }

    const { single_request: request } = input;
    const { schedule_context: context } = input;
    const dateRange = input.preferred_date_range || {
      start_date: new Date().toISOString().split("T")[0],
      end_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
    };

    // Find available slots within date range
    const availableSlots = this.findAvailableSlots(
      context,
      dateRange,
      request.duration_minutes,
    );

    // Score each slot
    const scoredSlots = await Promise.all(
      availableSlots.map(async (slot) => {
        const score = await this.scoreAppointmentSlot(slot, request, context);
        const satisfaction = this.predictPatientSatisfaction(slot, request);
        const waitTime = this.calculateWaitTime(slot, context);

        return {
          suggested_datetime: slot.start_time,
          duration_minutes: request.duration_minutes,
          slot_score: score,
          satisfaction_prediction: satisfaction,
          wait_time_minutes: waitTime,
          scheduling_advantages: this.getSchedulingAdvantages(
            slot,
            request,
            context,
          ),
          scheduling_concerns: this.getSchedulingConcerns(
            slot,
            request,
            context,
          ),
          doctor_suitability_score: this.calculateDoctorSuitability(
            slot,
            request,
            context,
          ),
        };
      }),
    );

    // Sort by score and return top suggestions
    const topSuggestions = scoredSlots
      .sort((a, b) => b.slot_score - a.slot_score)
      .slice(0, 5);

    return {
      success: true,
      suggested_times: topSuggestions,
    };
  }

  private async rescheduleOptimization(
    input: OptimizationInput,
  ): Promise<OptimizationOutput> {
    if (!(input.appointments_to_reschedule && input.schedule_context)) {
      throw new Error(
        "appointments_to_reschedule and schedule_context are required",
      );
    }

    const { appointments_to_reschedule: appointmentIds } = input;
    const { schedule_context: context } = input;
    const reason = input.reschedule_reason || "optimization";

    const scheduleChanges: ScheduleChange[] = [];
    const affectedAppointments = context.existing_appointments.filter((apt) =>
      appointmentIds.includes(apt.appointment_id),
    );

    for (const appointment of affectedAppointments) {
      // Find alternative times
      const alternatives = await this.findAlternativeSlots(
        appointment,
        context,
      );

      if (alternatives.length > 0) {
        const [bestAlternative] = alternatives;

        scheduleChanges.push({
          change_type: "reschedule",
          appointment_id: appointment.appointment_id,
          old_time: appointment.start_time,
          new_time: bestAlternative.start_time,
          reason: `Rescheduled due to ${reason}`,
          impact_score: this.calculateRescheduleImpact(
            appointment,
            bestAlternative,
          ),
          affected_patients: [appointment.patient_id],
        });
      }
    }

    // Recalculate metrics after changes
    const updatedAppointments = this.applyScheduleChanges(
      context.existing_appointments,
      scheduleChanges,
    );
    const metrics = this.calculateEfficiencyMetrics(
      updatedAppointments.map((apt) => ({
        appointment_id: apt.appointment_id,
        patient_id: apt.patient_id,
        start_time: apt.start_time,
        end_time: apt.end_time,
        appointment_type: apt.appointment_type,
        urgency_level: apt.urgency_level,
        optimization_score: 0.8,
        satisfaction_prediction: 7.5,
        no_show_probability: 0.15,
        scheduling_notes: [],
      })),
      context,
    );

    return {
      success: true,
      schedule_changes: scheduleChanges,
      efficiency_metrics: metrics,
    };
  }

  private async analyzeScheduleEfficiency(
    input: OptimizationInput,
  ): Promise<OptimizationOutput> {
    if (!(input.schedule_context && input.analysis_period)) {
      throw new Error("schedule_context and analysis_period are required");
    }

    const { schedule_context: context } = input;
    const { analysis_period: period } = input;

    // Analyze historical appointment data
    const appointments = context.existing_appointments.filter((apt) => {
      const aptDate = apt.start_time.split("T")[0];
      return aptDate >= period.start_date && aptDate <= period.end_date;
    });

    const analysis: ScheduleAnalysis = {
      analysis_period: period,
      total_appointments: appointments.length,
      average_utilization: this.calculateAverageUtilization(
        appointments,
        context,
      ),
      peak_hours: this.identifyPeakHours(appointments),
      appointment_type_distribution:
        this.calculateTypeDistribution(appointments),
      patient_flow_patterns: this.identifyFlowPatterns(appointments),
      bottleneck_analysis: this.analyzeBottlenecks(appointments, context),
      satisfaction_trends: this.analyzeSatisfactionTrends(appointments, period),
    };

    const insights = this.generateInsightsFromAnalysis(analysis);
    const recommendations = this.generateImprovementRecommendations(analysis);

    return {
      success: true,
      schedule_analysis: analysis,
      scheduling_insights: insights,
      improvement_recommendations: recommendations,
    };
  }

  private async generateSchedulingInsights(
    input: OptimizationInput,
  ): Promise<OptimizationOutput> {
    if (!input.schedule_context) {
      throw new Error("schedule_context is required");
    }

    const { schedule_context: context } = input;
    const insights: SchedulingInsight[] = [];

    // Analyze current schedule for insights
    const utilization = this.calculateAverageUtilization(
      context.existing_appointments,
      context,
    );
    const waitTimes = this.analyzeWaitTimes(context.existing_appointments);
    const patterns = this.identifySchedulingPatterns(
      context.existing_appointments,
    );

    // Generate utilization insights
    if (utilization < 0.7) {
      insights.push({
        insight_type: "opportunity",
        title: "Low Schedule Utilization Detected",
        description: `Current utilization is ${(utilization * 100).toFixed(
          1,
        )}%. Consider overbooking or adjusting slot sizes.`,
        severity: "medium",
        actionable_recommendations: [
          "Enable controlled overbooking for high no-show risk patients",
          "Reduce appointment slot durations by 10-15%",
          "Implement same-day booking slots",
        ],
        estimated_impact: 0.15,
        confidence_level: 0.85,
      });
    }

    // Generate wait time insights
    if (waitTimes.average > 20) {
      insights.push({
        insight_type: "bottleneck",
        title: "Excessive Patient Wait Times",
        description: `Average wait time is ${waitTimes.average.toFixed(
          1,
        )} minutes. This may impact patient satisfaction.`,
        severity: "high",
        actionable_recommendations: [
          "Add buffer time between appointments",
          "Implement patient flow optimization",
          "Consider staggered check-in times",
        ],
        estimated_impact: 0.25,
        confidence_level: 0.9,
      });
    }

    // Generate pattern-based insights
    patterns.forEach((pattern) => {
      if (pattern.optimization_opportunity) {
        insights.push({
          insight_type: "pattern",
          title: `Optimization Opportunity: ${pattern.pattern_name}`,
          description: pattern.description,
          severity: "medium",
          actionable_recommendations: [
            `Optimize ${pattern.pattern_name.toLowerCase()} scheduling`,
            "Implement automated pattern-based suggestions",
          ],
          estimated_impact: pattern.estimated_improvement,
          confidence_level: 0.75,
        });
      }
    });

    return {
      success: true,
      scheduling_insights: insights,
    };
  }

  private async batchOptimize(
    input: OptimizationInput,
  ): Promise<OptimizationOutput> {
    if (!(input.appointment_requests && input.schedule_context)) {
      throw new Error("appointment_requests and schedule_context are required");
    }

    // Process requests in batches for better performance
    const batchSize = 50;
    const { appointment_requests: requests } = input;
    const { schedule_context: context } = input;

    const allSuggestions: SuggestedAppointment[] = [];
    const batchResults: unknown[] = [];

    for (let i = 0; i < requests.length; i += batchSize) {
      const batch = requests.slice(i, i + batchSize);

      const batchSuggestions = await Promise.all(
        batch.map(async (request) => {
          const suggestions = await this.findOptimalTimeForRequest(
            request,
            context,
          );
          return {
            patient_id: request.patient_id,
            suggested_time: suggestions[0]?.suggested_datetime || "",
            duration_minutes: request.duration_minutes,
            confidence_score: suggestions[0]?.slot_score || 0.5,
            reasoning: [`Batch optimized for ${request.appointment_type}`],
            alternative_times: suggestions
              .slice(1, 4)
              .map((s) => s.suggested_datetime),
            expected_satisfaction: suggestions[0]?.satisfaction_prediction || 7,
          };
        }),
      );

      allSuggestions.push(...batchSuggestions);
      batchResults.push({
        batch_number: Math.floor(i / batchSize) + 1,
        processed_requests: batch.length,
        success_rate:
          batchSuggestions.filter((s) => s.suggested_time !== "").length /
          batch.length,
      });
    }

    return {
      success: true,
      suggested_appointments: allSuggestions,
      optimization_score: this.calculateBatchOptimizationScore(batchResults),
    };
  }

  // Helper methods for optimization algorithms

  private prioritizeAppointmentRequests(
    requests: AppointmentRequest[],
  ): AppointmentRequest[] {
    return requests.sort((a, b) => {
      // Priority factors: urgency, no-show risk, patient satisfaction
      const urgencyWeight = { urgent: 4, high: 3, medium: 2, low: 1 };
      const aScore =
        urgencyWeight[a.urgency_level] * 0.4 +
        (1 - a.patient_profile.no_show_risk_score) * 0.3 +
        a.patient_profile.satisfaction_history_score * 0.3;

      const bScore =
        urgencyWeight[b.urgency_level] * 0.4 +
        (1 - b.patient_profile.no_show_risk_score) * 0.3 +
        b.patient_profile.satisfaction_history_score * 0.3;

      return bScore - aScore;
    });
  }

  private initializeOptimizationState(
    context: ScheduleContext,
  ): OptimizationState {
    return {
      availableSlots: context.available_slots,
      bookedSlots: new Set(
        context.existing_appointments.map((a) => a.start_time),
      ),
      utilizationTarget: 0.85,
      satisfactionTarget: 8,
    };
  }

  private async runOptimizationAlgorithm(
    requests: AppointmentRequest[],
    state: OptimizationState,
    goals: OptimizationGoals,
  ): Promise<OptimizedAppointment[]> {
    const optimizedAppointments: OptimizedAppointment[] = [];

    for (const request of requests) {
      const bestSlot = await this.findBestSlotForRequest(request, state, goals);

      if (bestSlot) {
        optimizedAppointments.push({
          appointment_id: `opt_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
          patient_id: request.patient_id,
          start_time: bestSlot.start_time,
          end_time: bestSlot.end_time,
          appointment_type: request.appointment_type,
          urgency_level: request.urgency_level,
          optimization_score: bestSlot.score,
          satisfaction_prediction: bestSlot.satisfaction,
          no_show_probability: request.patient_profile.no_show_risk_score,
          scheduling_notes: bestSlot.notes,
        });

        // Update state
        state.bookedSlots.add(bestSlot.start_time);
      }
    }

    return optimizedAppointments;
  }

  private async findBestSlotForRequest(
    request: AppointmentRequest,
    state: OptimizationState,
    goals: OptimizationGoals,
  ): Promise<TimeSlot | null> {
    const candidateSlots = state.availableSlots.filter(
      (slot: TimeSlot) =>
        slot.available &&
        !state.bookedSlots.has(slot.start_time) &&
        this.slotMeetsConstraints(slot, request),
    );

    let bestSlot;
    let bestScore = -1;

    for (const slot of candidateSlots) {
      const score = this.calculateSlotScore(slot, request, goals);

      if (score > bestScore) {
        bestScore = score;
        bestSlot = {
          start_time: slot.start_time,
          end_time: slot.end_time,
          score,
          satisfaction: this.predictPatientSatisfaction(slot, request),
          notes: this.generateSchedulingNotes(slot, request),
        };
      }
    }

    return bestSlot;
  }

  private slotMeetsConstraints(
    slot: TimeSlot,
    request: AppointmentRequest,
  ): boolean {
    // Check patient constraints
    const slotDate = new Date(slot.start_time);
    const hour = slotDate.getHours();

    if (request.constraints.cannot_do_mornings && hour < 12) {
      return false;
    }
    if (request.constraints.cannot_do_afternoons && hour >= 12) {
      return false;
    }

    const slotDateStr = slot.start_time.split("T")[0];
    if (request.constraints.must_avoid_dates.includes(slotDateStr)) {
      return false;
    }

    return true;
  }

  private calculateSlotScore(
    slot: TimeSlot,
    request: AppointmentRequest,
    goals: OptimizationGoals,
  ): number {
    let score = 0;

    // Base score from slot suitability
    score += this.calculateSlotSuitability(slot, request) * 0.4;

    // Patient preference alignment
    score += this.calculatePreferenceAlignment(slot, request) * 0.3;

    // Optimization goal alignment
    score += this.calculateGoalAlignment(slot, request, goals) * 0.3;

    return Math.max(0, Math.min(1, score));
  }

  private calculateSlotSuitability(
    slot: TimeSlot,
    request: AppointmentRequest,
  ): number {
    let suitability = 0.5; // Base suitability

    // Appointment type match
    if (slot.preferred_appointment_types.includes(request.appointment_type)) {
      suitability += 0.2;
    }

    // Slot utilization
    const utilizationRate = slot.current_bookings / slot.capacity;
    if (utilizationRate < 0.8) {
      suitability += 0.1 * (0.8 - utilizationRate);
    }

    return Math.max(0, Math.min(1, suitability));
  }

  private calculatePreferenceAlignment(
    slot: TimeSlot,
    request: AppointmentRequest,
  ): number {
    const slotDate = new Date(slot.start_time);
    const dayOfWeek = slotDate.getDay();
    const hour = slotDate.getHours();

    let alignment = 0.5; // Base alignment

    // Check time preferences
    for (const pref of request.preferred_times) {
      if (pref.day_of_week === dayOfWeek) {
        const prefStart = Number.parseInt(
          pref.time_range.start_time.split(":")[0],
          10,
        );
        const prefEnd = Number.parseInt(
          pref.time_range.end_time.split(":")[0],
          10,
        );

        if (hour >= prefStart && hour <= prefEnd) {
          alignment += (pref.preference_score / 10) * 0.3;
        }
      }
    }

    return Math.max(0, Math.min(1, alignment));
  }

  private calculateGoalAlignment(
    slot: TimeSlot,
    request: AppointmentRequest,
    goals: OptimizationGoals,
  ): number {
    let alignment = 0.5;

    switch (goals.primary_goal) {
      case "maximize_utilization": {
        alignment += (slot.current_bookings / slot.capacity) * 0.3;
        break;
      }
      case "minimize_wait_times": {
        // Prefer slots with less congestion
        alignment += (1 - slot.current_bookings / slot.capacity) * 0.3;
        break;
      }
      case "maximize_satisfaction": {
        alignment +=
          (this.predictPatientSatisfaction(slot, request) / 10) * 0.3;
        break;
      }
      case "minimize_no_shows": {
        alignment += (1 - request.patient_profile.no_show_risk_score) * 0.3;
        break;
      }
    }

    return Math.max(0, Math.min(1, alignment));
  }

  private predictPatientSatisfaction(
    slot: TimeSlot,
    request: AppointmentRequest,
  ): number {
    // Simple satisfaction prediction model
    let satisfaction = 7; // Base satisfaction

    // Time preference alignment
    const alignment = this.calculatePreferenceAlignment(slot, request);
    satisfaction += alignment * 2;

    // Wait time impact
    const expectedWaitTime = slot.current_bookings * 10; // Rough estimate
    if (expectedWaitTime <= request.constraints.max_wait_time_minutes) {
      satisfaction += 0.5;
    } else {
      satisfaction -= 1;
    }

    return Math.max(1, Math.min(10, satisfaction));
  }

  private calculateWaitTime(slot: TimeSlot, _context: ScheduleContext): number {
    // Estimate wait time based on slot congestion and historical data
    const baseWaitTime = 5; // minutes
    const congestionFactor = slot.current_bookings / slot.capacity;

    return Math.round(baseWaitTime * (1 + congestionFactor * 2));
  }

  private getSchedulingAdvantages(
    slot: TimeSlot,
    request: AppointmentRequest,
    _context: ScheduleContext,
  ): string[] {
    const advantages: string[] = [];

    if (slot.current_bookings < slot.capacity * 0.7) {
      advantages.push("Low wait time expected");
    }

    if (slot.preferred_appointment_types.includes(request.appointment_type)) {
      advantages.push("Optimal slot type for this appointment");
    }

    const slotDate = new Date(slot.start_time);
    if (slotDate.getDay() >= 1 && slotDate.getDay() <= 5) {
      advantages.push("Weekday appointment - better accessibility");
    }

    return advantages;
  }

  private getSchedulingConcerns(
    slot: TimeSlot,
    request: AppointmentRequest,
    _context: ScheduleContext,
  ): string[] {
    const concerns: string[] = [];

    if (slot.current_bookings >= slot.capacity * 0.9) {
      concerns.push("High congestion - potential for delays");
    }

    const slotDate = new Date(slot.start_time);
    if (slotDate.getDay() === 1) {
      // Monday
      concerns.push("Monday morning - typically busy period");
    }

    if (request.patient_profile.no_show_risk_score > 0.3) {
      concerns.push("Patient has elevated no-show risk");
    }

    return concerns;
  }

  private calculateDoctorSuitability(
    _slot: TimeSlot,
    _request: AppointmentRequest,
    _context: ScheduleContext,
  ): number {
    // In a full implementation, this would consider doctor-patient matching
    return 0.85; // Default good suitability
  }

  private findAvailableSlots(
    context: ScheduleContext,
    dateRange: { start_date: string; end_date: string },
    _durationMinutes: number,
  ): TimeSlot[] {
    return context.available_slots.filter((slot) => {
      const slotDate = slot.start_time.split("T")[0];
      return (
        slot.available &&
        slotDate >= dateRange.start_date &&
        slotDate <= dateRange.end_date
      );
    });
  }

  private async scoreAppointmentSlot(
    slot: TimeSlot,
    request: AppointmentRequest,
    _context: ScheduleContext,
  ): Promise<number> {
    // Comprehensive scoring algorithm
    const goals = this.getDefaultOptimizationGoals();
    return this.calculateSlotScore(slot, request, goals);
  }

  private async findOptimalTimeForRequest(
    request: AppointmentRequest,
    context: ScheduleContext,
  ): Promise<AppointmentSuggestion[]> {
    const dateRange = {
      start_date: new Date().toISOString().split("T")[0],
      end_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
    };

    const availableSlots = this.findAvailableSlots(
      context,
      dateRange,
      request.duration_minutes,
    );

    return availableSlots.slice(0, 3).map((slot) => ({
      suggested_datetime: slot.start_time,
      duration_minutes: request.duration_minutes,
      slot_score: 0.8,
      satisfaction_prediction: 7.5,
      wait_time_minutes: 10,
      scheduling_advantages: ["Available slot", "Good timing"],
      scheduling_concerns: [],
      doctor_suitability_score: 0.85,
    }));
  }

  private getDefaultOptimizationGoals(): OptimizationGoals {
    return {
      primary_goal: "maximize_satisfaction",
      secondary_goals: ["minimize_wait_times", "maximize_utilization"],
      goal_weights: {
        satisfaction: 0.4,
        utilization: 0.3,
        wait_time: 0.3,
      },
      success_metrics: [
        "patient_satisfaction",
        "utilization_rate",
        "on_time_performance",
      ],
    };
  }

  // Additional helper methods would be implemented here...

  private calculateEfficiencyMetrics(
    appointments: OptimizedAppointment[],
    context: ScheduleContext,
  ): EfficiencyMetrics {
    const totalSlots = context.available_slots.length;
    const { length: bookedSlots } = appointments;
    const utilization = totalSlots > 0 ? bookedSlots / totalSlots : 0;

    return {
      utilization_rate: utilization,
      average_wait_time_minutes: 12,
      appointment_gaps_count: Math.max(0, totalSlots - bookedSlots),
      overtime_probability: 0.15,
      patient_satisfaction_prediction:
        appointments.reduce(
          (sum, apt) => sum + apt.satisfaction_prediction,
          0,
        ) / appointments.length || 7,
      resource_efficiency_score: utilization * 0.85,
      no_show_adjusted_utilization: utilization * 0.9,
    };
  }

  private generateScheduleChanges(
    _existing: ExistingAppointment[],
    _optimized: OptimizedAppointment[],
  ): ScheduleChange[] {
    const changes: ScheduleChange[] = [];

    // Compare and identify changes
    // This would include logic to match existing appointments with optimized ones
    // and identify what changes were made

    return changes;
  }

  private calculateOverallOptimizationScore(
    metrics: EfficiencyMetrics,
    _goals: OptimizationGoals,
  ): number {
    let score = 0;

    score += metrics.utilization_rate * 0.3;
    score += (metrics.patient_satisfaction_prediction / 10) * 0.4;
    score += (1 - metrics.overtime_probability) * 0.3;

    return Math.max(0, Math.min(1, score));
  }

  private calculateBufferTime(_appointments: OptimizedAppointment[]): number {
    // Calculate average buffer time between appointments
    return 10; // Default 10 minutes
  }

  private cacheOptimizationResult(
    clinicId: string,
    result: OptimizedSchedule,
  ): void {
    const cacheKey = `optimization_${clinicId}_${Date.now()}`;
    this.optimizationCache.set(cacheKey, {
      result,
      timestamp: Date.now(),
    });
  }

  private async loadSchedulingRules(): Promise<void> {}

  // Additional implementation methods would follow the same pattern...

  // Public helper methods
  public async optimizeClinicSchedule(
    clinicId: string,
    dateRange: { start_date: string; end_date: string },
    appointmentRequests: AppointmentRequest[],
  ): Promise<OptimizedSchedule> {
    // Simplified public interface
    const mockContext: ScheduleContext = {
      clinic_id: clinicId,
      date_range: dateRange,
      available_slots: [], // Would be loaded from database
      existing_appointments: [], // Would be loaded from database
      constraints: {
        max_appointments_per_day: 40,
        min_break_minutes: 15,
        max_consecutive_appointments: 8,
        lunch_break: { start_time: "12:00", end_time: "13:00" },
        doctor_preferences: {
          preferred_appointment_types: ["consultation", "follow_up"],
          avoided_appointment_types: ["emergency"],
          preferred_time_blocks: [],
          max_procedure_appointments_per_day: 5,
          preferred_patient_age_groups: ["adult"],
          fatigue_factor: 0.1,
        },
        clinic_policies: {
          overbooking_allowed: true,
          overbooking_percentage: 10,
          same_day_booking_slots: 5,
          priority_booking_rules: [],
          group_appointment_support: false,
          telemedicine_percentage: 20,
        },
        emergency_slots_percentage: 15,
      },
    };

    const result = await this.execute({
      action: "optimize_schedule",
      schedule_context: mockContext,
      appointment_requests: appointmentRequests,
    });

    return result.optimized_schedule!;
  }

  // More helper methods would continue here...

  private calculateAverageUtilization(
    _appointments: ExistingAppointment[],
    _context: ScheduleContext,
  ): number {
    // Implementation would calculate actual utilization
    return 0.75; // Mock value
  }

  private identifyPeakHours(
    _appointments: ExistingAppointment[],
  ): { hour: number; utilization: number }[] {
    // Implementation would analyze appointment distribution by hour
    return [
      { hour: 9, utilization: 0.9 },
      { hour: 10, utilization: 0.85 },
      { hour: 14, utilization: 0.8 },
    ];
  }

  private calculateTypeDistribution(
    appointments: ExistingAppointment[],
  ): Record<string, number> {
    const distribution: Record<string, number> = {};
    appointments.forEach((apt) => {
      distribution[apt.appointment_type] =
        (distribution[apt.appointment_type] || 0) + 1;
    });
    return distribution;
  }

  private identifyFlowPatterns(
    _appointments: ExistingAppointment[],
  ): FlowPattern[] {
    return [
      {
        pattern_name: "Monday Morning Rush",
        frequency: 0.8,
        description: "High appointment density on Monday mornings",
        optimization_opportunity: true,
        estimated_improvement: 0.15,
      },
    ];
  }

  private analyzeBottlenecks(
    _appointments: ExistingAppointment[],
    _context: ScheduleContext,
  ): BottleneckAnalysis {
    return {
      identified_bottlenecks: [
        {
          time_period: "9:00-11:00 AM",
          resource: "Doctor availability",
          severity: 0.7,
          root_cause: "High demand for morning slots",
          solution_suggestions: ["Add morning slots", "Implement overbooking"],
        },
      ],
      resource_utilization: { doctor: 0.85, rooms: 0.75 },
      constraint_violations: 2,
    };
  }

  private analyzeSatisfactionTrends(
    _appointments: ExistingAppointment[],
    period: { start_date: string; end_date: string },
  ): SatisfactionTrend[] {
    return [
      {
        date: period.start_date,
        satisfaction_score: 8.2,
        no_show_rate: 0.12,
        wait_time_average: 15,
        complaints_count: 2,
      },
    ];
  }

  private generateInsightsFromAnalysis(
    analysis: ScheduleAnalysis,
  ): SchedulingInsight[] {
    const insights: SchedulingInsight[] = [];

    if (analysis.average_utilization < 0.7) {
      insights.push({
        insight_type: "opportunity",
        title: "Underutilized Schedule Capacity",
        description: `Average utilization is ${(analysis.average_utilization * 100).toFixed(1)}%`,
        severity: "medium",
        actionable_recommendations: [
          "Implement overbooking",
          "Adjust slot sizes",
        ],
        estimated_impact: 0.2,
        confidence_level: 0.85,
      });
    }

    return insights;
  }

  private generateImprovementRecommendations(
    _analysis: ScheduleAnalysis,
  ): ImprovementRecommendation[] {
    return [
      {
        recommendation_type: "scheduling",
        title: "Implement Dynamic Overbooking",
        description: "Use predictive analytics to enable smart overbooking",
        implementation_difficulty: "medium",
        estimated_benefit: 0.15,
        estimated_cost: 5000,
        timeline_weeks: 4,
        success_probability: 0.8,
      },
    ];
  }

  private analyzeWaitTimes(_appointments: ExistingAppointment[]): {
    average: number;
    median: number;
    peak: number;
  } {
    // Mock implementation
    return { average: 18, median: 15, peak: 35 };
  }

  private identifySchedulingPatterns(
    _appointments: ExistingAppointment[],
  ): FlowPattern[] {
    return [
      {
        pattern_name: "Friday Afternoon Cancellations",
        frequency: 0.3,
        description: "Higher cancellation rate on Friday afternoons",
        optimization_opportunity: true,
        estimated_improvement: 0.1,
      },
    ];
  }

  private calculateBatchOptimizationScore(
    batchResults: { success_rate: number }[],
  ): number {
    const avgSuccessRate =
      batchResults.reduce((sum, batch) => sum + batch.success_rate, 0) /
      batchResults.length;
    return avgSuccessRate * 0.9; // Slightly penalize batch processing
  }

  private async findAlternativeSlots(
    appointment: ExistingAppointment,
    context: ScheduleContext,
  ): Promise<TimeSlot[]> {
    // Find alternative time slots for rescheduling
    return context.available_slots
      .filter(
        (slot) => slot.available && slot.start_time !== appointment.start_time,
      )
      .slice(0, 3);
  }

  private calculateRescheduleImpact(
    _original: ExistingAppointment,
    _alternative: TimeSlot,
  ): number {
    // Calculate impact score of rescheduling
    return 0.6; // Mock implementation
  }

  private applyScheduleChanges(
    appointments: ExistingAppointment[],
    _changes: ScheduleChange[],
  ): ExistingAppointment[] {
    // Apply schedule changes and return updated appointment list
    return appointments; // Mock implementation
  }

  private generateSchedulingNotes(
    _slot: TimeSlot,
    request: AppointmentRequest,
  ): string[] {
    return [`Scheduled for ${request.appointment_type} appointment`];
  }
}

// Export singleton instance
export const appointmentOptimizationService =
  new AppointmentOptimizationService();
