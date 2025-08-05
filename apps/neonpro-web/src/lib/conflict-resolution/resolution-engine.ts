/**
 * Intelligent Conflict Resolution Engine
 * Advanced system for generating and applying automated conflict resolutions
 */

import { createClient } from '@supabase/supabase-js';
import {
  ConflictDetails,
  ResolutionOption,
  ResolutionStrategy,
  ResolutionResult,
  ResolutionImpact,
  ProposedChanges,
  OptimizationConfig,
  OptimizationConstraints,
  RecommendedAction
} from './types';
import { Database } from '@/types/supabase';
import { ConflictDetectionEngine } from './conflict-detector';

type Appointment = Database['public']['Tables']['appointments']['Row'];
type Staff = Database['public']['Tables']['staff']['Row'];
type Room = Database['public']['Tables']['rooms']['Row'];
type Equipment = Database['public']['Tables']['equipment']['Row'];

export class ConflictResolutionEngine {
  private supabase;
  private conflictDetector: ConflictDetectionEngine;
  private config: OptimizationConfig;
  private constraints: OptimizationConstraints;
  private resolutionCache: Map<string, ResolutionOption[]> = new Map();

  constructor(
    supabaseUrl: string,
    supabaseKey: string,
    conflictDetector: ConflictDetectionEngine,
    config: Partial<OptimizationConfig> = {},
    constraints: Partial<OptimizationConstraints> = {}
  ) {
    this.const supabase = createClient(<Database>(supabaseUrl, supabaseKey);
    this.conflictDetector = conflictDetector;
    
    this.config = {
      prioritizePatientSatisfaction: true,
      prioritizeStaffWorkload: true,
      prioritizeResourceUtilization: true,
      prioritizeFinancialImpact: false,
      weights: {
        patientSatisfaction: 0.3,
        staffWorkload: 0.25,
        resourceUtilization: 0.2,
        operationalEfficiency: 0.15,
        financialImpact: 0.1
      },
      constraints: {
        maxReschedulingDistance: 24,
        minStaffBreakTime: 15,
        maxDailyWorkHours: 8,
        requiredEquipmentAvailability: 0.95,
        maxRoomCapacityUtilization: 0.9,
        businessHours: { start: '08:00', end: '18:00' },
        excludedDays: ['sunday']
      },
      ...config
    };
    
    this.constraints = {
      maxReschedulingDistance: 24,
      minStaffBreakTime: 15,
      maxDailyWorkHours: 8,
      requiredEquipmentAvailability: 0.95,
      maxRoomCapacityUtilization: 0.9,
      businessHours: { start: '08:00', end: '18:00' },
      excludedDays: ['sunday'],
      ...constraints
    };
  }

  /**
   * Generate resolution options for a conflict
   */
  async generateResolutions(conflictId: string): Promise<ResolutionOption[]> {
    try {
      // Check cache first
      if (this.resolutionCache.has(conflictId)) {
        return this.resolutionCache.get(conflictId)!;
      }

      // Get conflict details
      const conflict = await this.getConflictById(conflictId);
      if (!conflict) {
        throw new Error(`Conflict not found: ${conflictId}`);
      }

      // Get affected appointments and resources
      const appointments = await this.getAppointmentsByIds(conflict.affectedAppointments);
      const resources = await this.getAffectedResources(conflict);

      // Generate different resolution strategies
      const resolutions: ResolutionOption[] = [];

      // Strategy 1: Reschedule later
      const rescheduleOptions = await this.generateRescheduleOptions(conflict, appointments, resources, 'later');
      resolutions.push(...rescheduleOptions);

      // Strategy 2: Reschedule earlier
      const earlierOptions = await this.generateRescheduleOptions(conflict, appointments, resources, 'earlier');
      resolutions.push(...earlierOptions);

      // Strategy 3: Change resources
      const resourceOptions = await this.generateResourceChangeOptions(conflict, appointments, resources);
      resolutions.push(...resourceOptions);

      // Strategy 4: Split or merge appointments
      const restructureOptions = await this.generateRestructureOptions(conflict, appointments);
      resolutions.push(...restructureOptions);

      // Strategy 5: Alternative solutions
      const alternativeOptions = await this.generateAlternativeOptions(conflict, appointments, resources);
      resolutions.push(...alternativeOptions);

      // Evaluate and rank all options
      const evaluatedResolutions = await this.evaluateResolutions(resolutions, conflict);
      const rankedResolutions = this.rankResolutions(evaluatedResolutions);

      // Cache results
      this.resolutionCache.set(conflictId, rankedResolutions);

      return rankedResolutions;
    } catch (error) {
      console.error('Error generating resolutions:', error);
      throw new Error(`Resolution generation failed: ${error.message}`);
    }
  }

  /**
   * Apply a resolution option
   */
  async applyResolution(resolutionId: string): Promise<ResolutionResult> {
    try {
      // Get resolution details
      const resolution = await this.getResolutionById(resolutionId);
      if (!resolution) {
        throw new Error(`Resolution not found: ${resolutionId}`);
      }

      // Validate resolution before applying
      const validation = await this.validateResolution(resolution);
      if (!validation.isValid) {
        return {
          success: false,
          resolutionId,
          appliedChanges: {},
          impact: this.createEmptyImpact(),
          notifications: [],
          errors: validation.errors
        };
      }

      // Apply changes in transaction
      const result = await this.applyChangesInTransaction(resolution);
      
      // Generate notifications
      const notifications = await this.generateNotifications(resolution, result);
      
      // Calculate actual impact
      const impact = await this.calculateActualImpact(resolution, result);
      
      // Log resolution application
      await this.logResolutionApplication(resolutionId, result, impact);
      
      // Clear related caches
      this.clearRelatedCaches(resolution);

      return {
        success: true,
        resolutionId,
        appliedChanges: result.changes,
        impact,
        notifications,
        warnings: result.warnings
      };
    } catch (error) {
      console.error('Error applying resolution:', error);
      return {
        success: false,
        resolutionId,
        appliedChanges: {},
        impact: this.createEmptyImpact(),
        notifications: [],
        errors: [error.message]
      };
    }
  }

  /**
   * Generate reschedule options
   */
  private async generateRescheduleOptions(
    conflict: ConflictDetails,
    appointments: Appointment[],
    resources: any,
    direction: 'earlier' | 'later'
  ): Promise<ResolutionOption[]> {
    const options: ResolutionOption[] = [];
    
    for (const appointment of appointments) {
      const availableSlots = await this.findAvailableSlots(
        appointment,
        resources,
        direction,
        this.constraints.maxReschedulingDistance
      );

      for (const slot of availableSlots.slice(0, 3)) { // Top 3 options
        const proposedChanges: ProposedChanges = {
          appointments: [{
            id: appointment.id,
            changes: {
              start_time: slot.start.toISOString(),
              end_time: slot.end.toISOString()
            }
          }]
        };

        const impact = await this.calculateResolutionImpact(proposedChanges, conflict);
        const confidence = this.calculateConfidence(slot, appointment, resources);
        
        options.push({
          id: `reschedule_${direction}_${appointment.id}_${slot.start.getTime()}`,
          strategy: direction === 'later' ? ResolutionStrategy.RESCHEDULE_LATER : ResolutionStrategy.RESCHEDULE_EARLIER,
          description: `Reschedule appointment ${direction} to ${slot.start.toLocaleString()}`,
          confidence,
          impact,
          estimatedTime: this.calculateEstimatedTime(proposedChanges),
          cost: this.calculateCost(proposedChanges),
          feasibility: this.calculateFeasibility(proposedChanges, resources),
          proposedChanges,
          pros: this.generatePros(ResolutionStrategy.RESCHEDULE_LATER, impact),
          cons: this.generateCons(ResolutionStrategy.RESCHEDULE_LATER, impact),
          metadata: {
            originalTime: {
              start: appointment.start_time,
              end: appointment.end_time
            },
            newTime: {
              start: slot.start.toISOString(),
              end: slot.end.toISOString()
            },
            timeShift: Math.abs(new Date(appointment.start_time).getTime() - slot.start.getTime()) / (1000 * 60 * 60),
            slot
          }
        });
      }
    }

    return options;
  }

  /**
   * Generate resource change options
   */
  private async generateResourceChangeOptions(
    conflict: ConflictDetails,
    appointments: Appointment[],
    resources: any
  ): Promise<ResolutionOption[]> {
    const options: ResolutionOption[] = [];

    for (const appointment of appointments) {
      // Alternative staff options
      if (appointment.staff_id && resources.staff) {
        const alternativeStaff = await this.findAlternativeStaff(
          appointment,
          resources.staff,
          new Date(appointment.start_time),
          new Date(appointment.end_time)
        );

        for (const staff of alternativeStaff.slice(0, 2)) {
          const proposedChanges: ProposedChanges = {
            staffAssignments: [{
              appointmentId: appointment.id,
              oldStaffId: appointment.staff_id,
              newStaffId: staff.id
            }]
          };

          const impact = await this.calculateResolutionImpact(proposedChanges, conflict);
          
          options.push({
            id: `change_staff_${appointment.id}_${staff.id}`,
            strategy: ResolutionStrategy.CHANGE_STAFF,
            description: `Assign ${staff.name} instead of current staff`,
            confidence: this.calculateStaffChangeConfidence(staff, appointment),
            impact,
            estimatedTime: 5,
            cost: this.calculateStaffChangeCost(staff, appointment),
            feasibility: this.calculateStaffChangeFeasibility(staff, appointment),
            proposedChanges,
            pros: this.generatePros(ResolutionStrategy.CHANGE_STAFF, impact),
            cons: this.generateCons(ResolutionStrategy.CHANGE_STAFF, impact),
            metadata: {
              originalStaff: resources.staff.find((s: any) => s.id === appointment.staff_id),
              newStaff: staff,
              appointment
            }
          });
        }
      }

      // Alternative room options
      if (appointment.room_id && resources.rooms) {
        const alternativeRooms = await this.findAlternativeRooms(
          appointment,
          resources.rooms,
          new Date(appointment.start_time),
          new Date(appointment.end_time)
        );

        for (const room of alternativeRooms.slice(0, 2)) {
          const proposedChanges: ProposedChanges = {
            roomAssignments: [{
              appointmentId: appointment.id,
              oldRoomId: appointment.room_id,
              newRoomId: room.id
            }]
          };

          const impact = await this.calculateResolutionImpact(proposedChanges, conflict);
          
          options.push({
            id: `change_room_${appointment.id}_${room.id}`,
            strategy: ResolutionStrategy.CHANGE_ROOM,
            description: `Move to ${room.name} instead of current room`,
            confidence: this.calculateRoomChangeConfidence(room, appointment),
            impact,
            estimatedTime: 10,
            cost: this.calculateRoomChangeCost(room, appointment),
            feasibility: this.calculateRoomChangeFeasibility(room, appointment),
            proposedChanges,
            pros: this.generatePros(ResolutionStrategy.CHANGE_ROOM, impact),
            cons: this.generateCons(ResolutionStrategy.CHANGE_ROOM, impact),
            metadata: {
              originalRoom: resources.rooms.find((r: any) => r.id === appointment.room_id),
              newRoom: room,
              appointment
            }
          });
        }
      }
    }

    return options;
  }

  /**
   * Generate restructure options (split/merge)
   */
  private async generateRestructureOptions(
    conflict: ConflictDetails,
    appointments: Appointment[]
  ): Promise<ResolutionOption[]> {
    const options: ResolutionOption[] = [];

    // Split appointment options
    for (const appointment of appointments) {
      const duration = new Date(appointment.end_time).getTime() - new Date(appointment.start_time).getTime();
      const durationMinutes = duration / (1000 * 60);

      if (durationMinutes >= 60) { // Only split appointments longer than 1 hour
        const splitOptions = await this.generateSplitOptions(appointment);
        options.push(...splitOptions);
      }
    }

    // Merge appointment options
    if (appointments.length >= 2) {
      const mergeOptions = await this.generateMergeOptions(appointments);
      options.push(...mergeOptions);
    }

    return options;
  }

  /**
   * Generate alternative options
   */
  private async generateAlternativeOptions(
    conflict: ConflictDetails,
    appointments: Appointment[],
    resources: any
  ): Promise<ResolutionOption[]> {
    const options: ResolutionOption[] = [];

    // Extend business hours option
    const extendHoursOption = await this.generateExtendHoursOption(conflict, appointments);
    if (extendHoursOption) {
      options.push(extendHoursOption);
    }

    // Delegate to alternative provider
    const delegateOptions = await this.generateDelegateOptions(appointments, resources);
    options.push(...delegateOptions);

    // Manual intervention option (last resort)
    options.push({
      id: `manual_intervention_${conflict.id}`,
      strategy: ResolutionStrategy.MANUAL_INTERVENTION,
      description: 'Requires manual intervention by scheduling manager',
      confidence: 1.0,
      impact: this.createNeutralImpact(),
      estimatedTime: 30,
      cost: 0.8,
      feasibility: 1.0,
      proposedChanges: {},
      pros: ['Flexible solution', 'Human oversight', 'Custom resolution'],
      cons: ['Requires manual work', 'Time consuming', 'May delay resolution'],
      metadata: {
        conflict,
        appointments,
        requiresApproval: true
      }
    });

    return options;
  }  /**
   * Evaluate resolution options
   */
  private async evaluateResolutions(
    resolutions: ResolutionOption[],
    conflict: ConflictDetails
  ): Promise<ResolutionOption[]> {
    const evaluatedResolutions: ResolutionOption[] = [];

    for (const resolution of resolutions) {
      // Recalculate impact with current data
      const updatedImpact = await this.calculateResolutionImpact(resolution.proposedChanges, conflict);
      
      // Calculate overall score
      const overallScore = this.calculateOverallScore(updatedImpact);
      
      // Update feasibility based on current constraints
      const updatedFeasibility = await this.validateFeasibility(resolution);
      
      evaluatedResolutions.push({
        ...resolution,
        impact: updatedImpact,
        feasibility: updatedFeasibility,
        metadata: {
          ...resolution.metadata,
          overallScore,
          evaluatedAt: new Date().toISOString()
        }
      });
    }

    return evaluatedResolutions;
  }

  /**
   * Rank resolutions by overall score
   */
  private rankResolutions(resolutions: ResolutionOption[]): ResolutionOption[] {
    return resolutions.sort((a, b) => {
      const scoreA = this.calculateOverallScore(a.impact) * a.confidence * a.feasibility;
      const scoreB = this.calculateOverallScore(b.impact) * b.confidence * b.feasibility;
      return scoreB - scoreA;
    });
  }

  /**
   * Calculate overall score based on weighted impact
   */
  private calculateOverallScore(impact: ResolutionImpact): number {
    const weights = this.config.weights;
    
    return (
      impact.patientSatisfaction * weights.patientSatisfaction +
      impact.staffWorkload * weights.staffWorkload +
      impact.resourceUtilization * weights.resourceUtilization +
      impact.operationalEfficiency * weights.operationalEfficiency +
      impact.financialImpact * weights.financialImpact
    );
  }

  /**
   * Calculate resolution impact
   */
  private async calculateResolutionImpact(
    proposedChanges: ProposedChanges,
    conflict: ConflictDetails
  ): Promise<ResolutionImpact> {
    let patientSatisfaction = 0;
    let staffWorkload = 0;
    let resourceUtilization = 0;
    let operationalEfficiency = 0;
    let financialImpact = 0;

    // Analyze appointment changes
    if (proposedChanges.appointments) {
      for (const change of proposedChanges.appointments) {
        const appointment = await this.getAppointmentById(change.id);
        if (!appointment) continue;

        // Patient satisfaction impact
        if (change.changes.start_time) {
          const originalTime = new Date(appointment.start_time);
          const newTime = new Date(change.changes.start_time);
          const timeDiff = Math.abs(newTime.getTime() - originalTime.getTime()) / (1000 * 60 * 60);
          
          // Less impact for smaller time changes
          patientSatisfaction -= Math.min(timeDiff / 24, 0.5);
        }

        // Operational efficiency
        operationalEfficiency += 0.1; // Resolving conflicts improves efficiency
      }
    }

    // Analyze staff changes
    if (proposedChanges.staffAssignments) {
      for (const assignment of proposedChanges.staffAssignments) {
        const newStaff = await this.getStaffById(assignment.newStaffId);
        if (!newStaff) continue;

        // Staff workload impact
        const currentWorkload = await this.getStaffCurrentWorkload(assignment.newStaffId);
        if (currentWorkload < 0.8) {
          staffWorkload += 0.1; // Positive impact if staff has capacity
        } else {
          staffWorkload -= 0.2; // Negative impact if staff is overloaded
        }

        // Resource utilization
        resourceUtilization += 0.05;
      }
    }

    // Analyze room changes
    if (proposedChanges.roomAssignments) {
      for (const assignment of proposedChanges.roomAssignments) {
        const newRoom = await this.getRoomById(assignment.newRoomId);
        if (!newRoom) continue;

        // Resource utilization impact
        const roomUtilization = await this.getRoomUtilization(assignment.newRoomId);
        if (roomUtilization < 0.8) {
          resourceUtilization += 0.1;
        }
      }
    }

    // Financial impact calculation
    financialImpact = this.calculateFinancialImpact(proposedChanges);

    const overallScore = this.calculateOverallScore({
      patientSatisfaction,
      staffWorkload,
      resourceUtilization,
      operationalEfficiency,
      financialImpact,
      overallScore: 0
    });

    return {
      patientSatisfaction: Math.max(-1, Math.min(1, patientSatisfaction)),
      staffWorkload: Math.max(-1, Math.min(1, staffWorkload)),
      resourceUtilization: Math.max(-1, Math.min(1, resourceUtilization)),
      operationalEfficiency: Math.max(-1, Math.min(1, operationalEfficiency)),
      financialImpact: Math.max(-1, Math.min(1, financialImpact)),
      overallScore
    };
  }

  /**
   * Apply changes in database transaction
   */
  private async applyChangesInTransaction(resolution: ResolutionOption): Promise<any> {
    const changes = resolution.proposedChanges;
    const appliedChanges: ProposedChanges = {};
    const warnings: string[] = [];

    try {
      // Start transaction
      const { data, error } = await this.supabase.rpc('begin_transaction');
      if (error) throw error;

      // Apply appointment changes
      if (changes.appointments) {
        appliedChanges.appointments = [];
        for (const change of changes.appointments) {
          const { error: updateError } = await this.supabase
            .from('appointments')
            .update(change.changes)
            .eq('id', change.id);

          if (updateError) {
            warnings.push(`Failed to update appointment ${change.id}: ${updateError.message}`);
          } else {
            appliedChanges.appointments.push(change);
          }
        }
      }

      // Apply staff assignments
      if (changes.staffAssignments) {
        appliedChanges.staffAssignments = [];
        for (const assignment of changes.staffAssignments) {
          const { error: updateError } = await this.supabase
            .from('appointments')
            .update({ staff_id: assignment.newStaffId })
            .eq('id', assignment.appointmentId);

          if (updateError) {
            warnings.push(`Failed to update staff assignment for appointment ${assignment.appointmentId}: ${updateError.message}`);
          } else {
            appliedChanges.staffAssignments.push(assignment);
          }
        }
      }

      // Apply room assignments
      if (changes.roomAssignments) {
        appliedChanges.roomAssignments = [];
        for (const assignment of changes.roomAssignments) {
          const { error: updateError } = await this.supabase
            .from('appointments')
            .update({ room_id: assignment.newRoomId })
            .eq('id', assignment.appointmentId);

          if (updateError) {
            warnings.push(`Failed to update room assignment for appointment ${assignment.appointmentId}: ${updateError.message}`);
          } else {
            appliedChanges.roomAssignments.push(assignment);
          }
        }
      }

      // Apply equipment assignments
      if (changes.equipmentAssignments) {
        appliedChanges.equipmentAssignments = [];
        for (const assignment of changes.equipmentAssignments) {
          if (assignment.action === 'assign') {
            const { error: insertError } = await this.supabase
              .from('appointment_equipment')
              .insert({
                appointment_id: assignment.appointmentId,
                equipment_id: assignment.equipmentId
              });

            if (insertError) {
              warnings.push(`Failed to assign equipment ${assignment.equipmentId}: ${insertError.message}`);
            } else {
              appliedChanges.equipmentAssignments.push(assignment);
            }
          } else if (assignment.action === 'unassign') {
            const { error: deleteError } = await this.supabase
              .from('appointment_equipment')
              .delete()
              .eq('appointment_id', assignment.appointmentId)
              .eq('equipment_id', assignment.equipmentId);

            if (deleteError) {
              warnings.push(`Failed to unassign equipment ${assignment.equipmentId}: ${deleteError.message}`);
            } else {
              appliedChanges.equipmentAssignments.push(assignment);
            }
          }
        }
      }

      // Create new appointments
      if (changes.newAppointments) {
        appliedChanges.newAppointments = [];
        for (const newApt of changes.newAppointments) {
          const { data: insertedApt, error: insertError } = await this.supabase
            .from('appointments')
            .insert(newApt)
            .select()
            .single();

          if (insertError) {
            warnings.push(`Failed to create new appointment: ${insertError.message}`);
          } else {
            appliedChanges.newAppointments.push(insertedApt);
          }
        }
      }

      // Cancel appointments
      if (changes.cancelledAppointments) {
        appliedChanges.cancelledAppointments = [];
        for (const aptId of changes.cancelledAppointments) {
          const { error: updateError } = await this.supabase
            .from('appointments')
            .update({ status: 'cancelled' })
            .eq('id', aptId);

          if (updateError) {
            warnings.push(`Failed to cancel appointment ${aptId}: ${updateError.message}`);
          } else {
            appliedChanges.cancelledAppointments.push(aptId);
          }
        }
      }

      // Commit transaction
      const { error: commitError } = await this.supabase.rpc('commit_transaction');
      if (commitError) throw commitError;

      return { changes: appliedChanges, warnings };
    } catch (error) {
      // Rollback transaction
      await this.supabase.rpc('rollback_transaction');
      throw error;
    }
  }

  /**
   * Validate resolution before applying
   */
  private async validateResolution(resolution: ResolutionOption): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];

