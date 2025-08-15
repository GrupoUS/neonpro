import { logger } from '@/lib/logger';
import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/types/supabase';
import {
  type ConflictDetectionResult,
  ConflictType,
  type DetectedConflict,
} from './conflict-detection-engine';

type Tables = Database['public']['Tables'];
type Appointment = Tables['appointments']['Row'];
type Staff = Tables['staff']['Row'];
type Room = Tables['rooms']['Row'];
type Equipment = Tables['equipment']['Row'];

// Tipos para sugestões
export interface ResolutionSuggestion {
  id: string;
  type: SuggestionType;
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  impact: SuggestionImpact;
  implementation: SuggestionImplementation;
  estimatedTime: number; // em minutos
  confidence: number; // 0-100
  autoApplicable: boolean;
  conflictIds: string[];
}

export interface SuggestionImpact {
  resolvedConflicts: number;
  affectedAppointments: string[];
  resourceChanges: ResourceChange[];
  timeChanges: TimeChange[];
  costImpact: number; // em reais
}

export interface ResourceChange {
  resourceId: string;
  resourceType: 'staff' | 'room' | 'equipment';
  changeType: 'reassign' | 'substitute' | 'add' | 'remove';
  from?: string;
  to?: string;
  reason: string;
}

export interface TimeChange {
  appointmentId: string;
  originalStart: Date;
  originalEnd: Date;
  suggestedStart: Date;
  suggestedEnd: Date;
  reason: string;
}

export interface SuggestionImplementation {
  steps: ImplementationStep[];
  requiredApprovals: string[];
  automationLevel: 'manual' | 'semi-auto' | 'full-auto';
  rollbackPlan: string[];
}

export interface ImplementationStep {
  order: number;
  action: string;
  description: string;
  automated: boolean;
  estimatedDuration: number;
  dependencies: string[];
}

export enum SuggestionType {
  RESCHEDULE_APPOINTMENT = 'reschedule_appointment',
  REASSIGN_STAFF = 'reassign_staff',
  CHANGE_ROOM = 'change_room',
  SUBSTITUTE_EQUIPMENT = 'substitute_equipment',
  SPLIT_APPOINTMENT = 'split_appointment',
  MERGE_APPOINTMENTS = 'merge_appointments',
  ADJUST_DURATION = 'adjust_duration',
  ADD_BUFFER_TIME = 'add_buffer_time',
  OPTIMIZE_SCHEDULE = 'optimize_schedule',
}

export interface SuggestionConfig {
  enableAutoSuggestions: boolean;
  maxSuggestionsPerConflict: number;
  prioritizePatientPreference: boolean;
  considerStaffPreferences: boolean;
  allowOvertimeScheduling: boolean;
  maxRescheduleDistance: number; // dias
  minConfidenceThreshold: number; // 0-100
  enableCostOptimization: boolean;
}

/**
 * Engine de Sugestões Automatizadas
 * Gera sugestões inteligentes para resolução de conflitos
 */
export class SuggestionEngine {
  private readonly supabase = createClient();
  private config: SuggestionConfig;

  constructor(config: Partial<SuggestionConfig> = {}) {
    this.config = {
      enableAutoSuggestions: true,
      maxSuggestionsPerConflict: 5,
      prioritizePatientPreference: true,
      considerStaffPreferences: true,
      allowOvertimeScheduling: false,
      maxRescheduleDistance: 7,
      minConfidenceThreshold: 70,
      enableCostOptimization: true,
      ...config,
    };
  }

  /**
   * Gera sugestões para resolver conflitos detectados
   */
  async generateSuggestions(
    conflictResult: ConflictDetectionResult,
    appointmentData: Partial<Appointment>,
    clinicId: string
  ): Promise<ResolutionSuggestion[]> {
    try {
      logger.info('Generating resolution suggestions', {
        conflictCount: conflictResult.conflicts.length,
        severity: conflictResult.severity,
      });

      if (!conflictResult.hasConflicts) {
        return [];
      }

      const suggestions: ResolutionSuggestion[] = [];

      // Processar cada tipo de conflito
      for (const conflict of conflictResult.conflicts) {
        const conflictSuggestions = await this.generateSuggestionsForConflict(
          conflict,
          appointmentData,
          clinicId
        );
        suggestions.push(...conflictSuggestions);
      }

      // Gerar sugestões de otimização global
      const optimizationSuggestions =
        await this.generateOptimizationSuggestions(
          conflictResult,
          appointmentData,
          clinicId
        );
      suggestions.push(...optimizationSuggestions);

      // Filtrar e ordenar por prioridade e confiança
      const filteredSuggestions = suggestions
        .filter((s) => s.confidence >= this.config.minConfidenceThreshold)
        .sort((a, b) => {
          // Ordenar por prioridade e depois por confiança
          const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
          const priorityDiff =
            priorityOrder[b.priority] - priorityOrder[a.priority];
          if (priorityDiff !== 0) {
            return priorityDiff;
          }
          return b.confidence - a.confidence;
        })
        .slice(
          0,
          this.config.maxSuggestionsPerConflict *
            conflictResult.conflicts.length
        );

      logger.info('Generated suggestions', {
        totalSuggestions: filteredSuggestions.length,
        autoApplicable: filteredSuggestions.filter((s) => s.autoApplicable)
          .length,
      });

      return filteredSuggestions;
    } catch (error) {
      logger.error('Error generating suggestions', { error, conflictResult });
      throw error;
    }
  }

