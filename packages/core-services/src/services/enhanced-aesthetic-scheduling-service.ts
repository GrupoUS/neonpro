/**
 * Enhanced Aesthetic Clinic Scheduling Service
 * Specialized scheduling system for aesthetic procedures with multi-session support,
 * recovery planning, and professional certification validation
 */

import { AIAppointmentSchedulingService } from '../../../apps/api/src/services/ai-appointment-scheduling-service';
import type { 
  Appointment, 
  Professional, 
  ServiceType,
  NoShowPredictionFeatures,
  NoShowPredictionResult 
} from '../../../apps/api/src/services/ai-appointment-scheduling-service';

export interface AestheticProcedureDetails {
  id: string;
  name: string;
  category: string;
  procedureType: 'injectable' | 'laser' | 'facial' | 'body' | 'surgical' | 'combination';
  baseDurationMinutes: number;
  variableDurationFactors: DurationVariableFactor[];
  requiredCertifications: string[];
  minExperienceLevel: number;
  contraindications: string[];
  aftercareInstructions: string[];
  recoveryPeriodDays: number;
  anestheticType: 'none' | 'topical' | 'local' | 'sedation';
  sessionCount: number;
  intervalBetweenSessionsDays: number;
  specialRequirements: string[];
}

export interface DurationVariableFactor {
  factor: 'area_size' | 'complexity' | 'patient_condition' | 'combination_procedure';
  impact: 'add_minutes' | 'multiply_duration';
  value: number;
  description: string;
}

export interface TreatmentPackage {
  id: string;
  name: string;
  description: string;
  procedures: AestheticProcedureDetails[];
  totalSessions: number;
  totalDurationMinutes: number;
  totalPrice: number;
  recoveryPeriodDays: number;
  recommendedIntervalWeeks: number;
  packageDiscount: number;
}

export interface AestheticSchedulingRequest {
  patientId: string;
  procedures: string[]; // procedure IDs
  preferredProfessionals?: string[];
  preferredDates?: Date[];
  specialRequirements?: string[];
  medicalHistory?: {
    allergies: string[];
    medications: string[];
    previousProcedures: string[];
    skinConditions: string[];
    contraindications: string[];
  };
  urgencyLevel: 'low' | 'medium' | 'high' | 'immediate';
  budgetRange?: {
    min: number;
    max: number;
  };
}

export interface AestheticSchedulingResult {
  success: boolean;
  appointments: AestheticAppointment[];
  totalCost: number;
  totalDuration: number;
  recoveryPlan: RecoveryPlan;
  professionalAssignments: ProfessionalAssignment[];
  warnings: string[];
  contraindications: string[];
  alternativeOptions?: AlternativeTreatmentOption[];
}

export interface AestheticAppointment extends Appointment {
  procedureDetails: AestheticProcedureDetails;
  sessionNumber: number;
  totalSessions: number;
  recoveryBuffer: number; // minutes after appointment for recovery
  specialEquipment: string[];
  assistantRequired: boolean;
  preProcedureInstructions: string[];
  postProcedureInstructions: string[];
}

export interface RecoveryPlan {
  procedureName: string;
  recoveryPeriodDays: number;
  dailyInstructions: string[];
  followUpAppointments: FollowUpAppointment[];
  emergencyContacts: string[];
  restrictions: string[];
  expectedOutcomes: string[];
}

export interface FollowUpAppointment {
  dayNumber: number;
  purpose: string;
  durationMinutes: number;
  inPerson: boolean;
}

export interface ProfessionalAssignment {
  professionalId: string;
  procedureId: string;
  role: 'primary' | 'assistant' | 'anesthesiologist' | 'consultant';
  certificationVerified: boolean;
  experienceLevel: number;
  specialNotes?: string;
}

export interface AlternativeTreatmentOption {
  procedures: string[];
  benefits: string[];
  tradeoffs: string[];
  costDifference: number;
  durationDifference: number;
  recoveryDifference: number;
}

export class EnhancedAestheticSchedulingService extends AIAppointmentSchedulingService {
  private aestheticProcedures: Map<string, AestheticProcedureDetails> = new Map();
  private treatmentPackages: Map<string, TreatmentPackage> = new Map();

