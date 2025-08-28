/**
 * NEONPRO AI Scheduling Engine
 * Healthcare-focused appointment optimization for aesthetic clinics
 * Implements LGPD compliant scheduling with audit trails
 */

import { createAuditLog } from "@neonpro/compliance/audit";
import { validateHealthcareAccess } from "@neonpro/security/auth";
import { z } from "zod";

// ✅ Healthcare-specific scheduling interfaces
interface HealthcareProfessional {
  id: string;
  name: string;
  specializations: string[];
  availability: TimeSlot[];
  efficiency_rating: number;
}

interface AestheticTreatment {
  id: string;
  name: string;
  duration_minutes: number;
  required_equipment: string[];
  preparation_time: number;
  recovery_time: number;
  professional_requirements: string[];
}

interface TimeSlot {
  start: Date;
  end: Date;
  available: boolean;
  professional_id: string;
  room_id?: string;
}

interface AppointmentRequest {
  patient_id: string;
  treatment_id: string;
  preferred_professional_id?: string;
  preferred_date_range: {
    start: Date;
    end: Date;
  };
  priority: "low" | "medium" | "high" | "urgent";
  flexibility_hours: number; // How flexible the patient is with timing
}

// ✅ Zod schemas for validation
const AppointmentRequestSchema = z.object({
  patient_id: z.string().uuid("ID do paciente deve ser um UUID válido"),
  treatment_id: z.string().uuid("ID do tratamento deve ser um UUID válido"),
  preferred_professional_id: z.string().uuid().optional(),
  preferred_date_range: z.object({
    start: z.date(),
    end: z.date(),
  }),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  flexibility_hours: z.number().min(0).max(168), // Max 1 week flexibility
});

interface SchedulingRecommendation {
  slot: TimeSlot;
  professional: HealthcareProfessional;
  treatment: AestheticTreatment;
  confidence_score: number; // 0-100
  optimization_factors: {
    time_efficiency: number;
    resource_utilization: number;
    patient_preference_match: number;
    professional_expertise_match: number;
  };
  estimated_satisfaction: number;
} /**
 * AISchedulingEngine - Core scheduling optimization class
 * Implements machine learning-inspired algorithms for optimal appointment scheduling
 */

export class AISchedulingEngine {
  private readonly professionals: Map<string, HealthcareProfessional> = new Map();
  private readonly treatments: Map<string, AestheticTreatment> = new Map();

  constructor() {
    this.initializeCache();
  }

  /**
   * Optimize schedule for a specific appointment request
   * Uses multi-factor optimization algorithm
   */
  async optimizeSchedule(rawRequest: unknown): Promise<{
    success: boolean;
    recommendations?: SchedulingRecommendation[];
    error?: string;
    audit_id?: string;
  }> {
    try {
      // ✅ Validate healthcare professional access
      const professional = await validateHealthcareAccess();

      // ✅ Validate and parse request
      const request = AppointmentRequestSchema.parse(rawRequest);

      // ✅ Get available slots within the requested range
      const availableSlots = await this.getAvailableSlots(
        request.preferred_date_range.start,
        request.preferred_date_range.end,
        request.treatment_id,
      );

      if (availableSlots.length === 0) {
        return {
          success: false,
          error: "Nenhum horário disponível no período solicitado",
        };
      }

      // ✅ Generate AI-optimized recommendations
      const recommendations = await this.generateOptimizedRecommendations(
        request,
        availableSlots,
      );

      // ✅ MANDATORY audit log for healthcare compliance
      const auditLog = await createAuditLog({
        action: "AI_SCHEDULE_OPTIMIZATION",
        resourceId: request.patient_id,
        userId: professional.id,
        details: {
          treatment_id: request.treatment_id,
          recommendations_count: recommendations.length,
          optimization_timestamp: new Date().toISOString(),
        },
      });

      return {
        success: true,
        recommendations: recommendations.slice(0, 5), // Return top 5 recommendations
        audit_id: auditLog.id,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof z.ZodError
          ? "Dados da solicitação inválidos"
          : "Falha na otimização do agendamento",
      };
    }
  }