    // Check if appointments still exist
    if (resolution.proposedChanges.appointments) {
      for (const change of resolution.proposedChanges.appointments) {
        const appointment = await this.getAppointmentById(change.id);
        if (!appointment) {
          errors.push(`Appointment ${change.id} no longer exists`);
        } else if (appointment.status !== 'scheduled') {
          errors.push(`Appointment ${change.id} is no longer scheduled`);
        }
      }
    }

    // Check staff availability
    if (resolution.proposedChanges.staffAssignments) {
      for (const assignment of resolution.proposedChanges.staffAssignments) {
        const staff = await this.getStaffById(assignment.newStaffId);
        if (!staff || !staff.active) {
          errors.push(`Staff member ${assignment.newStaffId} is not available`);
        }
      }
    }

    // Check room availability
    if (resolution.proposedChanges.roomAssignments) {
      for (const assignment of resolution.proposedChanges.roomAssignments) {
        const room = await this.getRoomById(assignment.newRoomId);
        if (!room || !room.active) {
          errors.push(`Room ${assignment.newRoomId} is not available`);
        }
      }
    }

    // Check business constraints
    const constraintErrors = await this.validateBusinessConstraints(resolution);
    errors.push(...constraintErrors);

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Helper methods for finding alternatives
   */
  private async findAvailableSlots(
    appointment: Appointment,
    resources: any,
    direction: 'earlier' | 'later',
    maxHours: number
  ): Promise<{ start: Date; end: Date; score: number }[]> {
    const slots: { start: Date; end: Date; score: number }[] = [];
    const duration = new Date(appointment.end_time).getTime() - new Date(appointment.start_time).getTime();
    const originalStart = new Date(appointment.start_time);
    
    const searchStart = direction === 'earlier' 
      ? new Date(originalStart.getTime() - (maxHours * 60 * 60 * 1000))
      : originalStart;
    
    const searchEnd = direction === 'later'
      ? new Date(originalStart.getTime() + (maxHours * 60 * 60 * 1000))
      : originalStart;

    // Generate potential slots (every 15 minutes)
    for (let time = searchStart.getTime(); time <= searchEnd.getTime(); time += 15 * 60 * 1000) {
      const slotStart = new Date(time);
      const slotEnd = new Date(time + duration);
      
      // Check if slot is within business hours
      if (!this.isWithinBusinessHours(slotStart, slotEnd)) continue;
      
      // Check if slot is available
      const isAvailable = await this.isSlotAvailable(slotStart, slotEnd, appointment, resources);
      if (!isAvailable) continue;
      
      // Calculate score based on various factors
      const score = this.calculateSlotScore(slotStart, originalStart, appointment);
      
      slots.push({ start: slotStart, end: slotEnd, score });
    }

    // Sort by score and return top options
    return slots.sort((a, b) => b.score - a.score).slice(0, 5);
  }