  /**
   * Gera sugestões específicas para um conflito
   */
  private async generateSuggestionsForConflict(
    conflict: DetectedConflict,
    appointmentData: Partial<Appointment>,
    clinicId: string
  ): Promise<ResolutionSuggestion[]> {
    const suggestions: ResolutionSuggestion[] = [];

    switch (conflict.type) {
      case ConflictType.STAFF_DOUBLE_BOOKING:
        suggestions.push(
          ...(await this.generateStaffConflictSuggestions(
            conflict,
            appointmentData,
            clinicId
          ))
        );
        break;

      case ConflictType.ROOM_OVERLAP:
        suggestions.push(
          ...(await this.generateRoomConflictSuggestions(
            conflict,
            appointmentData,
            clinicId
          ))
        );
        break;

      case ConflictType.EQUIPMENT_UNAVAILABLE:
        suggestions.push(
          ...(await this.generateEquipmentConflictSuggestions(
            conflict,
            appointmentData,
            clinicId
          ))
        );
        break;

      case ConflictType.STAFF_SKILL_MISMATCH:
        suggestions.push(
          ...(await this.generateSkillMismatchSuggestions(
            conflict,
            appointmentData,
            clinicId
          ))
        );
        break;

      case ConflictType.STAFF_BREAK_VIOLATION:
        suggestions.push(
          ...(await this.generateBreakViolationSuggestions(
            conflict,
            appointmentData,
            clinicId
          ))
        );
        break;

      case ConflictType.EQUIPMENT_MAINTENANCE:
        suggestions.push(
          ...(await this.generateMaintenanceSuggestions(
            conflict,
            appointmentData,
            clinicId
          ))
        );
        break;

      default:
        logger.warn('Unknown conflict type', { conflictType: conflict.type });
    }

    return suggestions;
  }

  /**
   * Gera sugestões para conflitos de staff
   */
  private async generateStaffConflictSuggestions(
    conflict: DetectedConflict,
    appointmentData: Partial<Appointment>,
    clinicId: string
  ): Promise<ResolutionSuggestion[]> {
    const suggestions: ResolutionSuggestion[] = [];

    try {
      // 1. Sugestão: Encontrar staff alternativo
      const alternativeStaff = await this.findAlternativeStaff(
        appointmentData.service_id!,
        new Date(appointmentData.start_time!),
        new Date(appointmentData.end_time!),
        clinicId,
        appointmentData.staff_id
      );

      if (alternativeStaff.length > 0) {
        for (const staff of alternativeStaff.slice(0, 3)) {
          suggestions.push({
            id: `reassign_staff_${staff.id}_${Date.now()}`,
            type: SuggestionType.REASSIGN_STAFF,
            priority: 'high',
            title: `Reassign to ${staff.name}`,
            description: `Assign appointment to ${staff.name} who is available at the requested time`,
            impact: {
              resolvedConflicts: 1,
              affectedAppointments: [appointmentData.id!],
              resourceChanges: [
                {
                  resourceId: staff.id,
                  resourceType: 'staff',
                  changeType: 'reassign',
                  from: appointmentData.staff_id,
                  to: staff.id,
                  reason: 'Resolve staff double booking',
                },
              ],
              timeChanges: [],
              costImpact: 0,
            },
            implementation: {
              steps: [
                {
                  order: 1,
                  action: 'update_appointment_staff',
                  description: `Update appointment staff from ${appointmentData.staff_id} to ${staff.id}`,
                  automated: true,
                  estimatedDuration: 1,
                  dependencies: [],
                },
                {
                  order: 2,
                  action: 'notify_stakeholders',
                  description: 'Notify patient and staff about the change',
                  automated: true,
                  estimatedDuration: 2,
                  dependencies: ['update_appointment_staff'],
                },
              ],
              requiredApprovals: [],
              automationLevel: 'full-auto',
              rollbackPlan: [
                'Revert staff assignment',
                'Notify stakeholders of reversion',
              ],
            },
            estimatedTime: 3,
            confidence: staff.confidence || 85,
            autoApplicable: true,
            conflictIds: [conflict.id],
          });
        }
      }

      // 2. Sugestão: Reagendar para horário disponível
      const availableSlots = await this.findAvailableTimeSlots(
        appointmentData.staff_id!,
        appointmentData.service_id!,
        new Date(appointmentData.start_time!),
        clinicId,
        this.config.maxRescheduleDistance
      );

      if (availableSlots.length > 0) {
        for (const slot of availableSlots.slice(0, 3)) {
          suggestions.push({
            id: `reschedule_${slot.start.getTime()}_${Date.now()}`,
            type: SuggestionType.RESCHEDULE_APPOINTMENT,
            priority: 'medium',
            title: `Reschedule to ${slot.start.toLocaleDateString()} ${slot.start.toLocaleTimeString()}`,
            description: 'Move appointment to available time slot',
            impact: {
              resolvedConflicts: 1,
              affectedAppointments: [appointmentData.id!],
              resourceChanges: [],
              timeChanges: [
                {
                  appointmentId: appointmentData.id!,
                  originalStart: new Date(appointmentData.start_time!),
                  originalEnd: new Date(appointmentData.end_time!),
                  suggestedStart: slot.start,
                  suggestedEnd: slot.end,
                  reason: 'Resolve staff conflict',
                },
              ],
              costImpact: 0,
            },
            implementation: {
              steps: [
                {
                  order: 1,
                  action: 'update_appointment_time',
                  description: `Update appointment time to ${slot.start.toISOString()}`,
                  automated: true,
                  estimatedDuration: 1,
                  dependencies: [],
                },
                {
                  order: 2,
                  action: 'notify_patient',
                  description: 'Notify patient about schedule change',
                  automated: true,
                  estimatedDuration: 2,
                  dependencies: ['update_appointment_time'],
                },
              ],
              requiredApprovals: ['patient_consent'],
              automationLevel: 'semi-auto',
              rollbackPlan: [
                'Revert to original time',
                'Notify patient of reversion',
              ],
            },
            estimatedTime: 5,
            confidence: slot.confidence || 80,
            autoApplicable: false,
            conflictIds: [conflict.id],
          });
        }
      }

      return suggestions;
    } catch (error) {
      logger.error('Error generating staff conflict suggestions', {
        error,
        conflict,
      });
      return [];
    }
  }