  /**
   * Generate AI-powered scheduling recommendations
   * Implements weighted multi-criteria decision analysis
   */
  async generateRecommendations(slots: TimeSlot[]): Promise<{
    recommendations: SchedulingRecommendation[];
    confidence: number;
    metadata: {
      algorithm_version: string;
      factors_considered: string[];
      optimization_time_ms: number;
    };
  }> {
    const startTime = performance.now();

    if (slots.length === 0) {
      return {
        recommendations: [],
        confidence: 0,
        metadata: {
          algorithm_version: "1.0.0",
          factors_considered: [],
          optimization_time_ms: 0,
        },
      };
    }

    // ✅ Multi-factor optimization algorithm
    const recommendations: SchedulingRecommendation[] = [];

    for (const slot of slots) {
      const professional = this.professionals.get(slot.professional_id);
      if (!professional) {
        continue;
      }

      const recommendation: SchedulingRecommendation = {
        slot,
        professional,
        treatment: this.treatments.get("default")!, // This should come from request
        confidence_score: this.calculateConfidenceScore(slot, professional),
        optimization_factors: {
          time_efficiency: this.calculateTimeEfficiency(slot),
          resource_utilization: this.calculateResourceUtilization(slot),
          patient_preference_match: this.calculatePreferenceMatch(slot),
          professional_expertise_match: professional.efficiency_rating * 20,
        },
        estimated_satisfaction: this.calculateEstimatedSatisfaction(
          slot,
          professional,
        ),
      };

      recommendations.push(recommendation);
    }

    // ✅ Sort by composite optimization score
    recommendations.sort((a, b) => b.confidence_score - a.confidence_score);

    const endTime = performance.now();
    const overallConfidence = recommendations.length > 0
      ? recommendations.reduce((sum, r) => sum + r.confidence_score, 0)
        / recommendations.length
      : 0;

    return {
      recommendations,
      confidence: Math.round(overallConfidence),
      metadata: {
        algorithm_version: "1.0.0",
        factors_considered: [
          "time_efficiency",
          "resource_utilization",
          "professional_expertise",
          "patient_preferences",
          "clinic_capacity",
        ],
        optimization_time_ms: Math.round(endTime - startTime),
      },
    };
  } /**
   * Generate optimized recommendations using AI algorithms
   * @private
   */

  private async generateOptimizedRecommendations(
    request: z.infer<typeof AppointmentRequestSchema>,
    availableSlots: TimeSlot[],
  ): Promise<SchedulingRecommendation[]> {
    const recommendations: SchedulingRecommendation[] = [];

    for (const slot of availableSlots) {
      const professional = this.professionals.get(slot.professional_id);
      const treatment = this.treatments.get(request.treatment_id);

      if (!(professional && treatment)) {
        continue;
      }

      // ✅ Check if professional can perform the treatment
      const canPerformTreatment = this.checkProfessionalCompetency(
        professional,
        treatment,
      );

      if (!canPerformTreatment) {
        continue;
      }

      const recommendation: SchedulingRecommendation = {
        slot,
        professional,
        treatment,
        confidence_score: this.calculateAdvancedConfidenceScore(
          slot,
          professional,
          treatment,
          request,
        ),
        optimization_factors: {
          time_efficiency: this.calculateTimeEfficiency(slot),
          resource_utilization: this.calculateResourceUtilization(slot),
          patient_preference_match: this.calculateAdvancedPreferenceMatch(
            slot,
            request,
          ),
          professional_expertise_match: this.calculateExpertiseMatch(
            professional,
            treatment,
          ),
        },
        estimated_satisfaction: this.calculateEstimatedSatisfaction(
          slot,
          professional,
        ),
      };

      recommendations.push(recommendation);
    }

    // ✅ Advanced sorting with multiple criteria
    return recommendations.sort((a, b) => {
      // Primary: Confidence score
      if (Math.abs(a.confidence_score - b.confidence_score) > 5) {
        return b.confidence_score - a.confidence_score;
      }

      // Secondary: Professional expertise
      return (
        b.optimization_factors.professional_expertise_match
        - a.optimization_factors.professional_expertise_match
      );
    });
  }

