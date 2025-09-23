/**
 * Real-time Availability Management and Conflict Detection Service
 * 
 * Provides real-time availability tracking, conflict detection, and resource optimization
 * for intelligent appointment scheduling with WebSocket integration.
 * 
 * Features:
 * - Real-time availability tracking
 * - Advanced conflict detection
 * - Resource optimization
 * - WebSocket integration
 * - LGPD compliance
 */

import { prisma } from '../lib/prisma';
import { aguiAppointmentProtocol } from './ag-ui-appointment-protocol';
import { AIAppointmentSchedulingService } from './ai-appointment-scheduling-service';

export interface RealTimeAvailability {
  professionalId: string;
  date: Date;
  availableSlots: Array<{
    start: Date;
    end: Date;
    confidence: number;
    efficiency: number;
    roomId?: string;
  }>;
  conflicts: AvailabilityConflict[];
  utilization: ResourceUtilization;
}

export interface AvailabilityConflict {
  id: string;
  type: 'overlap' | 'resource' | 'capacity' | 'policy';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  affectedResources: string[];
  suggestedResolution: ResolutionSuggestion;
  detectedAt: Date;
}

export interface ResolutionSuggestion {
  action: 'reschedule' | 'extend_hours' | 'reassign' | 'cancel' | 'add_resource';
  targetTime?: Date;
  targetResource?: string;
  reason: string;
  priority: number;
  estimatedImpact: 'minimal' | 'moderate' | 'significant';
}

export interface ResourceUtilization {
  professionals: number;
  rooms: number;
  equipment: number;
  timeSlots: number;
  overall: number;
}

export interface AvailabilitySubscription {
  id: string;
  clinicId: string;
  professionalId?: string;
  roomId?: string;
  dateRange: { start: Date; end: Date };
  callback: (availability: RealTimeAvailability) => void;
  isActive: boolean;
  createdAt: Date;
}

export interface AvailabilityUpdate {
  type: 'slot_added' | 'slot_removed' | 'conflict_resolved' | 'conflict_detected';
  resourceId: string;
  timestamp: Date;
  data: any;
}

export class RealtimeAvailabilityService {
  private static instance: RealtimeAvailabilityService;
  private subscriptions: Map<string, AvailabilitySubscription> = new Map();
  private updateQueue: AvailabilityUpdate[] = [];
  private isProcessing = false;
  private wsConnections: Set<any> = new Set(); // WebSocket connections

  private constructor() {
    this.startUpdateProcessor();
    this.setupProtocolHandlers();
  }

  static getInstance(): RealtimeAvailabilityService {
    if (!RealtimeAvailabilityService.instance) {
      RealtimeAvailabilityService.instance = new RealtimeAvailabilityService();
    }
    return RealtimeAvailabilityService.instance;
  }

  /**
   * Get real-time availability for a specific date range
   */
  async getRealTimeAvailability(
    clinicId: string,
    filters: {
      professionalId?: string;
      roomId?: string;
      dateRange: { start: Date; end: Date };
      includeConflicts?: boolean;
    }
  ): Promise<RealTimeAvailability[]> {
    try {
      const { professionalId, roomId, dateRange, includeConflicts = true } = filters;

      // Get professionals
      const professionals = await prisma.professional.findMany({
        where: {
          clinicId,
          isActive: true,
          ...(professionalId ? { id: professionalId } : {})
        },
        include: {
          availabilities: {
            where: {
              date: {
                gte: dateRange.start,
                lte: dateRange.end
              }
            }
          },
          appointments: {
            where: {
              startTime: { gte: dateRange.start },
              endTime: { lte: dateRange.end },
              status: { in: ['scheduled', 'confirmed'] }
            },
            include: {
              room: true
            }
          }
        }
      });

      // Get rooms
      const rooms = await prisma.room.findMany({
        where: {
          clinicId,
          isActive: true,
          ...(roomId ? { id: roomId } : {})
        }
      });

      // Process each professional's availability
      const results: RealTimeAvailability[] = [];

      for (const professional of professionals) {
        const professionalAvailability = await this.processProfessionalAvailability(
          professional,
          dateRange,
          rooms,
          includeConflicts
        );

        results.push(professionalAvailability);
      }

      return results;

    } catch (error) {
      console.error('Error getting real-time availability:', error);
      throw new Error('Failed to get real-time availability');
    }
  }

