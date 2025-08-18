// Integration Service for AI Scheduling System
// Connects AI scheduling with core services, treatments, patients, and notifications

import type {
  AIAppointment,
  AISchedulingAudit,
  PatientHistory,
  PatientPreferences,
  PerformanceMetrics,
  RoomType,
  SchedulingRequest,
  SchedulingResponse,
  StaffAvailability,
  TreatmentDuration,
} from './types';

// Import core service interfaces (these would be actual imports in production)
interface PatientService {
  getPatient(id: string): Promise<any>;
  getPatientHistory(id: string): Promise<PatientHistory>;
  getPatientPreferences(id: string): Promise<PatientPreferences>;
  updatePatientHistory(id: string, appointment: AIAppointment): Promise<void>;
}

interface TreatmentService {
  getTreatment(id: string): Promise<any>;
  getTreatmentDuration(id: string): Promise<TreatmentDuration>;
  getTreatmentRequirements(id: string): Promise<any>;
  updateTreatmentStats(id: string, duration: number): Promise<void>;
}

interface StaffService {
  getStaffMember(id: string): Promise<any>;
  getStaffAvailability(id: string, date: Date): Promise<StaffAvailability>;
  getAvailableStaff(date: Date, skills: string[]): Promise<any[]>;
  updateStaffSchedule(id: string, appointment: AIAppointment): Promise<void>;
}

interface RoomService {
  getRoom(id: string): Promise<RoomType>;
  getRoomAvailability(id: string, timeSlot: any): Promise<boolean>;
  getAvailableRooms(timeSlot: any, requirements: any): Promise<RoomType[]>;
  reserveRoom(id: string, appointment: AIAppointment): Promise<void>;
}

interface NotificationService {
  sendAppointmentConfirmation(appointment: AIAppointment): Promise<void>;
  sendReminders(appointment: AIAppointment): Promise<void>;
  sendReschedulingNotification(
    oldAppointment: AIAppointment,
    newAppointment: AIAppointment
  ): Promise<void>;
  sendConflictAlert(conflicts: any[]): Promise<void>;
}

interface InventoryService {
  checkEquipmentAvailability(
    equipment: string[],
    timeSlot: any
  ): Promise<boolean>;
  reserveEquipment(
    equipment: string[],
    appointment: AIAppointment
  ): Promise<void>;
  getEquipmentMaintenance(equipment: string): Promise<any[]>;
}

export interface ServiceDependencies {
  patientService: PatientService;
  treatmentService: TreatmentService;
  staffService: StaffService;
  roomService: RoomService;
  notificationService: NotificationService;
  inventoryService: InventoryService;
}

export class SchedulingIntegrationService {
  private services: ServiceDependencies;
  private auditLog: AISchedulingAudit[] = [];
  private performanceMetrics: PerformanceMetrics;
  private cacheEnabled = true;
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> =
    new Map();

  constructor(services: ServiceDependencies) {
    this.services = services;
    this.performanceMetrics = this.initializePerformanceMetrics();
    this.startCacheCleanup();
  }