  /**
   * Calculate advanced confidence score using weighted factors
   * @private
   */
  private calculateAdvancedConfidenceScore(
    slot: TimeSlot,
    professional: HealthcareProfessional,
    _treatment: AestheticTreatment,
    request: z.infer<typeof AppointmentRequestSchema>,
  ): number {
    const weights = {
      time_preference: 0.25, // How well it matches patient's preferred time
      professional_expertise: 0.3, // Professional's competency with treatment
      availability_certainty: 0.2, // How certain we are about availability
      resource_optimization: 0.15, // Clinic resource utilization
      flexibility_bonus: 0.1, // Patient flexibility bonus
    };

    const scores = {
      time_preference: this.calculateTimePreferenceScore(slot, request),
      professional_expertise: professional.efficiency_rating * 20,
      availability_certainty: 85, // Base certainty, could be dynamic
      resource_optimization: this.calculateResourceUtilization(slot),
      flexibility_bonus: Math.min(request.flexibility_hours * 2, 20),
    };

    // ✅ Weighted average calculation
    const weightedScore = Object.entries(weights).reduce(
      (total, [factor, weight]) => {
        return total + scores[factor as keyof typeof scores] * weight;
      },
      0,
    );

    // ✅ Priority boost for urgent appointments
    const priorityMultiplier = request.priority === "urgent" ? 1.1 : 1;

    return Math.min(Math.round(weightedScore * priorityMultiplier), 100);
  }

  /**
   * Get available time slots for a date range and treatment
   * @private
   */
  private async getAvailableSlots(
    startDate: Date,
    endDate: Date,
    _treatmentId: string,
  ): Promise<TimeSlot[]> {
    // ✅ This would integrate with your actual database/calendar system
    // For now, returning mock data for demonstration
    const mockSlots: TimeSlot[] = [];

    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      // Generate morning slots (9 AM - 12 PM)
      for (let hour = 9; hour < 12; hour++) {
        mockSlots.push({
          start: new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            currentDate.getDate(),
            hour,
            0,
          ),
          end: new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            currentDate.getDate(),
            hour + 1,
            30,
          ),
          available: Math.random() > 0.3, // 70% availability rate
          professional_id: "prof-1",
          room_id: "room-1",
        });
      }

      // Generate afternoon slots (2 PM - 6 PM)
      for (let hour = 14; hour < 18; hour++) {
        mockSlots.push({
          start: new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            currentDate.getDate(),
            hour,
            0,
          ),
          end: new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            currentDate.getDate(),
            hour + 1,
            30,
          ),
          available: Math.random() > 0.4, // 60% availability rate
          professional_id: "prof-2",
          room_id: "room-2",
        });
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return mockSlots.filter((slot) => slot.available);
  } /**
   * Helper calculation methods
   * @private
   */

  private calculateTimePreferenceScore(
    slot: TimeSlot,
    request: z.infer<typeof AppointmentRequestSchema>,
  ): number {
    const preferredStart = request.preferred_date_range.start;
    const { start: slotTime } = slot;

    // Calculate how close the slot is to preferred time
    const timeDiffHours = Math.abs(slotTime.getTime() - preferredStart.getTime())
      / (1000 * 60 * 60);

    // Score decreases with time difference, max 100 for perfect match
    return Math.max(0, 100 - timeDiffHours * 2);
  }

  private calculateTimeEfficiency(slot: TimeSlot): number {
    const hour = slot.start.getHours();

    // Peak efficiency hours: 9-11 AM and 2-4 PM
    if ((hour >= 9 && hour <= 11) || (hour >= 14 && hour <= 16)) {
      return 90;
    }

    // Good hours: 8-9 AM, 11-12 PM, 4-6 PM
    if (
      (hour >= 8 && hour < 9)
      || (hour > 11 && hour < 14)
      || (hour > 16 && hour <= 18)
    ) {
      return 75;
    }

    return 60; // Other hours
  }

  private calculateResourceUtilization(slot: TimeSlot): number {
    // ✅ This would calculate actual clinic resource utilization
    // For now, using time-based heuristic
    const dayOfWeek = slot.start.getDay();

    // Weekdays have higher utilization
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      return 80;
    }

    return 60; // Weekends
  }

  private calculateAdvancedPreferenceMatch(
    slot: TimeSlot,
    request: z.infer<typeof AppointmentRequestSchema>,
  ): number {
    let score = this.calculateTimePreferenceScore(slot, request);

    // ✅ Boost score if specific professional requested and matched
    if (
      request.preferred_professional_id
      && slot.professional_id === request.preferred_professional_id
    ) {
      score += 20;
    }

    return Math.min(score, 100);
  }

  private calculatePreferenceMatch(_slot: TimeSlot): number {
    // Base preference matching - could be enhanced with patient history
    return 70;
  }

  private calculateExpertiseMatch(
    professional: HealthcareProfessional,
    treatment: AestheticTreatment,
  ): number {
    // Check if professional's specializations match treatment requirements
    const matchingSpecializations = professional.specializations.filter(
      (spec) => treatment.professional_requirements.includes(spec),
    );

    const matchRatio = matchingSpecializations.length
      / treatment.professional_requirements.length;
    return Math.round(matchRatio * 100);
  }

  private calculateEstimatedSatisfaction(
    slot: TimeSlot,
    professional: HealthcareProfessional,
  ): number {
    const timeScore = this.calculateTimeEfficiency(slot);
    const professionalScore = professional.efficiency_rating * 20;

    return Math.round((timeScore + professionalScore) / 2);
  }

  private checkProfessionalCompetency(
    professional: HealthcareProfessional,
    treatment: AestheticTreatment,
  ): boolean {
    // ✅ Check if professional has required certifications/specializations
    return treatment.professional_requirements.every((requirement) =>
      professional.specializations.includes(requirement)
    );
  }

  /**
   * Initialize cache with default data
   * @private
   */
  private initializeCache(): void {
    // ✅ Initialize with sample professionals - this would load from database
    this.professionals.set("prof-1", {
      id: "prof-1",
      name: "Dr. Ana Silva",
      specializations: ["facial_aesthetics", "botox", "dermal_fillers"],
      availability: [],
      efficiency_rating: 4.8,
    });

    this.professionals.set("prof-2", {
      id: "prof-2",
      name: "Dr. Carlos Santos",
      specializations: ["body_aesthetics", "laser_therapy", "skin_treatments"],
      availability: [],
      efficiency_rating: 4.6,
    });

    // ✅ Initialize with sample treatments - this would load from database
    this.treatments.set("default", {
      id: "default",
      name: "Tratamento Facial",
      duration_minutes: 90,
      required_equipment: ["laser_machine", "sterilization_unit"],
      preparation_time: 15,
      recovery_time: 30,
      professional_requirements: ["facial_aesthetics"],
    });
  }
}