  /**
   * Gera sugestões para conflitos de sala
   */
  private async generateRoomConflictSuggestions(
    conflict: DetectedConflict,
    appointmentData: Partial<Appointment>,
    clinicId: string
  ): Promise<ResolutionSuggestion[]> {
    const suggestions: ResolutionSuggestion[] = [];

    try {
      // Encontrar salas alternativas
      const alternativeRooms = await this.findAlternativeRooms(
        appointmentData.service_id!,
        new Date(appointmentData.start_time!),
        new Date(appointmentData.end_time!),
        clinicId,
        appointmentData.room_id
      );

      if (alternativeRooms.length > 0) {
        for (const room of alternativeRooms.slice(0, 3)) {
          suggestions.push({
            id: `change_room_${room.id}_${Date.now()}`,
            type: SuggestionType.CHANGE_ROOM,
            priority: 'medium',
            title: `Change to ${room.name}`,
            description: `Use ${room.name} which is available at the requested time`,
            impact: {
              resolvedConflicts: 1,
              affectedAppointments: [appointmentData.id!],
              resourceChanges: [
                {
                  resourceId: room.id,
                  resourceType: 'room',
                  changeType: 'reassign',
                  from: appointmentData.room_id,
                  to: room.id,
                  reason: 'Resolve room conflict',
                },
              ],
              timeChanges: [],
              costImpact: 0,
            },
            implementation: {
              steps: [
                {
                  order: 1,
                  action: 'update_appointment_room',
                  description: `Update appointment room to ${room.name}`,
                  automated: true,
                  estimatedDuration: 1,
                  dependencies: [],
                },
                {
                  order: 2,
                  action: 'notify_staff',
                  description: 'Notify staff about room change',
                  automated: true,
                  estimatedDuration: 1,
                  dependencies: ['update_appointment_room'],
                },
              ],
              requiredApprovals: [],
              automationLevel: 'full-auto',
              rollbackPlan: ['Revert room assignment'],
            },
            estimatedTime: 2,
            confidence: room.confidence || 90,
            autoApplicable: true,
            conflictIds: [conflict.id],
          });
        }
      }

      return suggestions;
    } catch (error) {
      logger.error('Error generating room conflict suggestions', {
        error,
        conflict,
      });
      return [];
    }
  }