  constructor() {
    super();
    this.initializeAestheticProcedures();
    this.initializeTreatmentPackages();
  }

  /**
   * Schedule aesthetic procedures with enhanced logic
   */
  async scheduleAestheticProcedures(
    request: AestheticSchedulingRequest
  ): Promise<AestheticSchedulingResult> {
    // Validate medical history and contraindications
    const validation = this.validateMedicalContraindications(request);
    if (!validation.isValid) {
      return {
        success: false,
        appointments: [],
        totalCost: 0,
        totalDuration: 0,
        recoveryPlan: this.createEmptyRecoveryPlan(),
        professionalAssignments: [],
        warnings: validation.warnings,
        contraindications: validation.contraindications
      };
    }

    // Get procedure details
    const procedures = request.procedures.map(id => 
      this.aestheticProcedures.get(id)
    ).filter(Boolean) as AestheticProcedureDetails[];

    if (procedures.length !== request.procedures.length) {
      return {
        success: false,
        appointments: [],
        totalCost: 0,
        totalDuration: 0,
        recoveryPlan: this.createEmptyRecoveryPlan(),
        professionalAssignments: [],
        warnings: ['Some selected procedures are not available'],
        contraindications: []
      };
    }

    // Calculate treatment schedule
    const treatmentSchedule = this.calculateTreatmentSchedule(procedures, request);

    // Assign professionals with certification validation
    const professionalAssignments = await this.assignProfessionals(
      procedures,
      request.preferredProfessionals
    );

    // Check availability and create appointments
    const appointments = await this.createAestheticAppointments(
      treatmentSchedule,
      professionalAssignments,
      request
    );

    // Calculate total cost and duration
    const totalCost = this.calculateTotalCost(procedures, appointments);
    const totalDuration = this.calculateTotalDuration(appointments);

    // Create recovery plan
    const recoveryPlan = this.createRecoveryPlan(procedures, appointments);

    return {
      success: true,
      appointments,
      totalCost,
      totalDuration,
      recoveryPlan,
      professionalAssignments,
      warnings: validation.warnings,
      contraindications: validation.contraindications,
      alternativeOptions: this.generateAlternativeOptions(request, procedures)
    };
  }

  /**
   * Schedule complete treatment packages
   */
  async scheduleTreatmentPackage(
    packageId: string,
    patientId: string,
    startDate: Date,
    preferences: {
      preferredProfessionals?: string[];
      timePreferences?: 'morning' | 'afternoon' | 'evening';
      dayPreferences?: string[];
    }
  ): Promise<AestheticSchedulingResult> {
    const treatmentPackage = this.treatmentPackages.get(packageId);
    if (!treatmentPackage) {
      throw new Error('Treatment package not found');
    }

    const request: AestheticSchedulingRequest = {
      patientId,
      procedures: treatmentPackage.procedures.map(p => p.id),
      preferredProfessionals: preferences.preferredProfessionals,
      preferredDates: this.generatePackageDates(startDate, treatmentPackage),
      urgencyLevel: 'medium'
    };

    return this.scheduleAestheticProcedures(request);
  }

  /**
   * Calculate variable duration based on factors
   */
  calculateVariableDuration(
    baseDuration: number,
    factors: DurationVariableFactor[]
  ): number {
    let totalDuration = baseDuration;
    
    for (const factor of factors) {
      if (factor.impact === 'add_minutes') {
        totalDuration += factor.value;
      } else if (factor.impact === 'multiply_duration') {
        totalDuration = Math.round(totalDuration * factor.value);
      }
    }

    return totalDuration;
  }

