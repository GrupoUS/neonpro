/**
 * Intelligent Conflict Detection Engine
 * Advanced system for detecting scheduling conflicts, resource conflicts, and optimization opportunities
 */

import type { createClient } from "@supabase/supabase-js";
import type {
  ConflictDetails,
  ConflictType,
  ConflictSeverity,
  ConflictDetectionConfig,
  ConflictDetectionParams,
  ResourceAvailability,
  WorkloadMetrics,
  ConflictPrediction,
  PatternAnalysis,
} from "./types";
import type { Database } from "@/types/supabase";

type Appointment = Database["public"]["Tables"]["appointments"]["Row"];
type Staff = Database["public"]["Tables"]["staff"]["Row"];
type Room = Database["public"]["Tables"]["rooms"]["Row"];
type Equipment = Database["public"]["Tables"]["equipment"]["Row"];

export class ConflictDetectionEngine {
  private supabase;
  private config: ConflictDetectionConfig;
  private cache: Map<string, any> = new Map();
  private patterns: PatternAnalysis | null = null;

  constructor(
    supabaseUrl: string,
    supabaseKey: string,
    config: Partial<ConflictDetectionConfig> = {},
  ) {
    this.supabase = createClient<Database>(supabaseUrl, supabaseKey);
    this.config = {
      enableTimeOverlapDetection: true,
      enableResourceConflictDetection: true,
      enableStaffConflictDetection: true,
      enableRoomConflictDetection: true,
      enableEquipmentConflictDetection: true,
      bufferTimeMinutes: 15,
      maxLookaheadDays: 30,
      conflictSeverityThreshold: ConflictSeverity.MEDIUM,
      ...config,
    };
  }

  /**
   * Main conflict detection method
   */
  async detectConflicts(params: ConflictDetectionParams): Promise<ConflictDetails[]> {
    try {
      const conflicts: ConflictDetails[] = [];
      const cacheKey = this.generateCacheKey("conflicts", params);

      // Check cache first
      if (this.cache.has(cacheKey)) {
        return this.cache.get(cacheKey);
      }

      // Get appointments in date range
      const appointments = await this.getAppointmentsInRange(
        params.dateRange.start,
        params.dateRange.end,
      );

      // Get resources
      const [staff, rooms, equipment] = await Promise.all([
        this.getStaff(),
        this.getRooms(),
        this.getEquipment(),
      ]);

      // Detect different types of conflicts
      if (this.config.enableTimeOverlapDetection) {
        conflicts.push(...(await this.detectTimeOverlapConflicts(appointments)));
      }

      if (this.config.enableStaffConflictDetection) {
        conflicts.push(...(await this.detectStaffConflicts(appointments, staff)));
      }

      if (this.config.enableRoomConflictDetection) {
        conflicts.push(...(await this.detectRoomConflicts(appointments, rooms)));
      }

      if (this.config.enableEquipmentConflictDetection) {
        conflicts.push(...(await this.detectEquipmentConflicts(appointments, equipment)));
      }

      if (this.config.enableResourceConflictDetection) {
        conflicts.push(
          ...(await this.detectResourceOverbooking(appointments, staff, rooms, equipment)),
        );
      }

      // Filter by severity and type
      const filteredConflicts = this.filterConflicts(conflicts, params);

      // Cache results
      this.cache.set(cacheKey, filteredConflicts);

      return filteredConflicts;
    } catch (error) {
      console.error("Error detecting conflicts:", error);
      throw new Error(`Conflict detection failed: ${error.message}`);
    }
  }