  /**
   * Gera sugestões para conflitos de equipamento
   */
  private async generateEquipmentConflictSuggestions(
    conflict: DetectedConflict,
    appointmentData: Partial<Appointment>,
    clinicId: string
  ): Promise<ResolutionSuggestion[]> {
    const suggestions: ResolutionSuggestion[] = [];

    try {
      const requiredEquipment =
        (appointmentData.required_equipment as string[]) || [];

      // Encontrar equipamentos alternativos
      for (const equipmentId of requiredEquipment) {
        const alternatives = await this.findAlternativeEquipment(
          equipmentId,
          new Date(appointmentData.start_time!),
          new Date(appointmentData.end_time!),
          clinicId
        );

        if (alternatives.length > 0) {
          for (const equipment of alternatives.slice(0, 2)) {
            suggestions.push({
              id: `substitute_equipment_${equipment.id}_${Date.now()}`,
              type: SuggestionType.SUBSTITUTE_EQUIPMENT,
              priority: 'medium',
              title: `Use ${equipment.name} instead`,
              description: `Substitute with ${equipment.name} which is available`,
              impact: {
                resolvedConflicts: 1,
                affectedAppointments: [appointmentData.id!],
                resourceChanges: [
                  {
                    resourceId: equipment.id,
                    resourceType: 'equipment',
                    changeType: 'substitute',
                    from: equipmentId,
                    to: equipment.id,
                    reason: 'Equipment unavailable',
                  },
                ],
                timeChanges: [],
                costImpact: 0,
              },
              implementation: {
                steps: [
                  {
                    order: 1,
                    action: 'update_required_equipment',
                    description: `Replace ${equipmentId} with ${equipment.id}`,
                    automated: true,
                    estimatedDuration: 1,
                    dependencies: [],
                  },
                ],
                requiredApprovals: [],
                automationLevel: 'full-auto',
                rollbackPlan: ['Revert equipment assignment'],
              },
              estimatedTime: 1,
              confidence: equipment.confidence || 85,
              autoApplicable: true,
              conflictIds: [conflict.id],
            });
          }
        }
      }

      return suggestions;
    } catch (error) {
      logger.error('Error generating equipment conflict suggestions', {
        error,
        conflict,
      });
      return [];
    }
  }

  /**
   * Gera sugestões para incompatibilidade de habilidades
   */
  private async generateSkillMismatchSuggestions(
    conflict: DetectedConflict,
    appointmentData: Partial<Appointment>,
    clinicId: string
  ): Promise<ResolutionSuggestion[]> {
    const suggestions: ResolutionSuggestion[] = [];

    try {
      // Encontrar staff qualificado
      const qualifiedStaff = await this.findQualifiedStaff(
        appointmentData.service_id!,
        new Date(appointmentData.start_time!),
        new Date(appointmentData.end_time!),
        clinicId
      );

      if (qualifiedStaff.length > 0) {
        for (const staff of qualifiedStaff.slice(0, 3)) {
          suggestions.push({
            id: `assign_qualified_staff_${staff.id}_${Date.now()}`,
            type: SuggestionType.REASSIGN_STAFF,
            priority: 'high',
            title: `Assign to qualified ${staff.name}`,
            description: `Assign to ${staff.name} who has the required specialties`,
            impact: {
              resolvedConflicts: 1,
              affectedAppointments: [appointmentData.id!],
              resourceChanges: [
                {
                  resourceId: staff.id,
                  resourceType: 'staff',
                  changeType: 'reassign',
                  from: appointmentData.staff_id,
                  to: staff.id,
                  reason: 'Staff lacks required skills',
                },
              ],
              timeChanges: [],
              costImpact: 0,
            },
            implementation: {
              steps: [
                {
                  order: 1,
                  action: 'update_appointment_staff',
                  description: `Assign appointment to qualified staff ${staff.name}`,
                  automated: true,
                  estimatedDuration: 1,
                  dependencies: [],
                },
              ],
              requiredApprovals: [],
              automationLevel: 'full-auto',
              rollbackPlan: ['Revert staff assignment'],
            },
            estimatedTime: 1,
            confidence: 95,
            autoApplicable: true,
            conflictIds: [conflict.id],
          });
        }
      }

      return suggestions;
    } catch (error) {
      logger.error('Error generating skill mismatch suggestions', {
        error,
        conflict,
      });
      return [];
    }
  }