  /**
   * Validate professional certifications for procedures
   */
  async validateProfessionalCertifications(
    professionalId: string,
    procedureIds: string[]
  ): Promise<{
    isValid: boolean;
    missingCertifications: string[];
    experienceLevel: number;
  }> {
    // This would integrate with the professional database
    // For now, we'll use a mock validation
    const professional = await this.getProfessionalDetails(professionalId);
    
    const missingCertifications: string[] = [];
    let isValid = true;
    let experienceLevel = professional.experienceLevel || 0;

    for (const procedureId of procedureIds) {
      const procedure = this.aestheticProcedures.get(procedureId);
      if (!procedure) continue;

      // Check required certifications
      for (const cert of procedure.requiredCertifications) {
        if (!professional.certifications?.includes(cert)) {
          missingCertifications.push(`${procedure.name}: ${cert}`);
          isValid = false;
        }
      }

      // Check experience level
      if (experienceLevel < procedure.minExperienceLevel) {
        missingCertifications.push(
          `${procedure.name}: Insufficient experience (requires ${procedure.minExperienceLevel}+ years)`
        );
        isValid = false;
      }
    }

    return {
      isValid,
      missingCertifications,
      experienceLevel
    };
  }

  /**
   * Optimize room allocation for aesthetic procedures
   */
  optimizeRoomAllocation(
    appointments: AestheticAppointment[]
  ): {
    roomAssignments: Map<string, string[]>;
    utilization: number;
    conflicts: string[];
  } {
    const roomAssignments = new Map<string, string[]>();
    const conflicts: string[] = [];
    
    // Group appointments by special requirements
    const appointmentsByRequirements = appointments.filter(apt => 
      apt.procedureDetails.specialRequirements.length > 0
    );

    // Sort by priority and special requirements
    const sortedAppointments = appointments.sort((a, b) => {
      const aPriority = this.getProcedurePriority(a.procedureDetails);
      const bPriority = this.getProcedurePriority(b.procedureDetails);
      return bPriority - aPriority;
    });

    // Assign rooms based on requirements and availability
    for (const appointment of sortedAppointments) {
      const suitableRooms = this.findSuitableRooms(appointment);
      const assignedRoom = this.findBestAvailableRoom(suitableRooms, appointment.startTime);
      
      if (!assignedRoom) {
        conflicts.push(`No suitable room available for ${appointment.procedureDetails.name}`);
        continue;
      }

      if (!roomAssignments.has(assignedRoom)) {
        roomAssignments.set(assignedRoom, []);
      }
      roomAssignments.get(assignedRoom)!.push(appointment.id);
    }

    // Calculate utilization
    const totalRoomTime = Array.from(roomAssignments.values())
      .flat().length * 30; // assuming 30min slots
    const totalAvailableTime = roomAssignments.size * 8 * 60; // 8 hours per room
    const utilization = totalAvailableTime > 0 ? totalRoomTime / totalAvailableTime : 0;

    return {
      roomAssignments,
      utilization,
      conflicts
    };
  }

  // Private helper methods
  private validateMedicalContraindications(request: AestheticSchedulingRequest): {
    isValid: boolean;
    warnings: string[];
    contraindications: string[];
  } {
    const warnings: string[] = [];
    const contraindications: string[] = [];
    let isValid = true;

    if (!request.medicalHistory) {
      return { isValid: true, warnings: [], contraindications: [] };
    }

    for (const procedureId of request.procedures) {
      const procedure = this.aestheticProcedures.get(procedureId);
      if (!procedure) continue;

      // Check for contraindications
      for (const contraindication of procedure.contraindications) {
        if (request.medicalHistory.contraindications.includes(contraindication)) {
          contraindications.push(
            `${procedure.name}: Contraindicated due to ${contraindication}`
          );
          isValid = false;
        }
      }

      // Check for pregnancy (absolute contraindication for many procedures)
      if (request.medicalHistory.contraindications.includes('gravidez')) {
        const pregnancyContraindicatedProcedures = [
          'injectable', 'laser', 'body', 'surgical'
        ];
        if (pregnancyContraindicatedProcedures.includes(procedure.procedureType)) {
          contraindications.push(
            `${procedure.name}: Contraindicated during pregnancy`
          );
          isValid = false;
        }
      }

      // Check for allergies
      if (request.medicalHistory.allergies.length > 0) {
        warnings.push(
          `Review allergies for ${procedure.name}: ${request.medicalHistory.allergies.join(', ')}`
        );
      }
    }

    return { isValid, warnings, contraindications };
  }

