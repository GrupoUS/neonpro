/**
 * 📅 Enhanced Appointment Management Hooks - NeonPro Healthcare
 * ==============================================================
 *
 * Type-safe appointment management hooks with scheduling optimization,
 * clinical workflow integration, and healthcare compliance features.
 */

// Import our enhanced API client
import {
  ApiHelpers,
  type ApiResponse,
  apiClient,
} from '@neonpro/shared/api-client';
// Import validation schemas and types
import {
  // Types
  type AppointmentBase,
  // Appointment schemas
  AppointmentBaseSchema,
  type AppointmentNote,
  AppointmentNoteSchema,
  type AppointmentPriority,
  type AppointmentQuery,
  AppointmentQuerySchema,
  type AppointmentResponse,
  AppointmentResponseSchema,
  type AppointmentStats,
  AppointmentStatsSchema,
  type AppointmentStatus,
  type AppointmentsListResponse,
  AppointmentsListResponseSchema,
  type AppointmentType,
  type AvailabilitySlot,
  AvailabilitySlotSchema,
  type BulkUpdateAppointments,
  BulkUpdateAppointmentsSchema,
  type CheckInAppointment,
  CheckInAppointmentSchema,
  type CompleteAppointment,
  CompleteAppointmentSchema,
  type CreateAppointment,
  CreateAppointmentSchema,
  type DailySchedule,
  // Schedule schemas
  DailyScheduleSchema,
  type FileAttachment,
  FileAttachmentSchema,
  type PaymentMethod,
  type PaymentStatus,
  type Prescription,
  PrescriptionSchema,
  type ServicePerformed,
  ServicePerformedSchema,
  type UpdateAppointment,
  UpdateAppointmentSchema,
  type VitalSigns,
  // Clinical data schemas
  VitalSignsSchema,
  type WeeklyScheduleResponse,
  WeeklyScheduleResponseSchema,
} from '@neonpro/shared/schemas';
import { useCallback, useMemo } from 'react';
import { toast } from 'sonner';
// Import our enhanced query utilities
import {
  HealthcareQueryConfig,
  InvalidationHelpers,
  type PaginatedResponse,
  QueryKeys,
  useHealthcareQueryUtils,
} from '@/lib/query/query-utils';

// Appointment management context interface
export interface AppointmentManagementContext {
  // Basic operations
  createAppointment: ReturnType<typeof useCreateAppointment>;
  updateAppointment: ReturnType<typeof useUpdateAppointment>;
  cancelAppointment: ReturnType<typeof useCancelAppointment>;
  deleteAppointment: ReturnType<typeof useDeleteAppointment>;

  // Workflow operations
  checkInAppointment: ReturnType<typeof useCheckInAppointment>;
  completeAppointment: ReturnType<typeof useCompleteAppointment>;
  rescheduleAppointment: ReturnType<typeof useRescheduleAppointment>;

  // Data retrieval
  getAppointment: (id: string) => ReturnType<typeof useAppointment>;
  getAppointments: (
    filters?: AppointmentQuery
  ) => ReturnType<typeof useAppointments>;
  getAppointmentStats: ReturnType<typeof useAppointmentStats>;

  // Schedule management
  getDailySchedule: (
    date: string,
    professionalId?: string
  ) => ReturnType<typeof useDailySchedule>;
  getWeeklySchedule: (
    weekStart: string,
    professionalId?: string
  ) => ReturnType<typeof useWeeklySchedule>;
  getAvailableSlots: ReturnType<typeof useAvailableSlots>;

  // Bulk operations
  bulkUpdateAppointments: ReturnType<typeof useBulkUpdateAppointments>;

  // Utility functions
  utils: ReturnType<typeof useAppointmentUtils>;
}