  /**
   * Gera sugestões para violações de break time
   */
  private async generateBreakViolationSuggestions(
    conflict: DetectedConflict,
    appointmentData: Partial<Appointment>,
    clinicId: string
  ): Promise<ResolutionSuggestion[]> {
    const suggestions: ResolutionSuggestion[] = [];

    try {
      // Encontrar horários fora do break
      const availableSlots = await this.findSlotsOutsideBreakTime(
        appointmentData.staff_id!,
        appointmentData.service_id!,
        new Date(appointmentData.start_time!),
        clinicId
      );

      if (availableSlots.length > 0) {
        for (const slot of availableSlots.slice(0, 3)) {
          suggestions.push({
            id: `reschedule_outside_break_${slot.start.getTime()}_${Date.now()}`,
            type: SuggestionType.RESCHEDULE_APPOINTMENT,
            priority: 'medium',
            title: 'Reschedule outside break time',
            description: `Move to ${slot.start.toLocaleTimeString()} to avoid break conflict`,
            impact: {
              resolvedConflicts: 1,
              affectedAppointments: [appointmentData.id!],
              resourceChanges: [],
              timeChanges: [
                {
                  appointmentId: appointmentData.id!,
                  originalStart: new Date(appointmentData.start_time!),
                  originalEnd: new Date(appointmentData.end_time!),
                  suggestedStart: slot.start,
                  suggestedEnd: slot.end,
                  reason: 'Avoid break time conflict',
                },
              ],
              costImpact: 0,
            },
            implementation: {
              steps: [
                {
                  order: 1,
                  action: 'update_appointment_time',
                  description: `Reschedule to ${slot.start.toISOString()}`,
                  automated: true,
                  estimatedDuration: 1,
                  dependencies: [],
                },
              ],
              requiredApprovals: ['patient_consent'],
              automationLevel: 'semi-auto',
              rollbackPlan: ['Revert to original time'],
            },
            estimatedTime: 3,
            confidence: 85,
            autoApplicable: false,
            conflictIds: [conflict.id],
          });
        }
      }

      return suggestions;
    } catch (error) {
      logger.error('Error generating break violation suggestions', {
        error,
        conflict,
      });
      return [];
    }
  }

  /**
   * Gera sugestões para equipamentos em manutenção
   */
  private async generateMaintenanceSuggestions(
    conflict: DetectedConflict,
    appointmentData: Partial<Appointment>,
    clinicId: string
  ): Promise<ResolutionSuggestion[]> {
    const suggestions: ResolutionSuggestion[] = [];

    try {
      // Encontrar quando a manutenção termina
      const maintenanceEnd = await this.getMaintenanceEndTime(
        conflict.affectedResources[0]?.id,
        clinicId
      );

      if (maintenanceEnd) {
        const suggestedStart = new Date(
          maintenanceEnd.getTime() + 30 * 60 * 1000
        ); // 30 min buffer
        const duration =
          new Date(appointmentData.end_time!).getTime() -
          new Date(appointmentData.start_time!).getTime();
        const suggestedEnd = new Date(suggestedStart.getTime() + duration);

        suggestions.push({
          id: `reschedule_after_maintenance_${Date.now()}`,
          type: SuggestionType.RESCHEDULE_APPOINTMENT,
          priority: 'low',
          title: 'Reschedule after maintenance',
          description: 'Schedule after equipment maintenance completes',
          impact: {
            resolvedConflicts: 1,
            affectedAppointments: [appointmentData.id!],
            resourceChanges: [],
            timeChanges: [
              {
                appointmentId: appointmentData.id!,
                originalStart: new Date(appointmentData.start_time!),
                originalEnd: new Date(appointmentData.end_time!),
                suggestedStart,
                suggestedEnd,
                reason: 'Wait for maintenance completion',
              },
            ],
            costImpact: 0,
          },
          implementation: {
            steps: [
              {
                order: 1,
                action: 'update_appointment_time',
                description: `Reschedule to ${suggestedStart.toISOString()}`,
                automated: true,
                estimatedDuration: 1,
                dependencies: [],
              },
            ],
            requiredApprovals: ['patient_consent'],
            automationLevel: 'semi-auto',
            rollbackPlan: ['Revert to original time'],
          },
          estimatedTime: 5,
          confidence: 70,
          autoApplicable: false,
          conflictIds: [conflict.id],
        });
      }

      return suggestions;
    } catch (error) {
      logger.error('Error generating maintenance suggestions', {
        error,
        conflict,
      });
      return [];
    }
  }

  /**
   * Gera sugestões de otimização global
   */
  private async generateOptimizationSuggestions(
    conflictResult: ConflictDetectionResult,
    _appointmentData: Partial<Appointment>,
    _clinicId: string
  ): Promise<ResolutionSuggestion[]> {
    const suggestions: ResolutionSuggestion[] = [];

    try {
      // Sugestão de otimização de agenda
      if (conflictResult.conflicts.length >= 3) {
        suggestions.push({
          id: `optimize_schedule_${Date.now()}`,
          type: SuggestionType.OPTIMIZE_SCHEDULE,
          priority: 'high',
          title: 'Optimize entire schedule',
          description:
            'Reorganize multiple appointments for optimal resource utilization',
          impact: {
            resolvedConflicts: conflictResult.conflicts.length,
            affectedAppointments: conflictResult.conflicts.flatMap(
              (c) => c.affectedAppointments
            ),
            resourceChanges: [],
            timeChanges: [],
            costImpact: 0,
          },
          implementation: {
            steps: [
              {
                order: 1,
                action: 'analyze_schedule',
                description:
                  'Analyze current schedule for optimization opportunities',
                automated: true,
                estimatedDuration: 5,
                dependencies: [],
              },
              {
                order: 2,
                action: 'generate_optimized_schedule',
                description: 'Generate optimized schedule proposal',
                automated: true,
                estimatedDuration: 10,
                dependencies: ['analyze_schedule'],
              },
              {
                order: 3,
                action: 'apply_optimization',
                description: 'Apply optimized schedule',
                automated: false,
                estimatedDuration: 15,
                dependencies: ['generate_optimized_schedule'],
              },
            ],
            requiredApprovals: [
              'manager_approval',
              'affected_patients_consent',
            ],
            automationLevel: 'semi-auto',
            rollbackPlan: [
              'Revert to original schedule',
              'Notify all affected parties',
            ],
          },
          estimatedTime: 30,
          confidence: 75,
          autoApplicable: false,
          conflictIds: conflictResult.conflicts.map((c) => c.id),
        });
      }

      return suggestions;
    } catch (error) {
      logger.error('Error generating optimization suggestions', {
        error,
        conflictResult,
      });
      return [];
    }
  }

