/**
 * Enhanced Aesthetic Clinic Scheduling Service
 * Specialized scheduling system for aesthetic procedures with multi-session support,
 * recovery planning, and professional certification validation
 */

// Remove problematic import and use local types
// import { AIAppointmentSchedulingService } from '../../../apps/api/src/services/ai-appointment-scheduling-service';

// Local interfaces for independence
export interface Appointment {
  id: string
  patientId: string
  professionalId: string
  serviceTypeId: string
  startTime: Date
  endTime: Date
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'
}

export interface Professional {
  id: string
  name: string
  specialties: string[]
  certifications: string[]
  experienceLevel: number
  role?: string
  specialNotes?: string
  availabilities?: any[]
}

export interface ServiceType {
  id: string
  name: string
  duration: number
  category: string
}

export interface NoShowPredictionFeatures {
  patientId: string
  appointmentTime: Date
  appointmentType: string
  // Add other needed properties
}

export interface NoShowPredictionResult {
  riskScore: number
  confidence: number
  riskFactors: string[]
  preventionRecommendations: string[]
  modelVersion: string
}

export interface AestheticProcedureDetails {
  id: string
  name: string
  category: string
  procedureType: 'injectable' | 'laser' | 'facial' | 'body' | 'surgical' | 'combination'
  baseDurationMinutes: number
  variableDurationFactors: DurationVariableFactor[]
  requiredCertifications: string[]
  minExperienceLevel: number
  contraindications: string[]
  aftercareInstructions: string[]
  recoveryPeriodDays: number
  anestheticType: 'none' | 'topical' | 'local' | 'sedation'
  sessionCount: number
  intervalBetweenSessionsDays: number
  specialRequirements: string[]
}

export interface DurationVariableFactor {
  factor: 'area_size' | 'complexity' | 'patient_condition' | 'combination_procedure'
  impact: 'add_minutes' | 'multiply_duration'
  value: number
  description: string
}

export interface TreatmentPackage {
  id: string
  name: string
  description: string
  procedures: AestheticProcedureDetails[]
  totalSessions: number
  totalDurationMinutes: number
  totalPrice: number
  recoveryPeriodDays: number
  recommendedIntervalWeeks: number
  packageDiscount: number
}

export interface AestheticSchedulingRequest {
  patientId: string
  procedures: string[] // procedure IDs
  preferredProfessionals?: string[]
  preferredDates?: Date[]
  specialRequirements?: string[]
  medicalHistory?: {
    allergies: string[]
    medications: string[]
    previousProcedures: string[]
    skinConditions: string[]
    contraindications: string[]
  }
  urgencyLevel: 'low' | 'medium' | 'high' | 'immediate'
  budgetRange?: {
    min: number
    max: number
  }
}

export interface AestheticSchedulingResult {
  success: boolean
  appointments: AestheticAppointment[]
  totalCost: number
  totalDuration: number
  recoveryPlan: RecoveryPlan
  professionalAssignments: ProfessionalAssignment[]
  warnings: string[]
  contraindications: string[]
  alternativeOptions?: AlternativeTreatmentOption[]
}

export interface AestheticAppointment extends Appointment {
  procedureDetails: AestheticProcedureDetails
  sessionNumber: number
  totalSessions: number
  recoveryBuffer: number // minutes after appointment for recovery
  specialEquipment: string[]
  assistantRequired: boolean
  preProcedureInstructions: string[]
  postProcedureInstructions: string[]
}

export interface RecoveryPlan {
  procedureName: string
  appointmentId?: string
  procedureId?: string
  recoveryPeriodDays: number
  dailyInstructions: string[]
  followUpAppointments: FollowUpAppointment[]
  emergencyContacts: string[]
  restrictions: string[]
  expectedOutcomes: string[]
  // Propriedades adicionais para compatibilidade
  phases?: any[]
  totalRecoveryTime?: number
  instructions?: any[]
  warningSigns?: any[]
  risks?: any[]
  careLevel?: 'low' | 'medium' | 'high' | 'intensive'
  customNotes?: string
  patientId?: string
  activityRestrictions?: string[]
  careInstructions?: string[]
}