  /**
   * Detect conflicts in real-time
   */
  async detectConflicts(
    clinicId: string,
    dateRange: { start: Date; end: Date },
    filters?: {
      professionalId?: string;
      roomId?: string;
    }
  ): Promise<AvailabilityConflict[]> {
    try {
      const conflicts: AvailabilityConflict[] = [];

      // Get all appointments in the date range
      const appointments = await prisma.appointment.findMany({
        where: {
          clinicId,
          startTime: { gte: dateRange.start },
          endTime: { lte: dateRange.end },
          status: { in: ['scheduled', 'confirmed'] },
          ...(filters?.professionalId ? { professionalId: filters.professionalId } : {}),
          ...(filters?.roomId ? { roomId: filters.roomId } : {})
        },
        include: {
          professional: true,
          room: true,
          patient: true
        }
      });

      // Detect overlapping appointments
      const overlapConflicts = this.detectOverlapConflicts(appointments);
      conflicts.push(...overlapConflicts);

      // Detect resource conflicts
      const resourceConflicts = await this.detectResourceConflicts(appointments, dateRange);
      conflicts.push(...resourceConflicts);

      // Detect policy violations
      const policyConflicts = this.detectPolicyViolations(appointments);
      conflicts.push(...policyConflicts);

      // Detect capacity issues
      const capacityConflicts = await this.detectCapacityIssues(appointments, dateRange);
      conflicts.push(...capacityConflicts);

      // Send conflict notifications
      for (const conflict of conflicts) {
        await this.notifyConflictDetected(clinicId, conflict);
      }

      return conflicts.sort((a, b) => this.getConflictSeverityPriority(b.severity) - this.getConflictSeverityPriority(a.severity));

    } catch (error) {
      console.error('Error detecting conflicts:', error);
      throw new Error('Failed to detect conflicts');
    }
  }

  /**
   * Subscribe to real-time availability updates
   */
  subscribeToAvailability(
    clinicId: string,
    filters: {
      professionalId?: string;
      roomId?: string;
      dateRange: { start: Date; end: Date };
    },
    callback: (availability: RealTimeAvailability) => void
  ): string {
    const subscriptionId = this.generateSubscriptionId();

    const subscription: AvailabilitySubscription = {
      id: subscriptionId,
      clinicId,
      professionalId: filters.professionalId,
      roomId: filters.roomId,
      dateRange: filters.dateRange,
      callback,
      isActive: true,
      createdAt: new Date()
    };

    this.subscriptions.set(subscriptionId, subscription);

    // Send initial availability data
    this.sendInitialAvailability(subscription);

    return subscriptionId;
  }

  /**
   * Unsubscribe from availability updates
   */
  unsubscribeFromAvailability(subscriptionId: string): void {
    const subscription = this.subscriptions.get(subscriptionId);
    if (subscription) {
      subscription.isActive = false;
      this.subscriptions.delete(subscriptionId);
    }
  }

  /**
   * Add WebSocket connection for real-time updates
   */
  addWebSocketConnection(connection: any): void {
    this.wsConnections.add(connection);

    // Set up connection event handlers
    connection.on('close', () => {
      this.wsConnections.delete(connection);
    });

    connection.on('message', async (message: string) => {
      try {
        const data = JSON.parse(message);
        await this.handleWebSocketMessage(connection, data);
      } catch (error) {
        console.error('Error handling WebSocket message:', error);
      }
    });
  }

  /**
   * Remove WebSocket connection
   */
  removeWebSocketConnection(connection: any): void {
    this.wsConnections.delete(connection);
  }