// ✅ Export singleton instance
export const aiSchedulingEngine = new AISchedulingEngine();

/**
 * Healthcare-compliant scheduling utilities
 */
export class SchedulingUtils {
  /**
   * Validate appointment timing against Brazilian healthcare regulations
   */
  static validateHealthcareSchedulingCompliance(appointment: {
    start: Date;
    end: Date;
    treatment_type: string;
  }): {
    isValid: boolean;
    violations: string[];
  } {
    const violations: string[] = [];

    // ✅ Check business hours (8 AM - 8 PM)
    const hour = appointment.start.getHours();
    if (hour < 8 || hour > 20) {
      violations.push("Agendamento fora do horário de funcionamento (8h-20h)");
    }

    // ✅ Check minimum treatment duration
    const durationMs = appointment.end.getTime() - appointment.start.getTime();
    const durationMinutes = durationMs / (1000 * 60);

    if (durationMinutes < 30) {
      violations.push("Duração mínima do tratamento deve ser de 30 minutos");
    }

    // ✅ Check weekend restrictions for certain treatments
    const dayOfWeek = appointment.start.getDay();
    const restrictedWeekendTreatments = ["surgery", "laser_intensive"];

    if (
      (dayOfWeek === 0 || dayOfWeek === 6)
      && restrictedWeekendTreatments.includes(appointment.treatment_type)
    ) {
      violations.push("Tratamento não permitido em fins de semana");
    }

    return {
      isValid: violations.length === 0,
      violations,
    };
  }
}