  private async findAlternativeStaff(
    appointment: Appointment,
    allStaff: Staff[],
    startTime: Date,
    endTime: Date
  ): Promise<Staff[]> {
    const alternatives: Staff[] = [];
    
    for (const staff of allStaff) {
      if (staff.id === appointment.staff_id) continue;
      if (!staff.active) continue;
      
      // Check availability
      const isAvailable = await this.isStaffAvailable(staff.id, startTime, endTime);
      if (!isAvailable) continue;
      
      // Check qualifications
      const isQualified = await this.isStaffQualified(staff, appointment);
      if (!isQualified) continue;
      
      alternatives.push(staff);
    }
    
    return alternatives;
  }

  private async findAlternativeRooms(
    appointment: Appointment,
    allRooms: Room[],
    startTime: Date,
    endTime: Date
  ): Promise<Room[]> {
    const alternatives: Room[] = [];
    
    for (const room of allRooms) {
      if (room.id === appointment.room_id) continue;
      if (!room.active) continue;
      
      // Check availability
      const isAvailable = await this.isRoomAvailable(room.id, startTime, endTime);
      if (!isAvailable) continue;
      
      // Check suitability
      const isSuitable = await this.isRoomSuitable(room, appointment);
      if (!isSuitable) continue;
      
      alternatives.push(room);
    }
    
    return alternatives;
  }