  private calculateTreatmentSchedule(
    procedures: AestheticProcedureDetails[],
    request: AestheticSchedulingRequest
  ): {
    sessions: Array<{
      procedure: AestheticProcedureDetails;
      sessionNumber: number;
      duration: number;
      recommendedInterval: number;
    }>;
    totalDuration: number;
    totalRecoveryDays: number;
  } {
    const sessions: Array<{
      procedure: AestheticProcedureDetails;
      sessionNumber: number;
      duration: number;
      recommendedInterval: number;
    }> = [];

    let totalDuration = 0;
    let totalRecoveryDays = 0;

    for (const procedure of procedures) {
      for (let session = 1; session <= procedure.sessionCount; session++) {
        const duration = this.calculateVariableDuration(
          procedure.baseDurationMinutes,
          procedure.variableDurationFactors
        );

        sessions.push({
          procedure,
          sessionNumber: session,
          duration,
          recommendedInterval: procedure.intervalBetweenSessionsDays
        });

        totalDuration += duration;
        totalRecoveryDays += procedure.recoveryPeriodDays;
      }
    }

    return { sessions, totalDuration, totalRecoveryDays };
  }

  private async assignProfessionals(
    procedures: AestheticProcedureDetails[],
    preferredProfessionals?: string[]
  ): Promise<ProfessionalAssignment[]> {
    const assignments: ProfessionalAssignment[] = [];

    for (const procedure of procedures) {
      // Find suitable professionals
      const suitableProfessionals = await this.findSuitableProfessionals(
        procedure,
        preferredProfessionals
      );

      if (suitableProfessionals.length > 0) {
        const primary = suitableProfessionals[0];
        assignments.push({
          professionalId: primary.id,
          procedureId: procedure.id,
          role: 'primary',
          certificationVerified: true,
          experienceLevel: primary.experienceLevel,
          specialNotes: primary.specialNotes
        });

        // Assign assistant if required
        if (procedure.specialRequirements.includes('assistant_required')) {
          const assistant = suitableProfessionals.find(p => p.role === 'assistant');
          if (assistant) {
            assignments.push({
              professionalId: assistant.id,
              procedureId: procedure.id,
              role: 'assistant',
              certificationVerified: true,
              experienceLevel: assistant.experienceLevel
            });
          }
        }
      }
    }

    return assignments;
  }

  private async createAestheticAppointments(
    treatmentSchedule: any,
    professionalAssignments: ProfessionalAssignment[],
    request: AestheticSchedulingRequest
  ): Promise<AestheticAppointment[]> {
    const appointments: AestheticAppointment[] = [];

    // This would integrate with the base AI scheduling service
    // For now, we'll create mock appointments with aesthetic-specific details
    for (const session of treatmentSchedule.sessions) {
      const appointment: AestheticAppointment = {
        id: `apt_${Date.now()}_${Math.random()}`,
        patientId: request.patientId,
        professionalId: professionalAssignments.find(a => 
          a.procedureId === session.procedure.id && a.role === 'primary'
        )?.professionalId || '',
        serviceTypeId: session.procedure.id,
        startTime: new Date(), // Would be calculated based on availability
        endTime: new Date(), // Would be calculated based on duration
        status: 'scheduled',
        procedureDetails: session.procedure,
        sessionNumber: session.sessionNumber,
        totalSessions: session.procedure.sessionCount,
        recoveryBuffer: this.calculateRecoveryBuffer(session.procedure),
        specialEquipment: session.procedure.specialRequirements,
        assistantRequired: session.procedure.specialRequirements.includes('assistant_required'),
        preProcedureInstructions: session.procedure.aftercareInstructions,
        postProcedureInstructions: session.procedure.aftercareInstructions
      };

      appointments.push(appointment);
    }

    return appointments;
  }

  private calculateTotalCost(procedures: AestheticProcedureDetails[], appointments: AestheticAppointment[]): number {
    // This would integrate with pricing system
    return procedures.reduce((total, procedure) => total + (procedure as any).price || 0, 0);
  }

  private calculateTotalDuration(appointments: AestheticAppointment[]): number {
    return appointments.reduce((total, apt) => total + apt.procedureDetails.baseDurationMinutes, 0);
  }