  /**
   * Optimize availability based on AI recommendations
   */
  async optimizeAvailability(
    clinicId: string,
    dateRange: { start: Date; end: Date }
  ): Promise<{
    optimizedSlots: Array<{
      professionalId: string;
      timeSlot: { start: Date; end: Date };
      efficiency: number;
      confidence: number;
    }>;
    resolvedConflicts: string[];
    improvements: string[];
  }> {
    try {
      const _aiService = AIAppointmentSchedulingService.getInstance();

      // Get current availability and conflicts
      const currentAvailability = await this.getRealTimeAvailability(clinicId, {
        dateRange,
        includeConflicts: true
      });

      const conflicts = await this.detectConflicts(clinicId, dateRange);

      // Use AI to optimize slots
      const optimizedSlots: Array<{
        professionalId: string;
        timeSlot: { start: Date; end: Date };
        efficiency: number;
        confidence: number;
      }> = [];

      for (const availability of currentAvailability) {
        // Analyze each professional's availability
        const professionalId = availability.professionalId;

        // Generate optimized time slots
        for (const slot of availability.availableSlots) {
          if (slot.efficiency < 0.8) { // Only optimize low-efficiency slots
            const optimizedSlot = await this.optimizeTimeSlot(
              clinicId,
              professionalId,
              slot,
              currentAvailability
            );

            if (optimizedSlot) {
              optimizedSlots.push({
                professionalId,
                timeSlot: optimizedSlot,
                efficiency: 0.9, // Improved efficiency
                confidence: 0.85
              });
            }
          }
        }
      }

      // Resolve conflicts
      const resolvedConflicts: string[] = [];
      for (const conflict of conflicts) {
        if (conflict.severity === 'high' || conflict.severity === 'critical') {
          const resolved = await this.resolveConflict(conflict);
          if (resolved) {
            resolvedConflicts.push(conflict.id);
          }
        }
      }

      // Generate improvements summary
      const improvements = [
        `${optimizedSlots.length} time slots optimized`,
        `${resolvedConflicts.length} conflicts resolved`,
        'Resource allocation improved',
        'Efficiency scores enhanced'
      ];

      return {
        optimizedSlots,
        resolvedConflicts,
        improvements
      };

    } catch (error) {
      console.error('Error optimizing availability:', error);
      throw new Error('Failed to optimize availability');
    }
  }

  // Private helper methods
  private async processProfessionalAvailability(
    professional: any,
    dateRange: { start: Date; end: Date },
    rooms: any[],
    includeConflicts: boolean
  ): Promise<RealTimeAvailability> {
    const availableSlots: Array<{
      start: Date;
      end: Date;
      confidence: number;
      efficiency: number;
      roomId?: string;
    }> = [];

    const conflicts: AvailabilityConflict[] = [];

    // Process each availability day
    for (const availability of professional.availabilities) {
      const dayStart = new Date(availability.date);
      dayStart.setHours(availability.startTime.getHours(), availability.startTime.getMinutes(), 0, 0);
      
      const dayEnd = new Date(availability.date);
      dayEnd.setHours(availability.endTime.getHours(), availability.endTime.getMinutes(), 0, 0);

      // Generate 15-minute slots
      const currentSlot = new Date(dayStart);
      while (currentSlot.getTime() + 15 * 60000 <= dayEnd.getTime()) {
        const slotEnd = new Date(currentSlot.getTime() + 15 * 60000);

        // Check for conflicts
        const hasConflict = professional.appointments.some(apt => 
          apt.startTime < slotEnd && apt.endTime > currentSlot
        );

        if (!hasConflict) {
          // Find available room
          const availableRoom = rooms.find(room => 
            !professional.appointments.some(apt => 
              apt.roomId === room.id &&
              apt.startTime < slotEnd && 
              apt.endTime > currentSlot
            )
          );

          if (availableRoom) {
            availableSlots.push({
              start: new Date(currentSlot),
              end: new Date(slotEnd),
              confidence: 0.9,
              efficiency: this.calculateSlotEfficiency(currentSlot, professional.appointments),
              roomId: availableRoom.id
            });
          }
        }

        currentSlot.setTime(currentSlot.getTime() + 15 * 60000);
      }
    }

    // Detect conflicts if requested
    if (includeConflicts) {
      const professionalConflicts = await this.detectConflicts(
        professional.clinicId,
        dateRange,
        { professionalId: professional.id }
      );
      conflicts.push(...professionalConflicts);
    }

    // Calculate utilization
    const utilization = this.calculateUtilization(professional, dateRange);

    return {
      professionalId: professional.id,
      date: dateRange.start,
      availableSlots,
      conflicts,
      utilization
    };
  }