  /**
   * Utility methods
   */
  private isWithinBusinessHours(start: Date, end: Date): boolean {
    const businessStart = this.parseTime(this.constraints.businessHours.start);
    const businessEnd = this.parseTime(this.constraints.businessHours.end);
    
    const startTime = start.getHours() * 60 + start.getMinutes();
    const endTime = end.getHours() * 60 + end.getMinutes();
    
    return startTime >= businessStart && endTime <= businessEnd;
  }

  private parseTime(timeStr: string): number {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private calculateSlotScore(slotStart: Date, originalStart: Date, appointment: Appointment): number {
    let score = 1.0;
    
    // Prefer slots closer to original time
    const timeDiff = Math.abs(slotStart.getTime() - originalStart.getTime()) / (1000 * 60 * 60);
    score -= timeDiff * 0.1;
    
    // Prefer slots during preferred hours
    const hour = slotStart.getHours();
    if (hour >= 9 && hour <= 17) {
      score += 0.2;
    }
    
    // Prefer weekdays
    const dayOfWeek = slotStart.getDay();
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      score += 0.1;
    }
    
    return Math.max(0, score);
  }

  private calculateConfidence(slot: any, appointment: Appointment, resources: any): number {
    // Base confidence
    let confidence = 0.8;
    
    // Adjust based on slot score
    confidence += slot.score * 0.2;
    
    // Adjust based on resource availability
    if (resources.staff && resources.rooms) {
      confidence += 0.1;
    }
    
    return Math.min(1.0, confidence);
  }

