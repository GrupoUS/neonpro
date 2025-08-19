// Intelligent Conflict Detection and Resolution System
// Real-time conflict detection with automatic resolution for aesthetic clinic scheduling

import type {
  AIAppointment,
  AlternativeSlot,
  ConflictDetection,
  ConflictResolution,
  ResolutionImpact,
  ResolutionType,
  RoomType,
  SchedulingConflict,
  StaffAvailability,
  TimeSlot,
  TreatmentDuration,
} from './types';

export class ConflictDetector {
  private readonly resolutionSuccessRate: Map<ResolutionType, number> =
    new Map();

  constructor() {
    this.initializeResolutionSuccessRates();
  }

  /**
   * Comprehensive conflict detection for appointment scheduling
   */
  async detectAllConflicts(
    appointmentSlot: AlternativeSlot,
    patientId: string,
    treatmentDuration: TreatmentDuration,
    existingAppointments: AIAppointment[]
  ): Promise<ConflictDetection> {
    const conflicts: SchedulingConflict[] = [];

    try {
      // 1. Double booking detection
      const doubleBookingConflicts = await this.detectDoubleBooking(
        appointmentSlot,
        existingAppointments
      );
      conflicts.push(...doubleBookingConflicts);

      // 2. Staff availability conflicts
      const staffConflicts = await this.detectStaffConflicts(
        appointmentSlot,
        treatmentDuration,
        existingAppointments
      );
      conflicts.push(...staffConflicts);

      // 3. Room availability conflicts
      const roomConflicts = await this.detectRoomConflicts(
        appointmentSlot,
        treatmentDuration,
        existingAppointments
      );
      conflicts.push(...roomConflicts);

      // 4. Equipment conflicts
      const equipmentConflicts = await this.detectEquipmentConflicts(
        appointmentSlot,
        treatmentDuration,
        existingAppointments
      );
      conflicts.push(...equipmentConflicts);

      // 5. Business rules conflicts
      const businessRuleConflicts = await this.detectBusinessRulesConflicts(
        appointmentSlot,
        patientId,
        treatmentDuration
      );
      conflicts.push(...businessRuleConflicts);

      // 6. Patient-specific conflicts
      const patientConflicts = await this.detectPatientConflicts(
        appointmentSlot,
        patientId,
        existingAppointments
      );
      conflicts.push(...patientConflicts);

      // 7. Treatment sequence conflicts
      const sequenceConflicts = await this.detectTreatmentSequenceConflicts(
        appointmentSlot,
        patientId,
        treatmentDuration,
        existingAppointments
      );
      conflicts.push(...sequenceConflicts);

      // Generate resolutions for detected conflicts
      const resolutions = await this.generateConflictResolutions(
        conflicts,
        appointmentSlot
      );

      // Determine if conflicts are auto-resolvable
      const autoResolvable = conflicts.every(
        (conflict) => conflict.autoResolvable
      );
      const criticalLevel = this.calculateCriticalLevel(conflicts);

      return {
        conflicts,
        resolutions,
        autoResolvable,
        criticalLevel,
      };
    } catch (_error) {
      throw new Error('Failed to detect scheduling conflicts');
    }
  }

  /**
   * Detect double booking conflicts
   */
  private async detectDoubleBooking(
    slot: AlternativeSlot,
    existingAppointments: AIAppointment[]
  ): Promise<SchedulingConflict[]> {
    const conflicts: SchedulingConflict[] = [];
    const { start, end } = slot.slot;

    // Check for overlapping appointments
    const overlappingAppointments = existingAppointments.filter(
      (appointment) => {
        const apptStart = new Date(appointment.scheduledStart);
        const apptEnd = new Date(appointment.scheduledEnd);

        // Check for time overlap
        return (
          start < apptEnd &&
          end > apptStart &&
          (appointment.staffId === slot.staffId ||
            appointment.roomId === slot.roomId)
        );
      }
    );

    if (overlappingAppointments.length > 0) {
      conflicts.push({
        id: this.generateConflictId(),
        type: 'double_booking',
        severity: 'critical',
        description: `Double booking detected: ${overlappingAppointments.length} overlapping appointment(s)`,
        affectedAppointments: overlappingAppointments.map((a) => a.id),
        affectedResources: [slot.staffId, slot.roomId],
        detectedAt: new Date(),
        autoResolvable: overlappingAppointments.length === 1, // Can auto-resolve single conflicts
      });
    }

    return conflicts;
  }