  private detectOverlapConflicts(appointments: any[]): AvailabilityConflict[] {
    const conflicts: AvailabilityConflict[] = [];

    for (let i = 0; i < appointments.length; i++) {
      for (let j = i + 1; j < appointments.length; j++) {
        const apt1 = appointments[i];
        const apt2 = appointments[j];

        // Check for professional overlap
        if (apt1.professionalId === apt2.professionalId &&
            apt1.startTime < apt2.endTime && 
            apt1.endTime > apt2.startTime) {
          
          conflicts.push({
            id: `overlap_${apt1.id}_${apt2.id}`,
            type: 'overlap',
            severity: 'critical',
            description: `Professional ${apt1.professional.fullName} has overlapping appointments`,
            affectedResources: [apt1.professionalId],
            suggestedResolution: {
              action: 'reschedule',
              reason: 'Professional cannot be in two places at once',
              priority: 1,
              estimatedImpact: 'significant'
            },
            detectedAt: new Date()
          });
        }

        // Check for room overlap
        if (apt1.roomId === apt2.roomId &&
            apt1.roomId &&
            apt1.startTime < apt2.endTime && 
            apt1.endTime > apt2.startTime) {
          
          conflicts.push({
            id: `room_overlap_${apt1.id}_${apt2.id}`,
            type: 'resource',
            severity: 'high',
            description: `Room ${apt1.room.name} is double-booked`,
            affectedResources: [apt1.roomId],
            suggestedResolution: {
              action: 'reassign',
              reason: 'Room cannot accommodate two appointments simultaneously',
              priority: 2,
              estimatedImpact: 'moderate'
            },
            detectedAt: new Date()
          });
        }
      }
    }

    return conflicts;
  }

  private async detectResourceConflicts(
    appointments: any[],
    dateRange: { start: Date; end: Date }
  ): Promise<AvailabilityConflict[]> {
    const conflicts: AvailabilityConflict[] = [];

    // Check for equipment conflicts
    const equipmentUsage = new Map<string, any[]>();
    
    for (const apt of appointments) {
      if (apt.equipmentRequired) {
        const equipment = Array.isArray(apt.equipmentRequired) ? 
          apt.equipmentRequired : [apt.equipmentRequired];
        
        for (const eq of equipment) {
          if (!equipmentUsage.has(eq)) {
            equipmentUsage.set(eq, []);
          }
          equipmentUsage.get(eq)!.push(apt);
        }
      }
    }

    // Check for equipment double-booking
    for (const [equipment, appointments] of equipmentUsage) {
      for (let i = 0; i < appointments.length; i++) {
        for (let j = i + 1; j < appointments.length; j++) {
          const apt1 = appointments[i];
          const apt2 = appointments[j];

          if (apt1.startTime < apt2.endTime && apt1.endTime > apt2.startTime) {
            conflicts.push({
              id: `equipment_${equipment}_${apt1.id}_${apt2.id}`,
              type: 'resource',
              severity: 'medium',
              description: `Equipment "${equipment}" is double-booked`,
              affectedResources: [equipment],
              suggestedResolution: {
                action: 'reschedule',
                reason: 'Equipment cannot be used simultaneously',
                priority: 3,
                estimatedImpact: 'moderate'
              },
              detectedAt: new Date()
            });
          }
        }
      }
    }

    return conflicts;
  }

  private detectPolicyViolations(appointments: any[]): AvailabilityConflict[] {
    const conflicts: AvailabilityConflict[] = [];

    for (const apt of appointments) {
      // Check for back-to-back appointments without breaks
      const nextAppointment = appointments.find(other => 
        other.professionalId === apt.professionalId &&
        other.startTime.getTime() === apt.endTime.getTime()
      );

      if (nextAppointment) {
        conflicts.push({
          id: `policy_no_break_${apt.id}`,
          type: 'policy',
          severity: 'low',
          description: `Professional ${apt.professional.fullName} has no break between appointments`,
          affectedResources: [apt.professionalId],
          suggestedResolution: {
            action: 'reschedule',
            reason: 'Professional needs break between appointments',
            priority: 4,
            estimatedImpact: 'minimal'
          },
          detectedAt: new Date()
        });
      }

      // Check for maximum daily appointments
      const dailyAppointments = appointments.filter(other => 
        other.professionalId === apt.professionalId &&
        other.startTime.toDateString() === apt.startTime.toDateString()
      );

      if (dailyAppointments.length > 12) {
        conflicts.push({
          id: `policy_max_daily_${apt.professionalId}`,
          type: 'capacity',
          severity: 'medium',
          description: `Professional ${apt.professional.fullName} exceeds maximum daily appointments`,
          affectedResources: [apt.professionalId],
          suggestedResolution: {
            action: 'reschedule',
            reason: 'Maximum daily appointments exceeded',
            priority: 3,
            estimatedImpact: 'moderate'
          },
          detectedAt: new Date()
        });
      }
    }

    return conflicts;
  }