  private createRecoveryPlan(procedures: AestheticProcedureDetails[], appointments: AestheticAppointment[]): RecoveryPlan {
    const maxRecovery = Math.max(...procedures.map(p => p.recoveryPeriodDays));
    
    return {
      procedureName: procedures.map(p => p.name).join(' + '),
      recoveryPeriodDays: maxRecovery,
      dailyInstructions: [
        'Avoid sun exposure',
        'Keep area clean and moisturized',
        'Avoid strenuous exercise',
        'Follow specific aftercare instructions'
      ],
      followUpAppointments: [
        { dayNumber: 7, purpose: 'Initial follow-up', durationMinutes: 15, inPerson: true },
        { dayNumber: 30, purpose: 'Final assessment', durationMinutes: 30, inPerson: true }
      ],
      emergencyContacts: ['Emergency Hotline: +55 11 9999-9999'],
      restrictions: [
        'No alcohol for 48 hours',
        'Avoid blood thinners',
        'No facial treatments for 1 week'
      ],
      expectedOutcomes: [
        'Gradual improvement over 2-4 weeks',
        'Final results visible in 4-6 weeks',
        'Results may vary based on individual factors'
      ]
    };
  }

  private generateAlternativeOptions(
    request: AestheticSchedulingRequest,
    procedures: AestheticProcedureDetails[]
  ): AlternativeTreatmentOption[] {
    // Generate alternative treatment options based on budget, duration, or recovery preferences
    return [];
  }

  private initializeAestheticProcedures(): void {
    // Initialize with common aesthetic procedures
    // This would typically be loaded from database
  }

  private initializeTreatmentPackages(): void {
    // Initialize common treatment packages
    // This would typically be loaded from database
  }

  private createEmptyRecoveryPlan(): RecoveryPlan {
    return {
      procedureName: '',
      recoveryPeriodDays: 0,
      dailyInstructions: [],
      followUpAppointments: [],
      emergencyContacts: [],
      restrictions: [],
      expectedOutcomes: []
    };
  }

  private getProcedurePriority(procedure: AestheticProcedureDetails): number {
    const priorityMap = {
      'surgical': 5,
      'injectable': 4,
      'laser': 3,
      'body': 2,
      'facial': 1,
      'combination': 6
    };
    return priorityMap[procedure.procedureType] || 0;
  }

  private findSuitableRooms(appointment: AestheticAppointment): string[] {
    // Find rooms that meet procedure requirements
    return ['room_1', 'room_2', 'room_3']; // Mock implementation
  }

  private findBestAvailableRoom(rooms: string[], startTime: Date): string | null {
    // Find the best available room based on schedule
    return rooms[0] || null; // Mock implementation
  }

  private calculateRecoveryBuffer(procedure: AestheticProcedureDetails): number {
    // Calculate recovery buffer time based on procedure type
    const bufferMap = {
      'surgical': 60,
      'injectable': 15,
      'laser': 30,
      'body': 45,
      'facial': 15,
      'combination': 45
    };
    return bufferMap[procedure.procedureType] || 15;
  }

  private generatePackageDates(startDate: Date, treatmentPackage: TreatmentPackage): Date[] {
    const dates: Date[] = [];
    const currentDate = new Date(startDate);

    for (let i = 0; i < treatmentPackage.totalSessions; i++) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + (treatmentPackage.recommendedIntervalWeeks * 7));
    }

    return dates;
  }

  private async findSuitableProfessionals(
    procedure: AestheticProcedureDetails,
    preferredProfessionals?: string[]
  ): Promise<Array<{
    id: string;
    experienceLevel: number;
    role: string;
    specialNotes?: string;
  }>> {
    // Find professionals with required certifications and experience
    // This would integrate with the professional database
    return [
      {
        id: 'prof_1',
        experienceLevel: 5,
        role: 'primary',
        specialNotes: 'Specialized in injectable procedures'
      }
    ]; // Mock implementation
  }

  private async getProfessionalDetails(professionalId: string): Promise<{
    certifications?: string[];
    experienceLevel?: number;
  }> {
    // Get professional details from database
    return {
      certifications: ['botox_certification', 'filler_certification'],
      experienceLevel: 5
    }; // Mock implementation
  }
}