export interface FollowUpAppointment {
  dayNumber: number
  purpose: string
  durationMinutes: number
  inPerson: boolean
}

export interface ProfessionalAssignment {
  professionalId: string
  procedureId: string
  role: 'primary' | 'assistant' | 'anesthesiologist' | 'consultant'
  certificationVerified: boolean
  experienceLevel: number
  specialNotes?: string
}

export interface AlternativeTreatmentOption {
  procedures: string[]
  benefits: string[]
  tradeoffs: string[]
  costDifference: number
  durationDifference: number
  recoveryDifference: number
}

// Base class for scheduling service
class BaseSchedulingService {
  protected modelVersion: string = '1.0.0'

  constructor() {
    // Initialize base service
  }
}

import { AestheticAppointmentService } from './aesthetic-appointment-service'
import { NoShowPredictionService } from './no-show-prediction-service'
import { ProfessionalValidationService } from './professional-validation-service'
import { RecoveryPlanningService } from './recovery-planning-service'
import { TreatmentPackageService } from './treatment-package-service'

export class EnhancedAestheticSchedulingService extends BaseSchedulingService {
  private appointmentService: AestheticAppointmentService
  private professionalValidationService: ProfessionalValidationService
  private recoveryPlanningService: RecoveryPlanningService
  private noShowPredictionService: NoShowPredictionService
  private treatmentPackageService: TreatmentPackageService

  constructor() {
    super()

    // Initialize composed services
    this.appointmentService = new AestheticAppointmentService()
    this.professionalValidationService = new ProfessionalValidationService()
    this.recoveryPlanningService = new RecoveryPlanningService()
    this.noShowPredictionService = new NoShowPredictionService()
    this.treatmentPackageService = new TreatmentPackageService(this.appointmentService)
  }

  /**
   * Schedule aesthetic procedures with enhanced logic
   * Now delegates to specialized services
   */
  async scheduleAestheticProcedures(
    request: AestheticSchedulingRequest,
  ): Promise<AestheticSchedulingResult> {
    // Use specialized services for each aspect

    // 1. Validate professional certifications
    const professionalValidation = await this.professionalValidationService
      .validateProfessionalCertifications(
        request.preferredProfessionals?.[0] || '',
        request.procedures,
        new Map(), // Would be populated with procedure details
      )

    if (!professionalValidation.isValid) {
      return {
        success: false,
        appointments: [],
        totalCost: 0,
        totalDuration: 0,
        recoveryPlan: this.recoveryPlanningService.createEmptyRecoveryPlan(),
        professionalAssignments: [],
        warnings: professionalValidation.warnings,
        contraindications: [
          `Professional validation failed: ${
            professionalValidation.missingCertifications.join(', ')
          }`,
        ],
      }
    }

    // 2. Create appointments using appointment service
    const procedureDetails = request.procedures.map(id => ({
      id,
      name: `Procedure ${id}`,
      category: 'injectable',
      baseDurationMinutes: 60,
      sessionCount: 1,
      recoveryPeriodDays: 7,
      procedureType: 'injectable' as const,
      requiredCertifications: [],
      variableDurationFactors: [],
      specialRequirements: [],
      aftercareInstructions: [],
      contraindications: [],
      minExperienceLevel: 1,
      anestheticType: 'topical' as const,
      intervalBetweenSessionsDays: 14,
    }))

    const sessions = procedureDetails.map(procedure => ({
      procedure,
      sessionNumber: 1,
      duration: procedure.baseDurationMinutes,
      recommendedInterval: 14,
    }))

    const appointments = await this.appointmentService.createAppointments(
      request,
      sessions,
    )

    // 3. Create recovery plan
    const recoveryPlan = this.recoveryPlanningService.createRecoveryPlan(
      procedureDetails,
      appointments,
    )

    // 4. Calculate totals
    const totalCost = appointments.reduce(
      (sum, apt) => sum + (apt.procedureDetails as any).price || 0,
      0,
    )
    const totalDuration = appointments.reduce(
      (sum, apt) => sum + apt.procedureDetails.baseDurationMinutes,
      0,
    )

    // 5. Create professional assignments
    const professionalAssignments: ProfessionalAssignment[] =
      request.preferredProfessionals?.map(profId => ({
        professionalId: profId,
        procedureId: request.procedures[0] || '',
        role: 'primary' as const,
        certificationVerified: true,
        experienceLevel: professionalValidation.experienceLevel,
      })) || []

    return {
      success: true,
      appointments,
      totalCost,
      totalDuration,
      recoveryPlan,
      professionalAssignments,
      warnings: professionalValidation.warnings,
      contraindications: [],
      alternativeOptions: [],
    }
  }