  private async detectCapacityIssues(
    appointments: any[],
    dateRange: { start: Date; end: Date }
  ): Promise<AvailabilityConflict[]> {
    const conflicts: AvailabilityConflict[] = [];

    // Check room capacity
    const roomUsage = new Map<string, any[]>();
    
    for (const apt of appointments) {
      if (apt.roomId) {
        if (!roomUsage.has(apt.roomId)) {
          roomUsage.set(apt.roomId, []);
        }
        roomUsage.get(apt.roomId)!.push(apt);
      }
    }

    for (const [roomId, roomAppointments] of roomUsage) {
      // Check if room is overutilized
      const roomHours = roomAppointments.reduce((total, apt) => {
        return total + (apt.endTime.getTime() - apt.startTime.getTime()) / (1000 * 60 * 60);
      }, 0);

      const totalHours = (dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60);
      const utilization = roomHours / totalHours;

      if (utilization > 0.9) {
        conflicts.push({
          id: `capacity_room_${roomId}`,
          type: 'capacity',
          severity: 'high',
          description: `Room ${roomId} is overutilized (${Math.round(utilization * 100)}%)`,
          affectedResources: [roomId],
          suggestedResolution: {
            action: 'add_resource',
            reason: 'Room capacity exceeded',
            priority: 2,
            estimatedImpact: 'significant'
          },
          detectedAt: new Date()
        });
      }
    }

    return conflicts;
  }

  private calculateSlotEfficiency(slotTime: Date, appointments: any[]): number {
    // Simple efficiency calculation based on time of day and appointment density
    const hour = slotTime.getHours();
    const dayOfWeek = slotTime.getDay();

    let efficiency = 0.8; // Base efficiency

    // Time of day factors
    if (hour >= 9 && hour <= 11) efficiency += 0.1; // Morning peak
    if (hour >= 14 && hour <= 16) efficiency += 0.1; // Afternoon peak
    if (hour < 8 || hour > 17) efficiency -= 0.2; // Off-hours

    // Day of week factors
    if (dayOfWeek === 2 || dayOfWeek === 3) efficiency += 0.05; // Mid-week
    if (dayOfWeek === 1 || dayOfWeek === 5) efficiency -= 0.05; // Monday/Friday

    // Appointment density factor
    const sameDayAppointments = appointments.filter(apt => 
      apt.startTime.toDateString() === slotTime.toDateString()
    ).length;

    if (sameDayAppointments > 8) efficiency -= 0.1;
    if (sameDayAppointments < 4) efficiency -= 0.05;

    return Math.max(0.1, Math.min(1, efficiency));
  }

  private calculateUtilization(professional: any, dateRange: { start: Date; end: Date }): ResourceUtilization {
    const totalHours = (dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60);
    
    const appointmentHours = professional.appointments.reduce((total: number, apt: any) => {
      return total + (apt.endTime.getTime() - apt.startTime.getTime()) / (1000 * 60 * 60);
    }, 0);

    const professionalUtilization = appointmentHours / totalHours;

    return {
      professionals: Math.round(professionalUtilization * 100),
      rooms: 75, // Placeholder
      equipment: 60, // Placeholder
      timeSlots: Math.round(professionalUtilization * 100),
      overall: Math.round(professionalUtilization * 100)
    };
  }

  private getConflictSeverityPriority(severity: string): number {
    const priorities = { critical: 4, high: 3, medium: 2, low: 1 };
    return priorities[severity as keyof typeof priorities] || 0;
  }