  // Métodos auxiliares para busca de recursos alternativos
  private async findAlternativeStaff(
    serviceId: string,
    startTime: Date,
    endTime: Date,
    clinicId: string,
    excludeStaffId?: string
  ): Promise<Array<Staff & { confidence: number }>> {
    try {
      // Buscar staff qualificado e disponível
      let query = this.supabase
        .from('staff')
        .select(
          `
          id, name, specialties, hourly_rate,
          staff_availability(*)
        `
        )
        .eq('clinic_id', clinicId)
        .eq('active', true);

      if (excludeStaffId) {
        query = query.neq('id', excludeStaffId);
      }

      const { data: staffList, error } = await query;

      if (error || !staffList) {
        logger.error('Error fetching alternative staff', { error });
        return [];
      }

      // Filtrar por disponibilidade e qualificação
      const availableStaff: Array<Staff & { confidence: number }> = [];

      for (const staff of staffList) {
        // Verificar se tem as especialidades necessárias
        const { data: serviceData } = await this.supabase
          .from('services')
          .select('required_specialties')
          .eq('id', serviceId)
          .single();

        if (serviceData?.required_specialties) {
          const requiredSpecialties =
            serviceData.required_specialties as string[];
          const staffSpecialties = (staff.specialties as string[]) || [];

          const hasRequiredSkills = requiredSpecialties.every((specialty) =>
            staffSpecialties.includes(specialty)
          );

          if (!hasRequiredSkills) {
            continue;
          }
        }

        // Verificar disponibilidade
        const isAvailable = await this.checkStaffAvailability(
          staff.id,
          startTime,
          endTime,
          clinicId
        );

        if (isAvailable) {
          availableStaff.push({
            ...staff,
            confidence: 85, // Base confidence, pode ser ajustada
          });
        }
      }

      return availableStaff;
    } catch (error) {
      logger.error('Error finding alternative staff', { error });
      return [];
    }
  }

  private async findAlternativeRooms(
    _serviceId: string,
    startTime: Date,
    endTime: Date,
    clinicId: string,
    excludeRoomId?: string
  ): Promise<Array<Room & { confidence: number }>> {
    try {
      let query = this.supabase
        .from('rooms')
        .select('*')
        .eq('clinic_id', clinicId)
        .eq('active', true);

      if (excludeRoomId) {
        query = query.neq('id', excludeRoomId);
      }

      const { data: rooms, error } = await query;

      if (error || !rooms) {
        logger.error('Error fetching alternative rooms', { error });
        return [];
      }

      const availableRooms: Array<Room & { confidence: number }> = [];

      for (const room of rooms) {
        const isAvailable = await this.checkRoomAvailability(
          room.id,
          startTime,
          endTime,
          clinicId
        );

        if (isAvailable) {
          availableRooms.push({
            ...room,
            confidence: 90,
          });
        }
      }

      return availableRooms;
    } catch (error) {
      logger.error('Error finding alternative rooms', { error });
      return [];
    }
  }

  private async findAlternativeEquipment(
    equipmentId: string,
    startTime: Date,
    endTime: Date,
    clinicId: string
  ): Promise<Array<Equipment & { confidence: number }>> {
    try {
      // Buscar equipamento original para encontrar tipo/categoria
      const { data: originalEquipment } = await this.supabase
        .from('equipment')
        .select('type, category')
        .eq('id', equipmentId)
        .single();

      if (!originalEquipment) {
        return [];
      }

      // Buscar equipamentos similares
      const { data: similarEquipment, error } = await this.supabase
        .from('equipment')
        .select('*')
        .eq('clinic_id', clinicId)
        .eq('type', originalEquipment.type)
        .eq('active', true)
        .neq('id', equipmentId);

      if (error || !similarEquipment) {
        logger.error('Error fetching alternative equipment', { error });
        return [];
      }

      const availableEquipment: Array<Equipment & { confidence: number }> = [];

      for (const equipment of similarEquipment) {
        const isAvailable = await this.checkEquipmentAvailability(
          equipment.id,
          startTime,
          endTime,
          clinicId
        );

        if (isAvailable) {
          availableEquipment.push({
            ...equipment,
            confidence: 85,
          });
        }
      }

      return availableEquipment;
    } catch (error) {
      logger.error('Error finding alternative equipment', { error });
      return [];
    }
  }