  /**
   * Detect staff availability conflicts
   */
  private async detectStaffConflicts(
    slot: AlternativeSlot,
    treatmentDuration: TreatmentDuration,
    existingAppointments: AIAppointment[]
  ): Promise<SchedulingConflict[]> {
    const conflicts: SchedulingConflict[] = [];

    // Check staff availability
    const staffAvailability = await this.getStaffAvailability(
      slot.staffId,
      slot.slot.start
    );

    if (!staffAvailability) {
      conflicts.push({
        id: this.generateConflictId(),
        type: 'staff_conflict',
        severity: 'high',
        description: `Staff member ${slot.staffId} not available at requested time`,
        affectedAppointments: [],
        affectedResources: [slot.staffId],
        detectedAt: new Date(),
        autoResolvable: true, // Can reassign to available staff
      });
      return conflicts;
    }

    // Check if staff has required skills
    const hasRequiredSkills = this.checkStaffSkills(
      staffAvailability,
      treatmentDuration.staffRequired
    );
    if (!hasRequiredSkills) {
      conflicts.push({
        id: this.generateConflictId(),
        type: 'staff_conflict',
        severity: 'medium',
        description: `Staff member ${slot.staffId} lacks required skills for treatment`,
        affectedAppointments: [],
        affectedResources: [slot.staffId],
        detectedAt: new Date(),
        autoResolvable: true,
      });
    }

    // Check staff workload limits
    const staffWorkload = this.calculateStaffWorkload(
      slot.staffId,
      slot.slot.start,
      existingAppointments
    );
    if (staffWorkload.concurrent >= staffAvailability.maxConcurrentPatients) {
      conflicts.push({
        id: this.generateConflictId(),
        type: 'staff_conflict',
        severity: 'medium',
        description: `Staff member ${slot.staffId} exceeds maximum concurrent patient limit`,
        affectedAppointments: [],
        affectedResources: [slot.staffId],
        detectedAt: new Date(),
        autoResolvable: true,
      });
    }

    // Check for break time conflicts
    const conflictsWithBreaks = this.checkBreakTimeConflicts(
      staffAvailability,
      slot.slot
    );
    conflicts.push(...conflictsWithBreaks);

    return conflicts;
  }

  /**
   * Detect room availability conflicts
   */
  private async detectRoomConflicts(
    slot: AlternativeSlot,
    treatmentDuration: TreatmentDuration,
    existingAppointments: AIAppointment[]
  ): Promise<SchedulingConflict[]> {
    const conflicts: SchedulingConflict[] = [];

    // Check room availability
    const roomDetails = await this.getRoomDetails(slot.roomId);
    if (!roomDetails) {
      conflicts.push({
        id: this.generateConflictId(),
        type: 'room_conflict',
        severity: 'high',
        description: `Room ${slot.roomId} not found or not available`,
        affectedAppointments: [],
        affectedResources: [slot.roomId],
        detectedAt: new Date(),
        autoResolvable: true,
      });
      return conflicts;
    }

    // Check room suitability for treatment
    const isSuitable = roomDetails.suitableFor.includes(
      treatmentDuration.treatmentType
    );
    if (!isSuitable) {
      conflicts.push({
        id: this.generateConflictId(),
        type: 'room_conflict',
        severity: 'medium',
        description: `Room ${slot.roomId} not suitable for treatment type ${treatmentDuration.treatmentType}`,
        affectedAppointments: [],
        affectedResources: [slot.roomId],
        detectedAt: new Date(),
        autoResolvable: true,
      });
    }

    // Check room capacity
    if (roomDetails.capacity < 1) {
      conflicts.push({
        id: this.generateConflictId(),
        type: 'room_conflict',
        severity: 'medium',
        description: `Room ${slot.roomId} capacity insufficient`,
        affectedAppointments: [],
        affectedResources: [slot.roomId],
        detectedAt: new Date(),
        autoResolvable: true,
      });
    }

    // Check for room cleaning/preparation time
    const roomPreparationConflict = this.checkRoomPreparationTime(
      slot,
      treatmentDuration,
      existingAppointments
    );
    if (roomPreparationConflict) {
      conflicts.push(roomPreparationConflict);
    }

    return conflicts;
  }