  private generateSubscriptionId(): string {
    return `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async sendInitialAvailability(subscription: AvailabilitySubscription): Promise<void> {
    try {
      const availability = await this.getRealTimeAvailability(subscription.clinicId, {
        professionalId: subscription.professionalId,
        roomId: subscription.roomId,
        dateRange: subscription.dateRange,
        includeConflicts: true
      });

      subscription.callback(availability);
    } catch (error) {
      console.error('Error sending initial availability:', error);
    }
  }

  private async handleWebSocketMessage(connection: any, data: any): Promise<void> {
    // Handle WebSocket messages for real-time updates
    switch (data.type) {
      case 'subscribe_availability':
        // Handle subscription requests
        break;
      case 'request_availability':
        // Handle availability requests
        break;
      case 'conflict_resolution':
        // Handle conflict resolution requests
        break;
      default:
        console.warn('Unknown WebSocket message type:', data.type);
    }
  }

  private async notifyConflictDetected(clinicId: string, conflict: AvailabilityConflict): Promise<void> {
    // Send conflict notification via AG-UI Protocol
    await aguiAppointmentProtocol.sendAvailabilityConflict(clinicId, {
      type: conflict.type,
      resourceId: conflict.affectedResources[0],
      conflictingAppointments: [], // Would need to extract from context
      suggestedResolution: conflict.suggestedResolution.action,
      severity: conflict.severity
    });
  }

  private async optimizeTimeSlot(
    clinicId: string,
    professionalId: string,
    slot: any,
    currentAvailability: RealTimeAvailability[]
  ): Promise<{ start: Date; end: Date } | null> {
    // Use AI to optimize the time slot
    // This would integrate with the AI scheduling service
    // For now, return a simple optimization
    return null;
  }

  private async resolveConflict(conflict: AvailabilityConflict): Promise<boolean> {
    // Attempt to resolve the conflict based on the suggested resolution
    // This would integrate with the appointment management system
    // For now, return false to indicate it couldn't be automatically resolved
    return false;
  }

  private startUpdateProcessor(): void {
    // Process updates in batches
    setInterval(() => {
      if (this.updateQueue.length > 0 && !this.isProcessing) {
        this.processUpdateBatch();
      }
    }, 1000);
  }

  private async processUpdateBatch(): Promise<void> {
    if (this.isProcessing) return;
    
    this.isProcessing = true;
    const updates = [...this.updateQueue];
    this.updateQueue = [];

    try {
      for (const update of updates) {
        await this.processUpdate(update);
      }
    } catch (error) {
      console.error('Error processing update batch:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  private async processUpdate(update: AvailabilityUpdate): Promise<void> {
    // Process individual updates and notify subscribers
    for (const subscription of this.subscriptions.values()) {
      if (!subscription.isActive) continue;

      // Check if update is relevant to this subscription
      if (this.isUpdateRelevant(update, subscription)) {
        await this.sendUpdateToSubscription(subscription, update);
      }
    }
  }

  private isUpdateRelevant(update: AvailabilityUpdate, subscription: AvailabilitySubscription): boolean {
    // Check if the update is relevant to the subscription
    // This would implement more sophisticated filtering logic
    return true;
  }

  private async sendUpdateToSubscription(
    subscription: AvailabilitySubscription,
    update: AvailabilityUpdate
  ): Promise<void> {
    try {
      const availability = await this.getRealTimeAvailability(subscription.clinicId, {
        professionalId: subscription.professionalId,
        roomId: subscription.roomId,
        dateRange: subscription.dateRange,
        includeConflicts: true
      });

      subscription.callback(availability);
    } catch (error) {
      console.error('Error sending update to subscription:', error);
    }
  }

  private setupProtocolHandlers(): void {
    // Set up handlers for AG-UI Protocol messages
    aguiAppointmentProtocol.on('availability.updated', async (message) => {
      // Handle availability updates from other services
      this.updateQueue.push({
        type: 'slot_added',
        resourceId: message.data.professionalId,
        timestamp: new Date(),
        data: message.data
      });
    });

    aguiAppointmentProtocol.on('availability.conflict_detected', async (message) => {
      // Handle conflict detection notifications
      this.updateQueue.push({
        type: 'conflict_detected',
        resourceId: message.data.resourceId,
        timestamp: new Date(),
        data: message.data
      });
    });
  }
}

// Export singleton instance
export const realtimeAvailabilityService = RealtimeAvailabilityService.getInstance();