  private calculateEstimatedTime(changes: ProposedChanges): number {
    let time = 0;
    
    if (changes.appointments) time += changes.appointments.length * 2;
    if (changes.staffAssignments) time += changes.staffAssignments.length * 3;
    if (changes.roomAssignments) time += changes.roomAssignments.length * 5;
    if (changes.equipmentAssignments) time += changes.equipmentAssignments.length * 2;
    
    return Math.max(5, time);
  }

  private calculateCost(changes: ProposedChanges): number {
    let cost = 0.1; // Base cost
    
    if (changes.appointments) cost += changes.appointments.length * 0.1;
    if (changes.staffAssignments) cost += changes.staffAssignments.length * 0.2;
    if (changes.roomAssignments) cost += changes.roomAssignments.length * 0.15;
    
    return Math.min(1.0, cost);
  }

  private calculateFeasibility(changes: ProposedChanges, resources: any): number {
    // Base feasibility
    let feasibility = 0.9;
    
    // Reduce based on complexity
    const complexity = Object.keys(changes).length;
    feasibility -= complexity * 0.1;
    
    return Math.max(0.1, feasibility);
  }

  private generatePros(strategy: ResolutionStrategy, impact: ResolutionImpact): string[] {
    const pros: string[] = [];
    
    if (impact.patientSatisfaction > 0) pros.push('Improves patient satisfaction');
    if (impact.staffWorkload > 0) pros.push('Balances staff workload');
    if (impact.resourceUtilization > 0) pros.push('Optimizes resource usage');
    if (impact.operationalEfficiency > 0) pros.push('Increases operational efficiency');
    
    switch (strategy) {
      case ResolutionStrategy.RESCHEDULE_LATER:
      case ResolutionStrategy.RESCHEDULE_EARLIER:
        pros.push('Maintains original resources', 'Quick to implement');
        break;
      case ResolutionStrategy.CHANGE_STAFF:
        pros.push('Utilizes available staff', 'Maintains original time');
        break;
      case ResolutionStrategy.CHANGE_ROOM:
        pros.push('Maintains original time', 'May provide better facilities');
        break;
    }
    
    return pros;
  }