  /**
   * Detect equipment availability conflicts
   */
  private async detectEquipmentConflicts(
    slot: AlternativeSlot,
    treatmentDuration: TreatmentDuration,
    existingAppointments: AIAppointment[]
  ): Promise<SchedulingConflict[]> {
    const conflicts: SchedulingConflict[] = [];

    // Check each required equipment
    for (const equipment of treatmentDuration.equipmentRequired) {
      const equipmentAvailability = await this.checkEquipmentAvailability(
        equipment,
        slot.slot,
        existingAppointments
      );

      if (!equipmentAvailability.available) {
        conflicts.push({
          id: this.generateConflictId(),
          type: 'equipment_conflict',
          severity: equipmentAvailability.critical ? 'high' : 'medium',
          description: `Equipment ${equipment} not available: ${equipmentAvailability.reason}`,
          affectedAppointments: equipmentAvailability.conflictingAppointments,
          affectedResources: [equipment],
          detectedAt: new Date(),
          autoResolvable: !equipmentAvailability.critical,
        });
      }
    }

    return conflicts;
  }

  /**
   * Detect business rules conflicts
   */
  private async detectBusinessRulesConflicts(
    slot: AlternativeSlot,
    patientId: string,
    treatmentDuration: TreatmentDuration
  ): Promise<SchedulingConflict[]> {
    const conflicts: SchedulingConflict[] = [];

    // Check business hours
    const isWithinBusinessHours = this.checkBusinessHours(slot.slot);
    if (!isWithinBusinessHours) {
      conflicts.push({
        id: this.generateConflictId(),
        type: 'business_hours',
        severity: 'high',
        description: 'Appointment time is outside business hours',
        affectedAppointments: [],
        affectedResources: [],
        detectedAt: new Date(),
        autoResolvable: true,
      });
    }

    // Check minimum booking advance time
    const meetsAdvanceTime = this.checkMinimumAdvanceTime(slot.slot.start);
    if (!meetsAdvanceTime) {
      conflicts.push({
        id: this.generateConflictId(),
        type: 'business_hours',
        severity: 'medium',
        description: 'Appointment does not meet minimum advance booking time',
        affectedAppointments: [],
        affectedResources: [],
        detectedAt: new Date(),
        autoResolvable: true,
      });
    }

    // Check treatment-specific business rules
    const treatmentRuleConflicts = await this.checkTreatmentSpecificRules(
      treatmentDuration,
      patientId,
      slot
    );
    conflicts.push(...treatmentRuleConflicts);

    return conflicts;
  }

  /**
   * Detect patient-specific conflicts
   */
  private async detectPatientConflicts(
    slot: AlternativeSlot,
    patientId: string,
    existingAppointments: AIAppointment[]
  ): Promise<SchedulingConflict[]> {
    const conflicts: SchedulingConflict[] = [];

    // Check for existing patient appointments on the same day
    const sameDay = existingAppointments.filter(
      (appointment) =>
        appointment.patientId === patientId &&
        this.isSameDay(new Date(appointment.scheduledStart), slot.slot.start)
    );

    if (sameDay.length > 0) {
      conflicts.push({
        id: this.generateConflictId(),
        type: 'patient_availability',
        severity: 'medium',
        description: `Patient already has ${sameDay.length} appointment(s) on the same day`,
        affectedAppointments: sameDay.map((a) => a.id),
        affectedResources: [],
        detectedAt: new Date(),
        autoResolvable: true,
      });
    }

    // Check patient preferences and restrictions
    const patientPreferences = await this.getPatientPreferences(patientId);
    const preferenceConflicts = this.checkPatientPreferenceConflicts(
      slot,
      patientPreferences
    );
    conflicts.push(...preferenceConflicts);

    return conflicts;
  }