// 📅 Get single appointment with clinical data
export function useAppointment(id: string) {
  const queryUtils = useHealthcareQueryUtils();

  return queryUtils.createQuery({
    queryKey: QueryKeys.appointments.detail(id),
    queryFn: async () => {
      const response = await apiClient.api.v1.appointments[':id'].$get({
        param: { id },
      });
      return await response.json();
    },
    validator: (data: unknown) => {
      const response = AppointmentResponseSchema.parse(data);
      if (!response.success) {
        throw new Error(response.error?.code || 'Failed to fetch appointment');
      }
      return response.data!.appointment;
    },
    enableAuditLogging: true,
    sensitiveData: true,
    lgpdCompliant: true,

    // Appointment data configuration
    staleTime: HealthcareQueryConfig.appointment.staleTime,
    gcTime: HealthcareQueryConfig.appointment.gcTime,

    retry: (failureCount, error) => {
      if (
        ApiHelpers.isAuthError(error) ||
        (error as any)?.message?.includes('not found')
      ) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

// 📅 Get appointments list with advanced filtering
export function useAppointments(filters?: AppointmentQuery) {
  const queryUtils = useHealthcareQueryUtils();

  return queryUtils.createQuery({
    queryKey: QueryKeys.appointments.list(filters),
    queryFn: async () => {
      const validatedFilters = filters
        ? AppointmentQuerySchema.parse(filters)
        : {};

      const response = await apiClient.api.v1.appointments.$get({
        query: validatedFilters as any,
      });
      return await response.json();
    },
    validator: (data: unknown) => {
      const response = AppointmentsListResponseSchema.parse(data);
      if (!response.success) {
        throw new Error(response.error?.code || 'Failed to fetch appointments');
      }
      return {
        appointments: response.data!.appointments,
        pagination: response.data!.pagination,
        summary: response.data!.summary,
      };
    },
    enableAuditLogging: true,
    sensitiveData: true,
    lgpdCompliant: true,

    // Appointment data configuration
    staleTime: HealthcareQueryConfig.appointment.staleTime,
    gcTime: HealthcareQueryConfig.appointment.gcTime,
  });
}

// 🏗️ Create new appointment with validation and scheduling logic
export function useCreateAppointment() {
  const queryUtils = useHealthcareQueryUtils();

  return queryUtils.createMutation({
    mutationFn: async (
      appointmentData: CreateAppointment
    ): Promise<ApiResponse<AppointmentResponse['data']>> => {
      // Validate appointment data
      const validatedData = CreateAppointmentSchema.parse(appointmentData);

      // Check for scheduling conflicts (could be done on backend)
      // Additional client-side validation could be added here

      const response = await apiClient.api.v1.appointments.$post({
        json: validatedData,
      });

      return await response.json();
    },

    validator: (data: unknown) => {
      const response = AppointmentResponseSchema.parse(data);
      if (!response.success) {
        throw new Error(response.error?.code || 'Failed to create appointment');
      }
      return response.data!;
    },

    enableAuditLogging: true,
    requiresConsent: true,
    lgpdCompliant: true,
    showSuccessToast: true,
    showErrorToast: true,
    successMessage: 'Consulta agendada com sucesso',

    // Invalidate appointment and schedule data
    invalidateQueries: [
      QueryKeys.appointments.all(),
      QueryKeys.appointments.stats(),
      QueryKeys.professionals.all(), // For schedules
    ],

    onSuccess: (response, variables) => {
      // Log appointment creation
      const user = apiClient.auth.getUser();
      if (user && response.appointment) {
        apiClient.audit.log({
          timestamp: new Date().toISOString(),
          userId: user.id,
          sessionId: apiClient.auth.getSessionId() || undefined,
          action: 'create',
          resource_type: 'appointment',
          resource_id: response.appointment.id,
          ip_address: apiClient.utils.getClientIP(),
          user_agent: apiClient.utils.getUserAgent(),
          success: true,
        });
      }
    },
  });
}

// ✏️ Update appointment with change tracking
export function useUpdateAppointment(id: string) {
  const queryUtils = useHealthcareQueryUtils();

  return queryUtils.createMutation({
    mutationFn: async (
      appointmentData: UpdateAppointment
    ): Promise<ApiResponse<AppointmentResponse['data']>> => {
      const validatedData = UpdateAppointmentSchema.parse(appointmentData);

      const response = await apiClient.api.v1.appointments[':id'].$put({
        param: { id },
        json: validatedData,
      });

      return await response.json();
    },

    validator: (data: unknown) => {
      const response = AppointmentResponseSchema.parse(data);
      if (!response.success) {
        throw new Error(response.error?.code || 'Failed to update appointment');
      }
      return response.data!;
    },

    enableAuditLogging: true,
    requiresConsent: true,
    lgpdCompliant: true,
    showSuccessToast: true,
    showErrorToast: true,
    successMessage: 'Consulta atualizada com sucesso',

    // Invalidate related queries
    invalidateQueries: [
      QueryKeys.appointments.detail(id),
      QueryKeys.appointments.all(),
      QueryKeys.professionals.all(), // For schedules
    ],

    // Optimistic update
    ...queryUtils.createOptimisticUpdate<AppointmentBase>(
      QueryKeys.appointments.detail(id),
      (oldData) =>
        oldData
          ? { ...oldData, ...appointmentData }
          : (oldData as AppointmentBase)
    ),

    onSuccess: (response, variables) => {
      // Log appointment update
      const user = apiClient.auth.getUser();
      if (user) {
        apiClient.audit.log({
          timestamp: new Date().toISOString(),
          userId: user.id,
          sessionId: apiClient.auth.getSessionId() || undefined,
          action: 'update',
          resource_type: 'appointment',
          resource_id: id,
          ip_address: apiClient.utils.getClientIP(),
          user_agent: apiClient.utils.getUserAgent(),
          success: true,
        });
      }
    },
  });
}

// 🚫 Cancel appointment with reason tracking
export function useCancelAppointment() {
  const queryUtils = useHealthcareQueryUtils();

  return queryUtils.createMutation({
    mutationFn: async ({
      id,
      reason,
      notes,
    }: {
      id: string;
      reason: string;
      notes?: string;
    }): Promise<ApiResponse<AppointmentResponse['data']>> => {
      const response = await apiClient.api.v1.appointments[':id'].cancel.$post({
        param: { id },
        json: { cancellation_reason: reason, cancellation_notes: notes },
      });

      return await response.json();
    },

    validator: (data: unknown) => {
      const response = AppointmentResponseSchema.parse(data);
      if (!response.success) {
        throw new Error(response.error?.code || 'Failed to cancel appointment');
      }
      return response.data!;
    },

    enableAuditLogging: true,
    requiresConsent: true,
    lgpdCompliant: true,
    showSuccessToast: true,
    showErrorToast: true,
    successMessage: 'Consulta cancelada com sucesso',

    invalidateQueries: [
      QueryKeys.appointments.all(),
      QueryKeys.appointments.stats(),
      QueryKeys.professionals.all(),
    ],

    onSuccess: (response, variables) => {
      // Log appointment cancellation
      const user = apiClient.auth.getUser();
      if (user) {
        apiClient.audit.log({
          timestamp: new Date().toISOString(),
          userId: user.id,
          sessionId: apiClient.auth.getSessionId() || undefined,
          action: 'update',
          resource_type: 'appointment',
          resource_id: variables.id,
          ip_address: apiClient.utils.getClientIP(),
          user_agent: apiClient.utils.getUserAgent(),
          success: true,
        });
      }
    },
  });
}

// 🗑️ Delete appointment (admin only)
export function useDeleteAppointment() {
  const queryUtils = useHealthcareQueryUtils();

  return queryUtils.createMutation({
    mutationFn: async (id: string): Promise<ApiResponse<void>> => {
      const response = await apiClient.api.v1.appointments[':id'].$delete({
        param: { id },
      });

      return await response.json();
    },

    enableAuditLogging: true,
    requiresConsent: true,
    lgpdCompliant: true,
    showSuccessToast: true,
    showErrorToast: true,
    successMessage: 'Consulta removida com sucesso',

    invalidateQueries: [
      QueryKeys.appointments.all(),
      QueryKeys.appointments.stats(),
    ],

    onMutate: async (id: string) => {
      // Show confirmation dialog
      const confirmed = window.confirm(
        'Tem certeza que deseja remover esta consulta? Esta ação não pode ser desfeita.'
      );

      if (!confirmed) {
        throw new Error('Operação cancelada pelo usuário');
      }

      return { id };
    },

    onSuccess: (response, id) => {
      // Clear appointment from cache
      queryUtils.queryClient.removeQueries({
        queryKey: QueryKeys.appointments.detail(id),
      });

      // Log appointment deletion
      const user = apiClient.auth.getUser();
      if (user) {
        apiClient.audit.log({
          timestamp: new Date().toISOString(),
          userId: user.id,
          sessionId: apiClient.auth.getSessionId() || undefined,
          action: 'delete',
          resource_type: 'appointment',
          resource_id: id,
          ip_address: apiClient.utils.getClientIP(),
          user_agent: apiClient.utils.getUserAgent(),
          success: true,
        });
      }
    },
  });
}

// 📋 Check-in appointment with vital signs
export function useCheckInAppointment() {
  const queryUtils = useHealthcareQueryUtils();

  return queryUtils.createMutation({
    mutationFn: async ({
      id,
      checkInData,
    }: {
      id: string;
      checkInData: CheckInAppointment;
    }): Promise<ApiResponse<AppointmentResponse['data']>> => {
      const validatedData = CheckInAppointmentSchema.parse(checkInData);

      const response = await apiClient.api.v1.appointments[':id'][
        'check-in'
      ].$post({
        param: { id },
        json: validatedData,
      });

      return await response.json();
    },

    validator: (data: unknown) => {
      const response = AppointmentResponseSchema.parse(data);
      if (!response.success) {
        throw new Error(
          response.error?.code || 'Failed to check in appointment'
        );
      }
      return response.data!;
    },

    enableAuditLogging: true,
    requiresConsent: true,
    lgpdCompliant: true,
    showSuccessToast: true,
    showErrorToast: true,
    successMessage: 'Check-in realizado com sucesso',

    invalidateQueries: [QueryKeys.appointments.all()],

    onSuccess: (response, variables) => {
      // Log check-in
      const user = apiClient.auth.getUser();
      if (user) {
        apiClient.audit.log({
          timestamp: new Date().toISOString(),
          userId: user.id,
          sessionId: apiClient.auth.getSessionId() || undefined,
          action: 'update',
          resource_type: 'appointment',
          resource_id: variables.id,
          ip_address: apiClient.utils.getClientIP(),
          user_agent: apiClient.utils.getUserAgent(),
          success: true,
        });
      }
    },
  });
}

// ✅ Complete appointment with clinical data
export function useCompleteAppointment() {
  const queryUtils = useHealthcareQueryUtils();

  return queryUtils.createMutation({
    mutationFn: async ({
      id,
      completionData,
    }: {
      id: string;
      completionData: CompleteAppointment;
    }): Promise<ApiResponse<AppointmentResponse['data']>> => {
      const validatedData = CompleteAppointmentSchema.parse(completionData);

      const response = await apiClient.api.v1.appointments[
        ':id'
      ].complete.$post({
        param: { id },
        json: validatedData,
      });

      return await response.json();
    },

    validator: (data: unknown) => {
      const response = AppointmentResponseSchema.parse(data);
      if (!response.success) {
        throw new Error(
          response.error?.code || 'Failed to complete appointment'
        );
      }
      return response.data!;
    },

    enableAuditLogging: true,
    requiresConsent: true,
    lgpdCompliant: true,
    showSuccessToast: true,
    showErrorToast: true,
    successMessage: 'Consulta finalizada com sucesso',

    invalidateQueries: [
      QueryKeys.appointments.detail(id),
      QueryKeys.appointments.all(),
      QueryKeys.appointments.stats(),
    ],

    onSuccess: (response, variables) => {
      // Log appointment completion
      const user = apiClient.auth.getUser();
      if (user) {
        apiClient.audit.log({
          timestamp: new Date().toISOString(),
          userId: user.id,
          sessionId: apiClient.auth.getSessionId() || undefined,
          action: 'update',
          resource_type: 'appointment',
          resource_id: variables.id,
          ip_address: apiClient.utils.getClientIP(),
          user_agent: apiClient.utils.getUserAgent(),
          success: true,
        });
      }
    },
  });
}

// 🔄 Reschedule appointment
export function useRescheduleAppointment() {
  const queryUtils = useHealthcareQueryUtils();

  return queryUtils.createMutation({
    mutationFn: async ({
      id,
      newDate,
      newTime,
      reason,
    }: {
      id: string;
      newDate: string;
      newTime: string;
      reason?: string;
    }): Promise<ApiResponse<AppointmentResponse['data']>> => {
      const response = await apiClient.api.v1.appointments[
        ':id'
      ].reschedule.$post({
        param: { id },
        json: {
          scheduled_date: newDate,
          scheduled_time: newTime,
          reschedule_reason: reason,
        },
      });

      return await response.json();
    },

    validator: (data: unknown) => {
      const response = AppointmentResponseSchema.parse(data);
      if (!response.success) {
        throw new Error(
          response.error?.code || 'Failed to reschedule appointment'
        );
      }
      return response.data!;
    },

    enableAuditLogging: true,
    requiresConsent: true,
    lgpdCompliant: true,
    showSuccessToast: true,
    showErrorToast: true,
    successMessage: 'Consulta reagendada com sucesso',

    invalidateQueries: [
      QueryKeys.appointments.detail(id),
      QueryKeys.appointments.all(),
      QueryKeys.professionals.all(),
    ],
  });
}

// 📊 Get appointment statistics
export function useAppointmentStats() {
  const queryUtils = useHealthcareQueryUtils();

  return queryUtils.createQuery({
    queryKey: QueryKeys.appointments.stats(),
    queryFn: async () => {
      const response = await apiClient.api.v1.appointments.stats.$get();
      return await response.json();
    },
    validator: (data: unknown) => AppointmentStatsSchema.parse(data),
    enableAuditLogging: false,
    sensitiveData: false,
    lgpdCompliant: true,

    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 15, // 15 minutes
  });
}

// 📅 Get daily schedule for a professional
export function useDailySchedule(date: string, professionalId?: string) {
  const queryUtils = useHealthcareQueryUtils();

  return queryUtils.createQuery({
    queryKey: professionalId
      ? QueryKeys.professionals.schedule(professionalId, date)
      : QueryKeys.appointments.calendar(date),
    queryFn: async () => {
      const response = professionalId
        ? await apiClient.api.v1.professionals[':id'].schedule[':date'].$get({
            param: { id: professionalId, date },
          })
        : await apiClient.api.v1.appointments.schedule[':date'].$get({
            param: { date },
          });
      return await response.json();
    },
    validator: (data: unknown) => DailyScheduleSchema.parse(data),
    enableAuditLogging: false,
    sensitiveData: true,
    lgpdCompliant: true,

    staleTime: 1000 * 60 * 2, // 2 minutes for schedules
    gcTime: 1000 * 60 * 5, // 5 minutes
  });
}

// 📅 Get weekly schedule
export function useWeeklySchedule(weekStart: string, professionalId?: string) {
  const queryUtils = useHealthcareQueryUtils();

  return queryUtils.createQuery({
    queryKey: professionalId
      ? [
          ...QueryKeys.professionals.schedule(professionalId, weekStart),
          'weekly',
        ]
      : [...QueryKeys.appointments.calendar(weekStart), 'weekly'],
    queryFn: async () => {
      const response = professionalId
        ? await apiClient.api.v1.professionals[':id'].schedule.weekly.$get({
            param: { id: professionalId },
            query: { week_start: weekStart },
          })
        : await apiClient.api.v1.appointments.schedule.weekly.$get({
            query: { week_start: weekStart },
          });
      return await response.json();
    },
    validator: (data: unknown) => {
      const response = WeeklyScheduleResponseSchema.parse(data);
      if (!response.success) {
        throw new Error('Failed to fetch weekly schedule');
      }
      return response.data!;
    },
    enableAuditLogging: false,
    sensitiveData: true,
    lgpdCompliant: true,

    staleTime: 1000 * 60 * 5, // 5 minutes for weekly schedules
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
}

// 🕐 Get available appointment slots
export function useAvailableSlots() {
  const queryUtils = useHealthcareQueryUtils();

  return useCallback(
    (professionalId: string, date: string, serviceId?: string) => {
      return queryUtils.createQuery({
        queryKey: [
          'appointments',
          'available-slots',
          professionalId,
          date,
          serviceId,
        ],
        queryFn: async () => {
          const response = await apiClient.api.v1.appointments[
            'available-slots'
          ].$get({
            query: {
              professional_id: professionalId,
              date,
              service_id: serviceId,
            },
          });
          return await response.json();
        },
        validator: (data: unknown) => {
          if (!Array.isArray(data))
            throw new Error('Invalid available slots response');
          return data.map((slot) => AvailabilitySlotSchema.parse(slot));
        },
        enableAuditLogging: false,
        sensitiveData: false,
        lgpdCompliant: true,

        staleTime: 1000 * 60 * 1, // 1 minute for availability
        gcTime: 1000 * 60 * 2, // 2 minutes
      });
    },
    [queryUtils]
  );
}

// 🔄 Bulk update appointments
export function useBulkUpdateAppointments() {
  const queryUtils = useHealthcareQueryUtils();

  return queryUtils.createMutation({
    mutationFn: async (
      bulkData: BulkUpdateAppointments
    ): Promise<ApiResponse<{ updated_count: number }>> => {
      const validatedData = BulkUpdateAppointmentsSchema.parse(bulkData);

      const response = await apiClient.api.v1.appointments.bulk.$put({
        json: validatedData,
      });

      return await response.json();
    },

    enableAuditLogging: true,
    requiresConsent: true,
    lgpdCompliant: true,
    showSuccessToast: true,
    showErrorToast: true,
    successMessage: 'Consultas atualizadas com sucesso',

    invalidateQueries: [
      QueryKeys.appointments.all(),
      QueryKeys.appointments.stats(),
    ],
  });
}

// 🛠️ Appointment utilities hook
export function useAppointmentUtils() {
  const queryUtils = useHealthcareQueryUtils();

  return useMemo(
    () => ({
      // Format appointment time display
      formatAppointmentTime: (appointment: AppointmentBase): string => {
        const date = new Date(appointment.scheduled_date);
        const time = appointment.scheduled_time;

        return `${date.toLocaleDateString('pt-BR')} às ${time}`;
      },

      // Calculate appointment duration
      getAppointmentDuration: (appointment: AppointmentBase): string => {
        const duration = appointment.duration_minutes;
        const hours = Math.floor(duration / 60);
        const minutes = duration % 60;

        if (hours > 0) {
          return `${hours}h${minutes > 0 ? ` ${minutes}min` : ''}`;
        }
        return `${minutes}min`;
      },

      // Get appointment status color
      getStatusColor: (status: AppointmentStatus): string => {
        const colors = {
          scheduled: '#3b82f6', // blue
          confirmed: '#10b981', // green
          in_progress: '#f59e0b', // amber
          completed: '#059669', // emerald
          cancelled: '#ef4444', // red
          no_show: '#dc2626', // red-600
          rescheduled: '#8b5cf6', // violet
        };
        return colors[status] || '#6b7280'; // gray
      },

      // Get priority badge info
      getPriorityBadge: (priority: AppointmentPriority) => {
        const badges = {
          low: { label: 'Baixa', color: '#10b981', bgColor: '#d1fae5' },
          normal: { label: 'Normal', color: '#3b82f6', bgColor: '#dbeafe' },
          high: { label: 'Alta', color: '#f59e0b', bgColor: '#fef3c7' },
          urgent: { label: 'Urgente', color: '#ef4444', bgColor: '#fee2e2' },
        };
        return badges[priority] || badges.normal;
      },

      // Calculate time until appointment
      getTimeUntilAppointment: (appointment: AppointmentBase): string => {
        const appointmentTime = new Date(
          `${appointment.scheduled_date}T${appointment.scheduled_time}`
        );
        const now = new Date();
        const diffMs = appointmentTime.getTime() - now.getTime();

        if (diffMs < 0) return 'Vencido';

        const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));
        const diffHours = Math.floor(
          (diffMs % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000)
        );
        const diffMinutes = Math.floor(
          (diffMs % (60 * 60 * 1000)) / (60 * 1000)
        );

        if (diffDays > 0) return `${diffDays} dias`;
        if (diffHours > 0)
          return `${diffHours}h${diffMinutes > 0 ? ` ${diffMinutes}min` : ''}`;
        return `${diffMinutes} minutos`;
      },

      // Check if appointment is today
      isToday: (appointment: AppointmentBase): boolean => {
        const appointmentDate = new Date(appointment.scheduled_date);
        const today = new Date();
        return appointmentDate.toDateString() === today.toDateString();
      },

      // Check if appointment is overdue
      isOverdue: (appointment: AppointmentBase): boolean => {
        const appointmentTime = new Date(
          `${appointment.scheduled_date}T${appointment.scheduled_time}`
        );
        return (
          appointmentTime < new Date() &&
          !['completed', 'cancelled', 'no_show'].includes(appointment.status)
        );
      },

      // Get next appointment status in workflow
      getNextStatus: (
        currentStatus: AppointmentStatus
      ): AppointmentStatus[] => {
        const statusFlow = {
          scheduled: ['confirmed', 'cancelled'],
          confirmed: ['in_progress', 'cancelled', 'no_show'],
          in_progress: ['completed'],
          completed: [],
          cancelled: [],
          no_show: [],
          rescheduled: ['scheduled'],
        };
        return statusFlow[currentStatus] || [];
      },

      // Format payment status
      formatPaymentStatus: (status: PaymentStatus): string => {
        const labels = {
          pending: 'Pendente',
          paid: 'Pago',
          partial: 'Parcial',
          overdue: 'Em Atraso',
          cancelled: 'Cancelado',
          refunded: 'Reembolsado',
        };
        return labels[status] || status;
      },

      // Get appointment revenue
      getAppointmentRevenue: (appointment: AppointmentBase): number => {
        return appointment.services_performed.reduce(
          (total, service) => total + service.final_price,
          0
        );
      },

      // Check if appointment can be modified
      canModifyAppointment: (appointment: AppointmentBase): boolean => {
        return !['completed', 'cancelled', 'no_show'].includes(
          appointment.status
        );
      },

      // Check if appointment can be cancelled
      canCancelAppointment: (appointment: AppointmentBase): boolean => {
        return ['scheduled', 'confirmed'].includes(appointment.status);
      },

      // Invalidate appointment data
      invalidateAppointment: (appointmentId: string) => {
        InvalidationHelpers.invalidateAppointmentData(
          queryUtils.queryClient,
          appointmentId
        );
      },

      // Invalidate all appointment data
      invalidateAllAppointments: () => {
        InvalidationHelpers.invalidateAppointmentData(queryUtils.queryClient);
      },

      // Generate appointment summary
      generateAppointmentSummary: (appointment: AppointmentBase): string => {
        const parts = [
          appointment.patient_name,
          appointment.service_name,
          appointment.professional_name,
          `${appointment.scheduled_date} ${appointment.scheduled_time}`,
        ].filter(Boolean);

        return parts.join(' - ');
      },
    }),
    [queryUtils]
  );
}

// 🎯 Complete appointment management context hook
export function useAppointmentManagement(): AppointmentManagementContext {
  const createAppointment = useCreateAppointment();
  const updateAppointment = useUpdateAppointment;
  const cancelAppointment = useCancelAppointment();
  const deleteAppointment = useDeleteAppointment();
  const checkInAppointment = useCheckInAppointment();
  const completeAppointment = useCompleteAppointment();
  const rescheduleAppointment = useRescheduleAppointment();
  const getAppointmentStats = useAppointmentStats();
  const bulkUpdateAppointments = useBulkUpdateAppointments();
  const getAvailableSlots = useAvailableSlots();
  const utils = useAppointmentUtils();

  return useMemo<AppointmentManagementContext>(
    () => ({
      // Basic operations
      createAppointment,
      updateAppointment,
      cancelAppointment,
      deleteAppointment,

      // Workflow operations
      checkInAppointment,
      completeAppointment,
      rescheduleAppointment,

      // Data retrieval
      getAppointment: useAppointment,
      getAppointments: useAppointments,
      getAppointmentStats,

      // Schedule management
      getDailySchedule: useDailySchedule,
      getWeeklySchedule: useWeeklySchedule,
      getAvailableSlots,

      // Bulk operations
      bulkUpdateAppointments,

      // Utility functions
      utils,
    }),
    [
      createAppointment,
      updateAppointment,
      cancelAppointment,
      deleteAppointment,
      checkInAppointment,
      completeAppointment,
      rescheduleAppointment,
      getAppointmentStats,
      bulkUpdateAppointments,
      getAvailableSlots,
      utils,
    ]
  );
}

// Export all hooks for individual use
export {
  useAppointment,
  useAppointments,
  useCreateAppointment,
  useUpdateAppointment,
  useCancelAppointment,
  useDeleteAppointment,
  useCheckInAppointment,
  useCompleteAppointment,
  useRescheduleAppointment,
  useAppointmentStats,
  useDailySchedule,
  useWeeklySchedule,
  useAvailableSlots,
  useBulkUpdateAppointments,
  useAppointmentUtils,
  useAppointmentManagement,
};