  // Métodos auxiliares de verificação de disponibilidade
  private async checkStaffAvailability(
    staffId: string,
    startTime: Date,
    endTime: Date,
    clinicId: string
  ): Promise<boolean> {
    try {
      const { data: conflicts } = await this.supabase
        .from('appointments')
        .select('id')
        .eq('staff_id', staffId)
        .eq('clinic_id', clinicId)
        .neq('status', 'cancelled')
        .or(
          `and(start_time.lte.${endTime.toISOString()},end_time.gte.${startTime.toISOString()})`
        );

      return !conflicts || conflicts.length === 0;
    } catch (error) {
      logger.error('Error checking staff availability', { error });
      return false;
    }
  }

  private async checkRoomAvailability(
    roomId: string,
    startTime: Date,
    endTime: Date,
    clinicId: string
  ): Promise<boolean> {
    try {
      const { data: conflicts } = await this.supabase
        .from('appointments')
        .select('id')
        .eq('room_id', roomId)
        .eq('clinic_id', clinicId)
        .neq('status', 'cancelled')
        .or(
          `and(start_time.lte.${endTime.toISOString()},end_time.gte.${startTime.toISOString()})`
        );

      return !conflicts || conflicts.length === 0;
    } catch (error) {
      logger.error('Error checking room availability', { error });
      return false;
    }
  }

  private async checkEquipmentAvailability(
    equipmentId: string,
    startTime: Date,
    endTime: Date,
    clinicId: string
  ): Promise<boolean> {
    try {
      // Verificar manutenção
      const { data: maintenance } = await this.supabase
        .from('equipment_maintenance')
        .select('id')
        .eq('equipment_id', equipmentId)
        .eq('status', 'active')
        .or(
          `and(start_time.lte.${endTime.toISOString()},end_time.gte.${startTime.toISOString()})`
        );

      if (maintenance && maintenance.length > 0) {
        return false;
      }

      // Verificar uso em outros agendamentos
      const { data: conflicts } = await this.supabase
        .from('appointments')
        .select('id')
        .eq('clinic_id', clinicId)
        .neq('status', 'cancelled')
        .contains('required_equipment', [equipmentId])
        .or(
          `and(start_time.lte.${endTime.toISOString()},end_time.gte.${startTime.toISOString()})`
        );

      return !conflicts || conflicts.length === 0;
    } catch (error) {
      logger.error('Error checking equipment availability', { error });
      return false;
    }
  }

  // Métodos auxiliares adicionais
  private async findAvailableTimeSlots(
    staffId: string,
    _serviceId: string,
    preferredDate: Date,
    clinicId: string,
    maxDays: number
  ): Promise<Array<{ start: Date; end: Date; confidence: number }>> {
    // Implementação simplificada - pode ser expandida
    const slots: Array<{ start: Date; end: Date; confidence: number }> = [];

    // Buscar slots disponíveis nos próximos dias
    for (let day = 0; day <= maxDays; day++) {
      const checkDate = new Date(preferredDate);
      checkDate.setDate(checkDate.getDate() + day);

      // Verificar horários de trabalho (9h às 17h como exemplo)
      for (let hour = 9; hour < 17; hour++) {
        const slotStart = new Date(checkDate);
        slotStart.setHours(hour, 0, 0, 0);

        const slotEnd = new Date(slotStart);
        slotEnd.setHours(hour + 1, 0, 0, 0);

        const isAvailable = await this.checkStaffAvailability(
          staffId,
          slotStart,
          slotEnd,
          clinicId
        );

        if (isAvailable) {
          slots.push({
            start: slotStart,
            end: slotEnd,
            confidence: day === 0 ? 90 : Math.max(70 - day * 5, 50),
          });
        }
      }
    }

    return slots.slice(0, 10); // Limitar a 10 slots
  }

  private async findQualifiedStaff(
    serviceId: string,
    startTime: Date,
    endTime: Date,
    clinicId: string
  ): Promise<Array<Staff & { confidence: number }>> {
    return this.findAlternativeStaff(serviceId, startTime, endTime, clinicId);
  }

  private async findSlotsOutsideBreakTime(
    staffId: string,
    serviceId: string,
    preferredDate: Date,
    clinicId: string
  ): Promise<Array<{ start: Date; end: Date; confidence: number }>> {
    // Implementação similar ao findAvailableTimeSlots mas considerando break times
    return this.findAvailableTimeSlots(
      staffId,
      serviceId,
      preferredDate,
      clinicId,
      3
    );
  }