  /**
   * Detect treatment sequence conflicts
   */
  private async detectTreatmentSequenceConflicts(
    slot: AlternativeSlot,
    patientId: string,
    treatmentDuration: TreatmentDuration,
    existingAppointments: AIAppointment[]
  ): Promise<SchedulingConflict[]> {
    const conflicts: SchedulingConflict[] = [];

    // Get treatment sequence rules
    const sequenceRules = await this.getTreatmentSequenceRules(
      treatmentDuration.treatmentType
    );

    if (sequenceRules.length === 0) {
      return conflicts; // No sequence restrictions
    }

    // Check for required waiting periods between treatments
    const recentAppointments = existingAppointments.filter(
      (appointment) =>
        appointment.patientId === patientId &&
        this.isWithinDays(
          new Date(appointment.scheduledStart),
          slot.slot.start,
          30
        )
    );

    for (const rule of sequenceRules) {
      const violatingAppointments = recentAppointments.filter(
        (appointment) =>
          rule.conflictingTreatments.includes(appointment.treatmentType) &&
          this.isWithinDays(
            new Date(appointment.scheduledStart),
            slot.slot.start,
            rule.minimumDaysBetween
          )
      );

      if (violatingAppointments.length > 0) {
        conflicts.push({
          id: this.generateConflictId(),
          type: 'treatment_sequence',
          severity: rule.severity as 'low' | 'medium' | 'high' | 'critical',
          description: `Treatment sequence violation: minimum ${rule.minimumDaysBetween} days required between treatments`,
          affectedAppointments: violatingAppointments.map((a) => a.id),
          affectedResources: [],
          detectedAt: new Date(),
          autoResolvable: true,
        });
      }
    }

    return conflicts;
  }