  /**
   * Enhanced patient context retrieval with caching
   */
  async getEnhancedPatientContext(patientId: string): Promise<{
    patient: any;
    history: PatientHistory;
    preferences: PatientPreferences;
    riskFactors: any[];
  }> {
    const cacheKey = `patient_context_${patientId}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const [patient, history, preferences] = await Promise.all([
        this.services.patientService.getPatient(patientId),
        this.services.patientService.getPatientHistory(patientId),
        this.services.patientService.getPatientPreferences(patientId),
      ]);

      // Calculate risk factors
      const riskFactors = this.calculatePatientRiskFactors(
        history,
        preferences
      );

      const context = {
        patient,
        history,
        preferences,
        riskFactors,
      };

      this.setCache(cacheKey, context, 300_000); // 5 minutes TTL
      return context;
    } catch (error) {
      console.error('Failed to get patient context:', error);
      throw new Error(`Unable to retrieve patient context for ${patientId}`);
    }
  }

  /**
   * Enhanced treatment context retrieval
   */
  async getEnhancedTreatmentContext(treatmentId: string): Promise<{
    treatment: any;
    duration: TreatmentDuration;
    requirements: any;
    statistics: any;
  }> {
    const cacheKey = `treatment_context_${treatmentId}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const [treatment, duration, requirements] = await Promise.all([
        this.services.treatmentService.getTreatment(treatmentId),
        this.services.treatmentService.getTreatmentDuration(treatmentId),
        this.services.treatmentService.getTreatmentRequirements(treatmentId),
      ]);

      // Get treatment statistics for optimization
      const statistics = await this.getTreatmentStatistics(treatmentId);

      const context = {
        treatment,
        duration,
        requirements,
        statistics,
      };

      this.setCache(cacheKey, context, 600_000); // 10 minutes TTL
      return context;
    } catch (error) {
      console.error('Failed to get treatment context:', error);
      throw new Error(
        `Unable to retrieve treatment context for ${treatmentId}`
      );
    }
  }

  /**
   * Get comprehensive resource availability
   */
  async getResourceAvailability(
    timeSlot: { start: Date; end: Date },
    requirements: {
      staffSkills: string[];
      roomType: string;
      equipment: string[];
    }
  ): Promise<{
    availableStaff: any[];
    availableRooms: RoomType[];
    equipmentAvailable: boolean;
    conflicts: any[];
  }> {
    try {
      const [availableStaff, availableRooms, equipmentAvailable] =
        await Promise.all([
          this.services.staffService.getAvailableStaff(
            timeSlot.start,
            requirements.staffSkills
          ),
          this.services.roomService.getAvailableRooms(timeSlot, {
            type: requirements.roomType,
          }),
          this.services.inventoryService.checkEquipmentAvailability(
            requirements.equipment,
            timeSlot
          ),
        ]);

      // Cross-check for potential conflicts
      const conflicts = await this.identifyResourceConflicts(
        availableStaff,
        availableRooms,
        requirements.equipment,
        timeSlot
      );

      return {
        availableStaff,
        availableRooms,
        equipmentAvailable,
        conflicts,
      };
    } catch (error) {
      console.error('Failed to get resource availability:', error);
      throw new Error('Unable to check resource availability');
    }
  }

  /**
   * Complete appointment creation with all integrations
   */
  async createAppointmentWithIntegrations(appointment: AIAppointment): Promise<{
    success: boolean;
    appointmentId: string;
    integrationResults: any[];
    errors: any[];
  }> {
    const integrationResults: any[] = [];
    const errors: any[] = [];
    let success = true;

    try {
      // 1. Reserve staff
      try {
        await this.services.staffService.updateStaffSchedule(
          appointment.staffId,
          appointment
        );
        integrationResults.push({
          service: 'staff',
          status: 'success',
          message: 'Staff reserved',
        });
      } catch (error) {
        errors.push({ service: 'staff', error: error.message });
        success = false;
      }

      // 2. Reserve room
      try {
        await this.services.roomService.reserveRoom(
          appointment.roomId,
          appointment
        );
        integrationResults.push({
          service: 'room',
          status: 'success',
          message: 'Room reserved',
        });
      } catch (error) {
        errors.push({ service: 'room', error: error.message });
        success = false;
      }

      // 3. Reserve equipment
      try {
        await this.services.inventoryService.reserveEquipment(
          appointment.equipmentRequired,
          appointment
        );
        integrationResults.push({
          service: 'inventory',
          status: 'success',
          message: 'Equipment reserved',
        });
      } catch (error) {
        errors.push({ service: 'inventory', error: error.message });
        success = false;
      }

      // 4. Update patient history
      try {
        await this.services.patientService.updatePatientHistory(
          appointment.patientId,
          appointment
        );
        integrationResults.push({
          service: 'patient',
          status: 'success',
          message: 'Patient history updated',
        });
      } catch (error) {
        errors.push({ service: 'patient', error: error.message });
        // Not critical - don't fail the whole operation
      }

      // 5. Update treatment statistics
      try {
        await this.services.treatmentService.updateTreatmentStats(
          appointment.treatmentId,
          appointment.estimatedDuration
        );
        integrationResults.push({
          service: 'treatment',
          status: 'success',
          message: 'Treatment stats updated',
        });
      } catch (error) {
        errors.push({ service: 'treatment', error: error.message });
        // Not critical - don't fail the whole operation
      }

      // 6. Send notifications
      try {
        await this.services.notificationService.sendAppointmentConfirmation(
          appointment
        );
        integrationResults.push({
          service: 'notification',
          status: 'success',
          message: 'Confirmation sent',
        });
      } catch (error) {
        errors.push({ service: 'notification', error: error.message });
        // Not critical - don't fail the whole operation
      }

      // 7. Log audit trail
      await this.logSchedulingAudit({
        timestamp: new Date(),
        action: 'appointment_created',
        userId: appointment.createdBy,
        appointmentId: appointment.id,
        changes: { appointment },
        aiDecision: true,
        confidence: appointment.confidenceScore,
        outcome: success ? 'success' : 'partial',
      });

      return {
        success,
        appointmentId: appointment.id,
        integrationResults,
        errors,
      };
    } catch (error) {
      console.error('Critical error in appointment creation:', error);

      // Attempt rollback if partial success
      if (integrationResults.length > 0) {
        await this.rollbackAppointment(appointment, integrationResults);
      }

      return {
        success: false,
        appointmentId: '',
        integrationResults,
        errors: [{ service: 'system', error: error.message }],
      };
    }
  }

  /**
   * Handle appointment updates with conflict resolution
   */
  async updateAppointmentWithIntegrations(
    appointmentId: string,
    updates: Partial<AIAppointment>,
    conflictResolution?: any
  ): Promise<{
    success: boolean;
    updatedAppointment?: AIAppointment;
    conflicts: any[];
    integrationResults: any[];
  }> {
    const integrationResults: any[] = [];
    const conflicts: any[] = [];

    try {
      // Get current appointment
      const currentAppointment =
        await this.getCurrentAppointment(appointmentId);
      if (!currentAppointment) {
        throw new Error('Appointment not found');
      }

      // Check for conflicts with updates
      const updateConflicts = await this.checkUpdateConflicts(
        currentAppointment,
        updates
      );
      conflicts.push(...updateConflicts);

      // If conflicts exist and no resolution provided, return conflicts
      if (conflicts.length > 0 && !conflictResolution) {
        return {
          success: false,
          conflicts,
          integrationResults,
        };
      }

      // Apply conflict resolution if provided
      if (conflictResolution) {
        updates = this.applyConflictResolution(updates, conflictResolution);
      }

      // Update resources
      const resourceUpdates = await this.updateAppointmentResources(
        currentAppointment,
        updates
      );
      integrationResults.push(...resourceUpdates);

      // Send notifications for changes
      if (this.hasSignificantChanges(currentAppointment, updates)) {
        await this.services.notificationService.sendReschedulingNotification(
          currentAppointment,
          { ...currentAppointment, ...updates }
        );
        integrationResults.push({
          service: 'notification',
          status: 'success',
          message: 'Rescheduling notification sent',
        });
      }

      // Log audit trail
      await this.logSchedulingAudit({
        timestamp: new Date(),
        action: 'appointment_updated',
        userId: updates.updatedBy || '',
        appointmentId,
        changes: updates,
        aiDecision: !!conflictResolution,
        confidence: conflictResolution?.confidence || 0.5,
        outcome: 'success',
      });

      const updatedAppointment = { ...currentAppointment, ...updates };

      return {
        success: true,
        updatedAppointment,
        conflicts,
        integrationResults,
      };
    } catch (error) {
      console.error('Failed to update appointment:', error);
      return {
        success: false,
        conflicts,
        integrationResults: [
          { service: 'system', status: 'error', message: error.message },
        ],
      };
    }
  }

  /**
   * Batch processing for multiple appointments
   */
  async processBatchScheduling(requests: SchedulingRequest[]): Promise<{
    successful: SchedulingResponse[];
    failed: { request: SchedulingRequest; error: string }[];
    batchMetrics: any;
  }> {
    const successful: SchedulingResponse[] = [];
    const failed: { request: SchedulingRequest; error: string }[] = [];
    const startTime = Date.now();

    // Process in parallel with concurrency limit
    const BATCH_SIZE = 5;
    for (let i = 0; i < requests.length; i += BATCH_SIZE) {
      const batch = requests.slice(i, i + BATCH_SIZE);

      const batchPromises = batch.map(async (request) => {
        try {
          // This would integrate with the AI scheduling engine
          const response = await this.processIndividualScheduling(request);
          successful.push(response);
        } catch (error) {
          failed.push({ request, error: error.message });
        }
      });

      await Promise.all(batchPromises);
    }

    const processingTime = Date.now() - startTime;
    const batchMetrics = {
      totalRequests: requests.length,
      successfulRequests: successful.length,
      failedRequests: failed.length,
      successRate: successful.length / requests.length,
      averageProcessingTime: processingTime / requests.length,
      totalProcessingTime: processingTime,
    };

    return {
      successful,
      failed,
      batchMetrics,
    };
  }

  /**
   * Real-time availability checking
   */
  async checkRealTimeAvailability(
    timeSlot: { start: Date; end: Date },
    requirements: any
  ): Promise<{
    available: boolean;
    alternatives: any[];
    conflicts: any[];
    confidence: number;
  }> {
    try {
      const resources = await this.getResourceAvailability(
        timeSlot,
        requirements
      );

      const available =
        resources.availableStaff.length > 0 &&
        resources.availableRooms.length > 0 &&
        resources.equipmentAvailable;

      let alternatives: any[] = [];
      if (!available) {
        alternatives = await this.findAlternativeSlots(timeSlot, requirements);
      }

      const confidence = this.calculateAvailabilityConfidence(
        resources,
        alternatives
      );

      return {
        available,
        alternatives,
        conflicts: resources.conflicts,
        confidence,
      };
    } catch (error) {
      console.error('Real-time availability check failed:', error);
      return {
        available: false,
        alternatives: [],
        conflicts: [],
        confidence: 0,
      };
    }
  }

  // Helper methods
  private calculatePatientRiskFactors(
    history: PatientHistory,
    preferences: PatientPreferences
  ): any[] {
    const factors = [];

    if (history.noShowCount / history.totalAppointments > 0.2) {
      factors.push({
        type: 'high_no_show_risk',
        severity: 'medium',
        value: history.noShowCount,
      });
    }

    if (history.punctualityScore < 70) {
      factors.push({
        type: 'punctuality_risk',
        severity: 'low',
        value: history.punctualityScore,
      });
    }

    return factors;
  }

  private async getTreatmentStatistics(treatmentId: string): Promise<any> {
    // Calculate treatment statistics for optimization
    return {
      averageDuration: 60,
      successRate: 0.95,
      popularTimes: ['10:00', '14:00', '16:00'],
      staffPreferences: [],
    };
  }

  private async identifyResourceConflicts(
    staff: any[],
    rooms: RoomType[],
    equipment: string[],
    timeSlot: any
  ): Promise<any[]> {
    // Identify potential resource conflicts
    return [];
  }

  private async rollbackAppointment(
    appointment: AIAppointment,
    completedIntegrations: any[]
  ): Promise<void> {
    console.log('Rolling back appointment creation:', appointment.id);
    // Implement rollback logic for each completed integration
    for (const integration of completedIntegrations) {
      try {
        switch (integration.service) {
          case 'staff':
            // Release staff reservation
            break;
          case 'room':
            // Release room reservation
            break;
          case 'inventory':
            // Release equipment reservation
            break;
        }
      } catch (rollbackError) {
        console.error(
          `Rollback failed for ${integration.service}:`,
          rollbackError
        );
      }
    }
  }

  private async getCurrentAppointment(
    appointmentId: string
  ): Promise<AIAppointment | null> {
    // Get current appointment from database
    return null;
  }

  private async checkUpdateConflicts(
    current: AIAppointment,
    updates: Partial<AIAppointment>
  ): Promise<any[]> {
    // Check for conflicts with updates
    return [];
  }

  private applyConflictResolution(
    updates: Partial<AIAppointment>,
    resolution: any
  ): Partial<AIAppointment> {
    // Apply conflict resolution to updates
    return updates;
  }

  private async updateAppointmentResources(
    current: AIAppointment,
    updates: Partial<AIAppointment>
  ): Promise<any[]> {
    // Update resources based on appointment changes
    return [];
  }

  private hasSignificantChanges(
    current: AIAppointment,
    updates: Partial<AIAppointment>
  ): boolean {
    return !!(
      updates.scheduledStart ||
      updates.scheduledEnd ||
      updates.staffId ||
      updates.roomId
    );
  }

  private async processIndividualScheduling(
    request: SchedulingRequest
  ): Promise<SchedulingResponse> {
    // Process individual scheduling request
    throw new Error(
      'Not implemented - would integrate with AI scheduling engine'
    );
  }

  private async findAlternativeSlots(
    timeSlot: any,
    requirements: any
  ): Promise<any[]> {
    // Find alternative time slots
    return [];
  }

  private calculateAvailabilityConfidence(
    resources: any,
    alternatives: any[]
  ): number {
    // Calculate confidence score for availability
    return 0.85;
  }

  private async logSchedulingAudit(audit: AISchedulingAudit): Promise<void> {
    this.auditLog.push(audit);
    // In production, this would be saved to database
  }

  // Cache management
  private getFromCache(key: string): any | null {
    if (!this.cacheEnabled) return null;

    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  private setCache(key: string, data: any, ttl: number): void {
    if (!this.cacheEnabled) return;

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  private startCacheCleanup(): void {
    setInterval(() => {
      const now = Date.now();
      for (const [key, cached] of this.cache.entries()) {
        if (now - cached.timestamp > cached.ttl) {
          this.cache.delete(key);
        }
      }
    }, 60_000); // Cleanup every minute
  }

  private initializePerformanceMetrics(): PerformanceMetrics {
    return {
      averageSchedulingTime: 0,
      appointmentsPerDay: 0,
      systemUtilization: 0,
      errorRate: 0,
      userSatisfaction: 0,
      aiAccuracy: 0,
      conflictResolutionRate: 0,
      noShowReduction: 0,
    };
  }

  // Public methods for accessing audit and metrics
  public getAuditLog(): AISchedulingAudit[] {
    return [...this.auditLog];
  }

  public getPerformanceMetrics(): PerformanceMetrics {
    return { ...this.performanceMetrics };
  }

  public clearCache(): void {
    this.cache.clear();
  }

  public setCacheEnabled(enabled: boolean): void {
    this.cacheEnabled = enabled;
    if (!enabled) {
      this.clearCache();
    }
  }
}

export default SchedulingIntegrationService;