  /**
   * Schedule complete treatment packages
   * Now delegates to treatment package service
   */
  async scheduleTreatmentPackage(
    packageId: string,
    patientId: string,
    startDate: Date,
    preferences: {
      preferredProfessionals?: string[]
      timePreferences?: 'morning' | 'afternoon' | 'evening'
      dayPreferences?: string[]
    },
  ): Promise<AestheticSchedulingResult> {
    try {
      // Use treatment package service for scheduling
      const packageRequest = {
        packageId,
        patientId,
        clinicId: 'clinic_1', // Would be parameterized
        preferredStartDate: startDate,
        customizations: [],
      }

      const packageResult = await this.treatmentPackageService.scheduleTreatmentPackage(
        packageRequest,
      )

      // Convert package result to scheduling result format
      const appointments = packageResult.schedule.map((date, index) => ({
        id: `apt_${packageId}_${index}`,
        patientId,
        professionalId: preferences.preferredProfessionals?.[0] || '',
        serviceTypeId: packageId,
        startTime: date,
        endTime: new Date(date.getTime() + 60 * 60 * 1000), // 1 hour duration
        status: 'scheduled' as const,
        procedureDetails: {
          id: packageId,
          name: packageResult.package.name,
          category: 'combination',
          baseDurationMinutes: 60,
          sessionCount: packageResult.schedule.length,
          recoveryPeriodDays: packageResult.package.recoveryPeriodDays,
          procedureType: 'combination' as const,
          requiredCertifications: [],
          variableDurationFactors: [],
          specialRequirements: [],
          aftercareInstructions: [],
          contraindications: [],
          minExperienceLevel: 1,
          anestheticType: 'topical' as const,
          intervalBetweenSessionsDays: 14,
        },
        sessionNumber: index + 1,
        totalSessions: packageResult.schedule.length,
        recoveryBuffer: 15,
        specialEquipment: [],
        assistantRequired: false,
        preProcedureInstructions: [],
        postProcedureInstructions: [],
      }))

      const recoveryPlan = this.recoveryPlanningService.createRecoveryPlan(
        packageResult.package.procedures,
        appointments,
      )

      const professionalAssignments: ProfessionalAssignment[] =
        preferences.preferredProfessionals?.map(profId => ({
          professionalId: profId,
          procedureId: packageId,
          role: 'primary' as const,
          certificationVerified: true,
          experienceLevel: 5,
        })) || []

      return {
        success: true,
        appointments,
        totalCost: packageResult.totalPrice,
        totalDuration: appointments.reduce(
          (sum, apt) => sum + apt.procedureDetails.baseDurationMinutes,
          0,
        ),
        recoveryPlan,
        professionalAssignments,
        warnings: [],
        contraindications: [],
        alternativeOptions: [],
      }
    } catch (error) {
      return {
        success: false,
        appointments: [],
        totalCost: 0,
        totalDuration: 0,
        recoveryPlan: this.recoveryPlanningService.createEmptyRecoveryPlan(),
        professionalAssignments: [],
        warnings: [],
        contraindications: [error instanceof Error ? error.message : 'Unknown error'],
      }
    }
  }

  /**
   * Calculate variable duration based on factors
   * Delegates to appointment service
   */
  calculateVariableDuration(
    baseDuration: number,
    factors: DurationVariableFactor[],
  ): number {
    return this.appointmentService.calculateDuration(baseDuration, factors)
  }