  /**
   * Detect time overlap conflicts between appointments
   */
  private async detectTimeOverlapConflicts(
    appointments: Appointment[],
  ): Promise<ConflictDetails[]> {
    const conflicts: ConflictDetails[] = [];
    const sortedAppointments = appointments.sort(
      (a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime(),
    );

    for (let i = 0; i < sortedAppointments.length - 1; i++) {
      const current = sortedAppointments[i];
      const next = sortedAppointments[i + 1];

      const currentEnd = new Date(current.end_time);
      const nextStart = new Date(next.start_time);
      const bufferTime = this.config.bufferTimeMinutes * 60 * 1000;

      // Check for overlap or insufficient buffer time
      if (currentEnd.getTime() + bufferTime > nextStart.getTime()) {
        const overlapMinutes = Math.ceil(
          (currentEnd.getTime() + bufferTime - nextStart.getTime()) / (1000 * 60),
        );

        conflicts.push({
          id: `overlap_${current.id}_${next.id}`,
          type: ConflictType.TIME_OVERLAP,
          severity: this.calculateOverlapSeverity(overlapMinutes),
          description: `Appointment overlap detected: ${overlapMinutes} minutes`,
          affectedAppointments: [current.id, next.id],
          affectedResources: {
            staff: [current.staff_id, next.staff_id].filter(Boolean),
            rooms: [current.room_id, next.room_id].filter(Boolean),
          },
          conflictTime: {
            start: new Date(current.start_time),
            end: new Date(next.end_time),
          },
          detectedAt: new Date(),
          metadata: {
            overlapMinutes,
            bufferTimeRequired: this.config.bufferTimeMinutes,
            currentAppointment: current,
            nextAppointment: next,
          },
        });
      }
    }

    return conflicts;
  }

  /**
   * Detect staff conflicts and overloading
   */
  private async detectStaffConflicts(
    appointments: Appointment[],
    staff: Staff[],
  ): Promise<ConflictDetails[]> {
    const conflicts: ConflictDetails[] = [];
    const staffMap = new Map(staff.map((s) => [s.id, s]));

    // Group appointments by staff
    const staffAppointments = new Map<string, Appointment[]>();
    appointments.forEach((apt) => {
      if (apt.staff_id) {
        if (!staffAppointments.has(apt.staff_id)) {
          staffAppointments.set(apt.staff_id, []);
        }
        staffAppointments.get(apt.staff_id)!.push(apt);
      }
    });

    // Check each staff member for conflicts
    for (const [staffId, staffApts] of staffAppointments) {
      const staffMember = staffMap.get(staffId);
      if (!staffMember) continue;

      // Sort appointments by time
      const sortedApts = staffApts.sort(
        (a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime(),
      );

      // Check for double booking
      for (let i = 0; i < sortedApts.length - 1; i++) {
        const current = sortedApts[i];
        const next = sortedApts[i + 1];

        if (new Date(current.end_time) > new Date(next.start_time)) {
          conflicts.push({
            id: `staff_conflict_${staffId}_${current.id}_${next.id}`,
            type: ConflictType.STAFF_UNAVAILABLE,
            severity: ConflictSeverity.HIGH,
            description: `Staff member ${staffMember.name} double-booked`,
            affectedAppointments: [current.id, next.id],
            affectedResources: { staff: [staffId] },
            conflictTime: {
              start: new Date(next.start_time),
              end: new Date(current.end_time),
            },
            detectedAt: new Date(),
            metadata: {
              staffMember,
              conflictingAppointments: [current, next],
            },
          });
        }
      }

      // Check workload
      const workloadMetrics = await this.calculateStaffWorkload(staffId, staffApts);
      if (workloadMetrics.currentLoad > 0.9) {
        conflicts.push({
          id: `staff_overload_${staffId}`,
          type: ConflictType.RESOURCE_OVERBOOKED,
          severity: ConflictSeverity.MEDIUM,
          description: `Staff member ${staffMember.name} overloaded (${Math.round(workloadMetrics.currentLoad * 100)}%)`,
          affectedAppointments: staffApts.map((apt) => apt.id),
          affectedResources: { staff: [staffId] },
          conflictTime: {
            start: new Date(
              Math.min(...staffApts.map((apt) => new Date(apt.start_time).getTime())),
            ),
            end: new Date(Math.max(...staffApts.map((apt) => new Date(apt.end_time).getTime()))),
          },
          detectedAt: new Date(),
          metadata: {
            workloadMetrics,
            staffMember,
          },
        });
      }
    }

    return conflicts;
  } /**
   * Detect room conflicts and capacity issues
   */
  private async detectRoomConflicts(
    appointments: Appointment[],
    rooms: Room[],
  ): Promise<ConflictDetails[]> {
    const conflicts: ConflictDetails[] = [];
    const roomMap = new Map(rooms.map((r) => [r.id, r]));

    // Group appointments by room
    const roomAppointments = new Map<string, Appointment[]>();
    appointments.forEach((apt) => {
      if (apt.room_id) {
        if (!roomAppointments.has(apt.room_id)) {
          roomAppointments.set(apt.room_id, []);
        }
        roomAppointments.get(apt.room_id)!.push(apt);
      }
    });

    // Check each room for conflicts
    for (const [roomId, roomApts] of roomAppointments) {
      const room = roomMap.get(roomId);
      if (!room) continue;

      // Sort appointments by time
      const sortedApts = roomApts.sort(
        (a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime(),
      );

      // Check for overlapping appointments
      for (let i = 0; i < sortedApts.length - 1; i++) {
        const current = sortedApts[i];
        const next = sortedApts[i + 1];

        if (new Date(current.end_time) > new Date(next.start_time)) {
          conflicts.push({
            id: `room_conflict_${roomId}_${current.id}_${next.id}`,
            type: ConflictType.ROOM_OCCUPIED,
            severity: ConflictSeverity.HIGH,
            description: `Room ${room.name} double-booked`,
            affectedAppointments: [current.id, next.id],
            affectedResources: { rooms: [roomId] },
            conflictTime: {
              start: new Date(next.start_time),
              end: new Date(current.end_time),
            },
            detectedAt: new Date(),
            metadata: {
              room,
              conflictingAppointments: [current, next],
            },
          });
        }
      }

      // Check capacity
      const maxCapacity = room.capacity || 1;
      const simultaneousAppointments = this.findSimultaneousAppointments(roomApts);

      for (const group of simultaneousAppointments) {
        if (group.length > maxCapacity) {
          conflicts.push({
            id: `room_capacity_${roomId}_${Date.now()}`,
            type: ConflictType.CAPACITY_EXCEEDED,
            severity: ConflictSeverity.MEDIUM,
            description: `Room ${room.name} capacity exceeded (${group.length}/${maxCapacity})`,
            affectedAppointments: group.map((apt) => apt.id),
            affectedResources: { rooms: [roomId] },
            conflictTime: {
              start: new Date(Math.min(...group.map((apt) => new Date(apt.start_time).getTime()))),
              end: new Date(Math.max(...group.map((apt) => new Date(apt.end_time).getTime()))),
            },
            detectedAt: new Date(),
            metadata: {
              room,
              capacity: maxCapacity,
              actualUsage: group.length,
              appointments: group,
            },
          });
        }
      }
    }

    return conflicts;
  }

  /**
   * Detect equipment conflicts and availability issues
   */
  private async detectEquipmentConflicts(
    appointments: Appointment[],
    equipment: Equipment[],
  ): Promise<ConflictDetails[]> {
    const conflicts: ConflictDetails[] = [];
    const equipmentMap = new Map(equipment.map((e) => [e.id, e]));

    // Get equipment assignments from appointments
    const equipmentAssignments = await this.getEquipmentAssignments(
      appointments.map((apt) => apt.id),
    );

    // Group assignments by equipment
    const equipmentAppointments = new Map<
      string,
      { appointment: Appointment; assignment: any }[]
    >();

    for (const assignment of equipmentAssignments) {
      const appointment = appointments.find((apt) => apt.id === assignment.appointment_id);
      if (!appointment) continue;

      if (!equipmentAppointments.has(assignment.equipment_id)) {
        equipmentAppointments.set(assignment.equipment_id, []);
      }
      equipmentAppointments.get(assignment.equipment_id)!.push({ appointment, assignment });
    }

    // Check each equipment for conflicts
    for (const [equipmentId, assignments] of equipmentAppointments) {
      const equipmentItem = equipmentMap.get(equipmentId);
      if (!equipmentItem) continue;

      // Sort by appointment time
      const sortedAssignments = assignments.sort(
        (a, b) =>
          new Date(a.appointment.start_time).getTime() -
          new Date(b.appointment.start_time).getTime(),
      );

      // Check for overlapping usage
      for (let i = 0; i < sortedAssignments.length - 1; i++) {
        const current = sortedAssignments[i];
        const next = sortedAssignments[i + 1];

        const currentEnd = new Date(current.appointment.end_time);
        const nextStart = new Date(next.appointment.start_time);
        const setupTime = equipmentItem.setup_time_minutes || 0;
        const cleanupTime = equipmentItem.cleanup_time_minutes || 0;
        const requiredGap = (setupTime + cleanupTime) * 60 * 1000;

        if (currentEnd.getTime() + requiredGap > nextStart.getTime()) {
          conflicts.push({
            id: `equipment_conflict_${equipmentId}_${current.appointment.id}_${next.appointment.id}`,
            type: ConflictType.EQUIPMENT_UNAVAILABLE,
            severity: ConflictSeverity.HIGH,
            description: `Equipment ${equipmentItem.name} scheduling conflict`,
            affectedAppointments: [current.appointment.id, next.appointment.id],
            affectedResources: { equipment: [equipmentId] },
            conflictTime: {
              start: nextStart,
              end: new Date(currentEnd.getTime() + requiredGap),
            },
            detectedAt: new Date(),
            metadata: {
              equipment: equipmentItem,
              setupTime,
              cleanupTime,
              requiredGap: requiredGap / (1000 * 60),
              conflictingAppointments: [current.appointment, next.appointment],
            },
          });
        }
      }

      // Check maintenance conflicts
      const maintenanceSchedule = await this.getEquipmentMaintenance(equipmentId);
      for (const maintenance of maintenanceSchedule) {
        const conflictingAssignments = assignments.filter(({ appointment }) => {
          const aptStart = new Date(appointment.start_time);
          const aptEnd = new Date(appointment.end_time);
          const maintStart = new Date(maintenance.start_time);
          const maintEnd = new Date(maintenance.end_time);

          return aptStart < maintEnd && aptEnd > maintStart;
        });

        if (conflictingAssignments.length > 0) {
          conflicts.push({
            id: `equipment_maintenance_${equipmentId}_${maintenance.id}`,
            type: ConflictType.EQUIPMENT_UNAVAILABLE,
            severity: ConflictSeverity.CRITICAL,
            description: `Equipment ${equipmentItem.name} scheduled for maintenance`,
            affectedAppointments: conflictingAssignments.map(({ appointment }) => appointment.id),
            affectedResources: { equipment: [equipmentId] },
            conflictTime: {
              start: new Date(maintenance.start_time),
              end: new Date(maintenance.end_time),
            },
            detectedAt: new Date(),
            metadata: {
              equipment: equipmentItem,
              maintenance,
              conflictingAppointments: conflictingAssignments.map(({ appointment }) => appointment),
            },
          });
        }
      }
    }

    return conflicts;
  }

  /**
   * Detect resource overbooking across all resource types
   */
  private async detectResourceOverbooking(
    appointments: Appointment[],
    staff: Staff[],
    rooms: Room[],
    equipment: Equipment[],
  ): Promise<ConflictDetails[]> {
    const conflicts: ConflictDetails[] = [];

    // Analyze resource utilization patterns
    const utilizationAnalysis = await this.analyzeResourceUtilization(
      appointments,
      staff,
      rooms,
      equipment,
    );

    // Check for critical utilization levels
    for (const analysis of utilizationAnalysis) {
      if (analysis.utilizationRate > 0.95) {
        conflicts.push({
          id: `resource_overbook_${analysis.resourceType}_${analysis.resourceId}`,
          type: ConflictType.RESOURCE_OVERBOOKED,
          severity: ConflictSeverity.HIGH,
          description: `${analysis.resourceType} ${analysis.resourceName} critically overbooked (${Math.round(analysis.utilizationRate * 100)}%)`,
          affectedAppointments: analysis.affectedAppointments,
          affectedResources: {
            [analysis.resourceType]: [analysis.resourceId],
          },
          conflictTime: {
            start: analysis.periodStart,
            end: analysis.periodEnd,
          },
          detectedAt: new Date(),
          metadata: {
            utilizationRate: analysis.utilizationRate,
            capacity: analysis.capacity,
            demand: analysis.demand,
            recommendations: analysis.recommendations,
          },
        });
      }
    }

    return conflicts;
  }

  /**
   * Calculate staff workload metrics
   */
  private async calculateStaffWorkload(
    staffId: string,
    appointments: Appointment[],
  ): Promise<WorkloadMetrics> {
    const staff = await this.getStaffById(staffId);
    if (!staff) {
      throw new Error(`Staff member not found: ${staffId}`);
    }

    const totalWorkMinutes = appointments.reduce((total, apt) => {
      const duration = new Date(apt.end_time).getTime() - new Date(apt.start_time).getTime();
      return total + duration / (1000 * 60);
    }, 0);

    const workingHoursPerDay = 8 * 60; // 8 hours in minutes
    const daysInPeriod = this.calculateDaysInPeriod(appointments);
    const maxPossibleMinutes = workingHoursPerDay * daysInPeriod;

    const currentLoad = Math.min(totalWorkMinutes / maxPossibleMinutes, 1);
    const efficiency = await this.calculateStaffEfficiency(staffId);
    const satisfaction = await this.getStaffSatisfactionScore(staffId);
    const availability = await this.getStaffAvailability(staffId);
    const preferences = await this.getStaffPreferences(staffId);

    return {
      staffId,
      currentLoad,
      projectedLoad: currentLoad * 1.1, // Simple projection
      efficiency,
      satisfaction,
      specializations: staff.specializations || [],
      availability,
      preferences,
    };
  }

  /**
   * Helper methods
   */
  private calculateOverlapSeverity(overlapMinutes: number): ConflictSeverity {
    if (overlapMinutes > 60) return ConflictSeverity.CRITICAL;
    if (overlapMinutes > 30) return ConflictSeverity.HIGH;
    if (overlapMinutes > 15) return ConflictSeverity.MEDIUM;
    return ConflictSeverity.LOW;
  }

  private findSimultaneousAppointments(appointments: Appointment[]): Appointment[][] {
    const groups: Appointment[][] = [];
    const processed = new Set<string>();

    for (const apt of appointments) {
      if (processed.has(apt.id)) continue;

      const group = [apt];
      processed.add(apt.id);

      const aptStart = new Date(apt.start_time);
      const aptEnd = new Date(apt.end_time);

      for (const other of appointments) {
        if (processed.has(other.id)) continue;

        const otherStart = new Date(other.start_time);
        const otherEnd = new Date(other.end_time);

        // Check for overlap
        if (aptStart < otherEnd && aptEnd > otherStart) {
          group.push(other);
          processed.add(other.id);
        }
      }

      if (group.length > 1) {
        groups.push(group);
      }
    }

    return groups;
  }

  private filterConflicts(
    conflicts: ConflictDetails[],
    params: ConflictDetectionParams,
  ): ConflictDetails[] {
    return conflicts.filter((conflict) => {
      // Filter by type
      if (params.includeTypes && !params.includeTypes.includes(conflict.type)) {
        return false;
      }

      // Filter by severity
      if (params.severityFilter && !params.severityFilter.includes(conflict.severity)) {
        return false;
      }

      // Filter by resources
      if (params.resourceFilter) {
        const { staff, rooms, equipment } = params.resourceFilter;

        if (staff && conflict.affectedResources.staff) {
          const hasMatchingStaff = conflict.affectedResources.staff.some((id) =>
            staff.includes(id),
          );
          if (!hasMatchingStaff) return false;
        }

        if (rooms && conflict.affectedResources.rooms) {
          const hasMatchingRoom = conflict.affectedResources.rooms.some((id) => rooms.includes(id));
          if (!hasMatchingRoom) return false;
        }

        if (equipment && conflict.affectedResources.equipment) {
          const hasMatchingEquipment = conflict.affectedResources.equipment.some((id) =>
            equipment.includes(id),
          );
          if (!hasMatchingEquipment) return false;
        }
      }

      return true;
    });
  }

  private generateCacheKey(prefix: string, params: any): string {
    return `${prefix}_${JSON.stringify(params)}`;
  }

  /**
   * Database query methods
   */
  private async getAppointmentsInRange(start: Date, end: Date): Promise<Appointment[]> {
    const { data, error } = await this.supabase
      .from("appointments")
      .select("*")
      .gte("start_time", start.toISOString())
      .lte("end_time", end.toISOString())
      .eq("status", "scheduled");

    if (error) throw error;
    return data || [];
  }

  private async getStaff(): Promise<Staff[]> {
    const { data, error } = await this.supabase.from("staff").select("*").eq("active", true);

    if (error) throw error;
    return data || [];
  }

  private async getRooms(): Promise<Room[]> {
    const { data, error } = await this.supabase.from("rooms").select("*").eq("active", true);

    if (error) throw error;
    return data || [];
  }

  private async getEquipment(): Promise<Equipment[]> {
    const { data, error } = await this.supabase.from("equipment").select("*").eq("active", true);

    if (error) throw error;
    return data || [];
  }

  private async getStaffById(staffId: string): Promise<Staff | null> {
    const { data, error } = await this.supabase
      .from("staff")
      .select("*")
      .eq("id", staffId)
      .single();

    if (error) return null;
    return data;
  }

  private async getEquipmentAssignments(appointmentIds: string[]): Promise<any[]> {
    const { data, error } = await this.supabase
      .from("appointment_equipment")
      .select("*")
      .in("appointment_id", appointmentIds);

    if (error) throw error;
    return data || [];
  }

  private async getEquipmentMaintenance(equipmentId: string): Promise<any[]> {
    const { data, error } = await this.supabase
      .from("equipment_maintenance")
      .select("*")
      .eq("equipment_id", equipmentId)
      .gte("end_time", new Date().toISOString());

    if (error) throw error;
    return data || [];
  }

  // Placeholder methods for advanced features
  private async analyzeResourceUtilization(
    appointments: Appointment[],
    staff: Staff[],
    rooms: Room[],
    equipment: Equipment[],
  ): Promise<any[]> {
    // Implementation for resource utilization analysis
    return [];
  }

  private calculateDaysInPeriod(appointments: Appointment[]): number {
    if (appointments.length === 0) return 1;

    const dates = appointments.map((apt) => new Date(apt.start_time).toDateString());
    const uniqueDates = new Set(dates);
    return uniqueDates.size;
  }

  private async calculateStaffEfficiency(staffId: string): Promise<number> {
    // Placeholder for efficiency calculation
    return 0.8;
  }

  private async getStaffSatisfactionScore(staffId: string): Promise<number> {
    // Placeholder for satisfaction score
    return 0.7;
  }

  private async getStaffAvailability(staffId: string): Promise<any[]> {
    // Placeholder for availability windows
    return [];
  }

  private async getStaffPreferences(staffId: string): Promise<any> {
    // Placeholder for staff preferences
    return {
      preferredHours: { start: "09:00", end: "17:00" },
      preferredDays: ["monday", "tuesday", "wednesday", "thursday", "friday"],
      avoidedTasks: [],
      preferredTasks: [],
      maxConsecutiveHours: 8,
      minBreakBetweenAppointments: 15,
    };
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<ConflictDetectionConfig>): void {
    this.config = { ...this.config, ...config };
    this.clearCache();
  }
}