  private generateCons(strategy: ResolutionStrategy, impact: ResolutionImpact): string[] {
    const cons: string[] = [];
    
    if (impact.patientSatisfaction < 0) cons.push('May reduce patient satisfaction');
    if (impact.staffWorkload < 0) cons.push('May increase staff workload');
    if (impact.resourceUtilization < 0) cons.push('May reduce resource efficiency');
    
    switch (strategy) {
      case ResolutionStrategy.RESCHEDULE_LATER:
      case ResolutionStrategy.RESCHEDULE_EARLIER:
        cons.push('Changes appointment time', 'May inconvenience patient');
        break;
      case ResolutionStrategy.CHANGE_STAFF:
        cons.push('Different staff member', 'May affect continuity of care');
        break;
      case ResolutionStrategy.CHANGE_ROOM:
        cons.push('Different location', 'May require patient notification');
        break;
    }
    
    return cons;
  }

  private createEmptyImpact(): ResolutionImpact {
    return {
      patientSatisfaction: 0,
      staffWorkload: 0,
      resourceUtilization: 0,
      operationalEfficiency: 0,
      financialImpact: 0,
      overallScore: 0
    };
  }

  private createNeutralImpact(): ResolutionImpact {
    return {
      patientSatisfaction: 0,
      staffWorkload: 0,
      resourceUtilization: 0,
      operationalEfficiency: 0.1,
      financialImpact: 0,
      overallScore: 0.1
    };
  }