  /**
   * Generate automatic conflict resolutions
   */
  private async generateConflictResolutions(
    conflicts: SchedulingConflict[],
    originalSlot: AlternativeSlot
  ): Promise<ConflictResolution[]> {
    const resolutions: ConflictResolution[] = [];

    for (const conflict of conflicts) {
      const resolution = await this.generateSingleConflictResolution(
        conflict,
        originalSlot
      );
      if (resolution) {
        resolutions.push(resolution);
      }
    }

    return resolutions.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Generate resolution for a single conflict
   */
  private async generateSingleConflictResolution(
    conflict: SchedulingConflict,
    originalSlot: AlternativeSlot
  ): Promise<ConflictResolution | null> {
    let resolutionType: ResolutionType;
    let newScheduling: Partial<AIAppointment> = {};
    let confidence = 0;

    switch (conflict.type) {
      case 'double_booking': {
        resolutionType = 'reschedule';
        const alternativeSlot = await this.findAlternativeSlot(
          originalSlot,
          30
        ); // 30 min buffer
        if (alternativeSlot) {
          newScheduling = {
            scheduledStart: alternativeSlot.slot.start,
            scheduledEnd: alternativeSlot.slot.end,
            staffId: alternativeSlot.staffId,
            roomId: alternativeSlot.roomId,
          };
          confidence = 0.9;
        }
        break;
      }

      case 'staff_conflict': {
        resolutionType = 'reassign_staff';
        const alternativeStaff = await this.findAlternativeStaff(originalSlot);
        if (alternativeStaff) {
          newScheduling = { staffId: alternativeStaff };
          confidence = 0.85;
        }
        break;
      }

      case 'room_conflict': {
        resolutionType = 'reassign_room';
        const alternativeRoom = await this.findAlternativeRoom(originalSlot);
        if (alternativeRoom) {
          newScheduling = { roomId: alternativeRoom };
          confidence = 0.8;
        }
        break;
      }

      case 'equipment_conflict': {
        resolutionType = 'reschedule';
        const equipmentSlot = await this.findSlotWithEquipment(originalSlot);
        if (equipmentSlot) {
          newScheduling = {
            scheduledStart: equipmentSlot.slot.start,
            scheduledEnd: equipmentSlot.slot.end,
          };
          confidence = 0.75;
        }
        break;
      }

      case 'business_hours': {
        resolutionType = 'reschedule';
        const businessHoursSlot =
          await this.findBusinessHoursSlot(originalSlot);
        if (businessHoursSlot) {
          newScheduling = {
            scheduledStart: businessHoursSlot.slot.start,
            scheduledEnd: businessHoursSlot.slot.end,
          };
          confidence = 0.95;
        }
        break;
      }

      default:
        return null;
    }

    if (Object.keys(newScheduling).length === 0) {
      return null;
    }

    const impact = await this.calculateResolutionImpact(
      conflict,
      newScheduling
    );

    return {
      conflictId: conflict.id,
      resolutionType,
      newScheduling,
      impact,
      confidence,
    };
  }

  // Helper methods
  private generateConflictId(): string {
    return `conflict_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private calculateCriticalLevel(conflicts: SchedulingConflict[]): number {
    if (conflicts.length === 0) {
      return 0;
    }

    const severityLevels = { low: 1, medium: 2, high: 3, critical: 4 };
    const maxSeverity = Math.max(
      ...conflicts.map((c) => severityLevels[c.severity])
    );

    return maxSeverity;
  }

  private initializeResolutionSuccessRates(): void {
    this.resolutionSuccessRate.set('reschedule', 0.9);
    this.resolutionSuccessRate.set('reassign_staff', 0.85);
    this.resolutionSuccessRate.set('reassign_room', 0.8);
    this.resolutionSuccessRate.set('adjust_duration', 0.75);
    this.resolutionSuccessRate.set('emergency_slot', 0.7);
  }

  // Placeholder methods for external service integration
  private async getStaffAvailability(
    _staffId: string,
    _date: Date
  ): Promise<StaffAvailability | null> {
    // Implementation would fetch from staff service
    return null;
  }

  private checkStaffSkills(
    staff: StaffAvailability,
    requiredSkills: string[]
  ): boolean {
    return requiredSkills.every((skill) => staff.skills.includes(skill));
  }

  private calculateStaffWorkload(
    _staffId: string,
    _date: Date,
    _appointments: AIAppointment[]
  ): { concurrent: number } {
    return { concurrent: 0 };
  }

  private checkBreakTimeConflicts(
    _staff: StaffAvailability,
    _slot: TimeSlot
  ): SchedulingConflict[] {
    return [];
  }

  private async getRoomDetails(_roomId: string): Promise<RoomType | null> {
    return null;
  }

  private checkRoomPreparationTime(
    _slot: AlternativeSlot,
    _duration: TreatmentDuration,
    _appointments: AIAppointment[]
  ): SchedulingConflict | null {
    return null;
  }

  private async checkEquipmentAvailability(
    _equipment: string,
    _slot: TimeSlot,
    _appointments: AIAppointment[]
  ): Promise<{
    available: boolean;
    critical: boolean;
    reason: string;
    conflictingAppointments: string[];
  }> {
    return {
      available: true,
      critical: false,
      reason: '',
      conflictingAppointments: [],
    };
  }

  private checkBusinessHours(slot: TimeSlot): boolean {
    const hour = slot.start.getHours();
    return hour >= 8 && hour < 18; // 8 AM to 6 PM
  }

  private checkMinimumAdvanceTime(appointmentTime: Date): boolean {
    const now = new Date();
    const minAdvanceHours = 2;
    return (
      appointmentTime.getTime() - now.getTime() >=
      minAdvanceHours * 60 * 60 * 1000
    );
  }

  private async checkTreatmentSpecificRules(
    _duration: TreatmentDuration,
    _patientId: string,
    _slot: AlternativeSlot
  ): Promise<SchedulingConflict[]> {
    return [];
  }

  private isSameDay(date1: Date, date2: Date): boolean {
    return date1.toDateString() === date2.toDateString();
  }

  private isWithinDays(date1: Date, date2: Date, days: number): boolean {
    const diffTime = Math.abs(date2.getTime() - date1.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= days;
  }

  private async getPatientPreferences(_patientId: string): Promise<any> {
    return {};
  }

  private checkPatientPreferenceConflicts(
    _slot: AlternativeSlot,
    _preferences: any
  ): SchedulingConflict[] {
    return [];
  }

  private async getTreatmentSequenceRules(
    _treatmentType: string
  ): Promise<any[]> {
    return [];
  }

  private async findAlternativeSlot(
    _originalSlot: AlternativeSlot,
    _bufferMinutes: number
  ): Promise<AlternativeSlot | null> {
    return null;
  }

  private async findAlternativeStaff(
    _originalSlot: AlternativeSlot
  ): Promise<string | null> {
    return null;
  }

  private async findAlternativeRoom(
    _originalSlot: AlternativeSlot
  ): Promise<string | null> {
    return null;
  }

  private async findSlotWithEquipment(
    _originalSlot: AlternativeSlot
  ): Promise<AlternativeSlot | null> {
    return null;
  }

  private async findBusinessHoursSlot(
    _originalSlot: AlternativeSlot
  ): Promise<AlternativeSlot | null> {
    return null;
  }

  private async calculateResolutionImpact(
    _conflict: SchedulingConflict,
    _newScheduling: Partial<AIAppointment>
  ): Promise<ResolutionImpact> {
    return {
      patientsAffected: 1,
      staffAffected: 1,
      revenueImpact: 0,
      patientSatisfactionImpact: -5,
      operationalImpact: 10,
    };
  }
}

export default ConflictDetector;