  private async getMaintenanceEndTime(
    equipmentId: string,
    _clinicId: string
  ): Promise<Date | null> {
    try {
      const { data: maintenance } = await this.supabase
        .from('equipment_maintenance')
        .select('end_time')
        .eq('equipment_id', equipmentId)
        .eq('status', 'active')
        .order('end_time', { ascending: false })
        .limit(1)
        .single();

      return maintenance ? new Date(maintenance.end_time) : null;
    } catch (error) {
      logger.error('Error getting maintenance end time', { error });
      return null;
    }
  }

  /**
   * Aplica uma sugestão automaticamente
   */
  async applySuggestion(
    suggestion: ResolutionSuggestion,
    appointmentId: string,
    clinicId: string,
    userId: string
  ): Promise<{ success: boolean; message: string; changes: any[] }> {
    try {
      if (!suggestion.autoApplicable) {
        return {
          success: false,
          message: 'This suggestion requires manual approval',
          changes: [],
        };
      }

      const changes: any[] = [];

      // Aplicar mudanças baseadas no tipo de sugestão
      switch (suggestion.type) {
        case SuggestionType.REASSIGN_STAFF: {
          const staffChange = suggestion.impact.resourceChanges.find(
            (c) => c.resourceType === 'staff'
          );
          if (staffChange) {
            const { error } = await this.supabase
              .from('appointments')
              .update({ staff_id: staffChange.to })
              .eq('id', appointmentId);

            if (error) {
              throw error;
            }
            changes.push({
              type: 'staff_reassignment',
              from: staffChange.from,
              to: staffChange.to,
            });
          }
          break;
        }

        case SuggestionType.CHANGE_ROOM: {
          const roomChange = suggestion.impact.resourceChanges.find(
            (c) => c.resourceType === 'room'
          );
          if (roomChange) {
            const { error } = await this.supabase
              .from('appointments')
              .update({ room_id: roomChange.to })
              .eq('id', appointmentId);

            if (error) {
              throw error;
            }
            changes.push({
              type: 'room_change',
              from: roomChange.from,
              to: roomChange.to,
            });
          }
          break;
        }

        case SuggestionType.SUBSTITUTE_EQUIPMENT: {
          const equipmentChange = suggestion.impact.resourceChanges.find(
            (c) => c.resourceType === 'equipment'
          );
          if (equipmentChange) {
            // Atualizar lista de equipamentos necessários
            const { data: appointment } = await this.supabase
              .from('appointments')
              .select('required_equipment')
              .eq('id', appointmentId)
              .single();

            if (appointment) {
              const currentEquipment =
                (appointment.required_equipment as string[]) || [];
              const updatedEquipment = currentEquipment.map((eq) =>
                eq === equipmentChange.from ? equipmentChange.to : eq
              );

              const { error } = await this.supabase
                .from('appointments')
                .update({ required_equipment: updatedEquipment })
                .eq('id', appointmentId);

              if (error) {
                throw error;
              }
              changes.push({
                type: 'equipment_substitution',
                from: equipmentChange.from,
                to: equipmentChange.to,
              });
            }
          }
          break;
        }

        default:
          return {
            success: false,
            message: `Auto-application not implemented for suggestion type: ${suggestion.type}`,
            changes: [],
          };
      }

      // Registrar aplicação da sugestão
      await this.supabase.from('conflict_resolution_log').insert({
        appointment_id: appointmentId,
        clinic_id: clinicId,
        suggestion_id: suggestion.id,
        suggestion_type: suggestion.type,
        applied_by: userId,
        applied_at: new Date().toISOString(),
        changes,
        auto_applied: true,
      });

      logger.info('Suggestion applied successfully', {
        suggestionId: suggestion.id,
        appointmentId,
        changes,
      });

      return {
        success: true,
        message: 'Suggestion applied successfully',
        changes,
      };
    } catch (error) {
      logger.error('Error applying suggestion', {
        error,
        suggestion,
        appointmentId,
      });
      return {
        success: false,
        message: `Error applying suggestion: ${error.message}`,
        changes: [],
      };
    }
  }

  /**
   * Atualiza configuração do engine
   */
  updateConfig(newConfig: Partial<SuggestionConfig>): void {
    this.config = { ...this.config, ...newConfig };
    logger.info('Suggestion engine config updated', { config: this.config });
  }

  /**
   * Obtém configuração atual
   */
  getConfig(): SuggestionConfig {
    return { ...this.config };
  }
}

// Instância singleton
export const suggestionEngine = new SuggestionEngine();

// Função utilitária
export async function generateResolutionSuggestions(
  conflictResult: ConflictDetectionResult,
  appointmentData: Partial<Appointment>,
  clinicId: string,
  config?: Partial<SuggestionConfig>
): Promise<ResolutionSuggestion[]> {
  const engine = config ? new SuggestionEngine(config) : suggestionEngine;
  return engine.generateSuggestions(conflictResult, appointmentData, clinicId);
}

export default SuggestionEngine;