  // Placeholder methods for database operations
  private async getConflictById(conflictId: string): Promise<ConflictDetails | null> {
    // Implementation would fetch from conflicts table
    return null;
  }

  private async getResolutionById(resolutionId: string): Promise<ResolutionOption | null> {
    // Implementation would fetch from resolutions table
    return null;
  }

  private async getAppointmentsByIds(ids: string[]): Promise<Appointment[]> {
    const { data, error } = await this.supabase
      .from('appointments')
      .select('*')
      .in('id', ids);
    
    if (error) throw error;
    return data || [];
  }

  private async getAppointmentById(id: string): Promise<Appointment | null> {
    const { data, error } = await this.supabase
      .from('appointments')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) return null;
    return data;
  }

  private async getStaffById(id: string): Promise<Staff | null> {
    const { data, error } = await this.supabase
      .from('staff')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) return null;
    return data;
  }

  private async getRoomById(id: string): Promise<Room | null> {
    const { data, error } = await this.supabase
      .from('rooms')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) return null;
    return data;
  }

  private async getAffectedResources(conflict: ConflictDetails): Promise<any> {
    const resources: any = {};
    
    if (conflict.affectedResources.staff) {
      const { data } = await this.supabase
        .from('staff')
        .select('*')
        .in('id', conflict.affectedResources.staff);
      resources.staff = data || [];
    }
    
    if (conflict.affectedResources.rooms) {
      const { data } = await this.supabase
        .from('rooms')
        .select('*')
        .in('id', conflict.affectedResources.rooms);
      resources.rooms = data || [];
    }
    
    if (conflict.affectedResources.equipment) {
      const { data } = await this.supabase
        .from('equipment')
        .select('*')
        .in('id', conflict.affectedResources.equipment);
      resources.equipment = data || [];
    }
    
    return resources;
  }

  // Additional placeholder methods
  private async isSlotAvailable(start: Date, end: Date, appointment: Appointment, resources: any): Promise<boolean> {
    return true; // Simplified implementation
  }

  private async isStaffAvailable(staffId: string, start: Date, end: Date): Promise<boolean> {
    return true; // Simplified implementation
  }

  private async isRoomAvailable(roomId: string, start: Date, end: Date): Promise<boolean> {
    return true; // Simplified implementation
  }

  private async isStaffQualified(staff: Staff, appointment: Appointment): Promise<boolean> {
    return true; // Simplified implementation
  }

  private async isRoomSuitable(room: Room, appointment: Appointment): Promise<boolean> {
    return true; // Simplified implementation
  }

  private async getStaffCurrentWorkload(staffId: string): Promise<number> {
    return 0.5; // Simplified implementation
  }

  private async getRoomUtilization(roomId: string): Promise<number> {
    return 0.6; // Simplified implementation
  }

  private calculateFinancialImpact(changes: ProposedChanges): number {
    return 0; // Simplified implementation
  }

  private async validateFeasibility(resolution: ResolutionOption): Promise<number> {
    return resolution.feasibility; // Simplified implementation
  }

  private async validateBusinessConstraints(resolution: ResolutionOption): Promise<string[]> {
    return []; // Simplified implementation
  }

  private async generateNotifications(resolution: ResolutionOption, result: any): Promise<any[]> {
    return []; // Simplified implementation
  }

  private async calculateActualImpact(resolution: ResolutionOption, result: any): Promise<ResolutionImpact> {
    return resolution.impact; // Simplified implementation
  }

  private async logResolutionApplication(resolutionId: string, result: any, impact: ResolutionImpact): Promise<void> {
    // Log to database
  }

  private clearRelatedCaches(resolution: ResolutionOption): void {
    this.resolutionCache.clear();
  }

  private async generateSplitOptions(appointment: Appointment): Promise<ResolutionOption[]> {
    return []; // Simplified implementation
  }

  private async generateMergeOptions(appointments: Appointment[]): Promise<ResolutionOption[]> {
    return []; // Simplified implementation
  }

  private async generateExtendHoursOption(conflict: ConflictDetails, appointments: Appointment[]): Promise<ResolutionOption | null> {
    return null; // Simplified implementation
  }

  private async generateDelegateOptions(appointments: Appointment[], resources: any): Promise<ResolutionOption[]> {
    return []; // Simplified implementation
  }

  private calculateStaffChangeConfidence(staff: Staff, appointment: Appointment): number {
    return 0.8; // Simplified implementation
  }

  private calculateStaffChangeCost(staff: Staff, appointment: Appointment): number {
    return 0.2; // Simplified implementation
  }

  private calculateStaffChangeFeasibility(staff: Staff, appointment: Appointment): number {
    return 0.9; // Simplified implementation
  }

  private calculateRoomChangeConfidence(room: Room, appointment: Appointment): number {
    return 0.8; // Simplified implementation
  }

  private calculateRoomChangeCost(room: Room, appointment: Appointment): number {
    return 0.15; // Simplified implementation
  }

  private calculateRoomChangeFeasibility(room: Room, appointment: Appointment): number {
    return 0.9; // Simplified implementation
  }

  /**
   * Clear all caches
   */
  clearCache(): void {
    this.resolutionCache.clear();
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<OptimizationConfig>): void {
    this.config = { ...this.config, ...config };
    this.clearCache();
  }

  /**
   * Update constraints
   */
  updateConstraints(constraints: Partial<OptimizationConstraints>): void {
    this.constraints = { ...this.constraints, ...constraints };
    this.clearCache();
  }
}