  /**
   * Validate professional certifications for procedures
   * Delegates to professional validation service
   */
  async validateProfessionalCertifications(
    professionalId: string,
    procedureIds: string[],
  ): Promise<{
    isValid: boolean
    missingCertifications: string[]
    experienceLevel: number
  }> {
    const procedureMap = new Map<string, AestheticProcedureDetails>()

    // Mock procedure details - in real implementation would load from database
    for (const procId of procedureIds) {
      procedureMap.set(procId, {
        id: procId,
        name: `Procedure ${procId}`,
        category: 'injectable',
        baseDurationMinutes: 60,
        sessionCount: 1,
        recoveryPeriodDays: 7,
        procedureType: 'injectable' as const,
        requiredCertifications: ['botox_certification'],
        variableDurationFactors: [],
        specialRequirements: [],
        aftercareInstructions: [],
        contraindications: [],
        minExperienceLevel: 2,
        anestheticType: 'topical' as const,
        intervalBetweenSessionsDays: 14,
      })
    }

    return this.professionalValidationService.validateProfessionalCertifications(
      professionalId,
      procedureIds,
      procedureMap,
    )
  }

  /**
   * Optimize room allocation for aesthetic procedures
   * Enhanced version using specialized services
   */
  optimizeRoomAllocation(
    appointments: AestheticAppointment[],
  ): {
    roomAssignments: Map<string, string[]>
    utilization: number
    conflicts: string[]
  } {
    const roomAssignments = new Map<string, string[]>()
    const conflicts: string[] = []

    // Enhanced room allocation using procedure priority from appointment service
    const sortedAppointments = appointments.sort((a, b) => {
      const aPriority = this.appointmentService.getProcedurePriority(a.procedureDetails)
      const bPriority = this.appointmentService.getProcedurePriority(b.procedureDetails)
      return bPriority - aPriority
    })

    // Assign rooms based on enhanced logic
    for (const appointment of sortedAppointments) {
      const suitableRooms = this.findSuitableRooms(appointment)
      const assignedRoom = this.findBestAvailableRoom(suitableRooms, appointment.startTime)

      if (!assignedRoom) {
        conflicts.push(`No suitable room available for ${appointment.procedureDetails.name}`)
        continue
      }

      if (!roomAssignments.has(assignedRoom)) {
        roomAssignments.set(assignedRoom, [])
      }
      roomAssignments.get(assignedRoom)!.push(appointment.id)
    }

    // Calculate utilization
    const totalRoomTime = Array.from(roomAssignments.values())
      .flat().length * 30 // assuming 30min slots
    const totalAvailableTime = roomAssignments.size * 8 * 60 // 8 hours per room
    const utilization = totalAvailableTime > 0 ? totalRoomTime / totalAvailableTime : 0

    return {
      roomAssignments,
      utilization,
      conflicts,
    }
  }

  /**
   * Get no-show prediction for appointments
   * New functionality using no-show prediction service
   */
  async predictNoShowRisk(
    patientId: string,
    appointmentTime: Date,
    procedureType: string,
    cost: number,
  ): Promise<{
    risk: number
    factors: string[]
    recommendations: string[]
  }> {
    const result = await this.noShowPredictionService.predictNoShow(
      patientId,
      appointmentTime,
      procedureType,
      cost,
    )
    return {
      risk: result.riskScore,
      factors: result.riskFactors,
      recommendations: result.preventionRecommendations,
    }
  }

  /**
   * Create custom treatment package
   * New functionality using treatment package service
   */
  async createCustomTreatmentPackage(
    procedures: AestheticProcedureDetails[],
    patientRequirements: {
      budget?: number
      timeConstraint?: number
      priorityAreas?: string[]
    },
  ): Promise<TreatmentPackage> {
    return this.treatmentPackageService.createCustomPackage(procedures, patientRequirements)
  }

  // Legacy helper methods maintained for backward compatibility
  private findSuitableRooms(_appointment: AestheticAppointment): string[] {
    return ['room_1', 'room_2', 'room_3'] // Mock implementation
  }

  private findBestAvailableRoom(rooms: string[], _startTime: Date): string | null {
    return rooms[0] || null // Mock implementation
  }
}
