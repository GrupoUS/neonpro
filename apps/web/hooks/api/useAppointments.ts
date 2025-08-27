/**
 * 📅 Appointment Hooks - NeonPro Healthcare
 * =========================================
 *
 * Hooks customizados para gerenciamento de agendamentos
 * com TanStack Query e integração Hono RPC.
 */

import { apiClient } from "@neonpro/shared/api-client";
import type {
  Appointment,
  AppointmentSearch,
  AvailabilitySearch,
  CancelAppointment,
  CreateAppointment,
  PaginatedResponse,
  RescheduleAppointment,
  TimeSlot,
  UpdateAppointment,
} from "@neonpro/shared/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Query keys for appointments
export const APPOINTMENT_QUERY_KEYS = {
  all: ["appointments"] as const,
  lists: () => [...APPOINTMENT_QUERY_KEYS.all, "list"] as const,
  list: (filters: AppointmentSearch) => [...APPOINTMENT_QUERY_KEYS.lists(), filters] as const,
  details: () => [...APPOINTMENT_QUERY_KEYS.all, "detail"] as const,
  detail: (id: string) => [...APPOINTMENT_QUERY_KEYS.details(), id] as const,
  availability: (params: AvailabilitySearch) =>
    [...APPOINTMENT_QUERY_KEYS.all, "availability", params] as const,
  stats: () => [...APPOINTMENT_QUERY_KEYS.all, "stats"] as const,
  calendar: (filters: {
    startDate: string;
    endDate: string;
    [key: string]: unknown;
  }) => [...APPOINTMENT_QUERY_KEYS.all, "calendar", filters] as const,
} as const;

// 📋 Get appointments list with pagination
export function useAppointments(params: AppointmentSearch = {}) {
  return useQuery({
    queryKey: APPOINTMENT_QUERY_KEYS.list(params),
    queryFn: async (): Promise<PaginatedResponse<Appointment>> => {
      const queryParams: Record<string, string> = {
        page: params.page?.toString() ?? "1",
        limit: params.limit?.toString() ?? "20",
        sortBy: params.sortBy ?? "scheduledAt",
        sortOrder: params.sortOrder ?? "asc",
      };

      // Add optional filters
      if (params.startDate) {
        queryParams.startDate = params.startDate;
      }
      if (params.endDate) {
        queryParams.endDate = params.endDate;
      }
      if (params.patientId) {
        queryParams.patientId = params.patientId;
      }
      if (params.professionalId) {
        queryParams.professionalId = params.professionalId;
      }
      if (params.clinicId) {
        queryParams.clinicId = params.clinicId;
      }
      if (params.status) {
        queryParams.status = params.status;
      }
      if (params.type) {
        queryParams.type = params.type;
      }
      if (params.priority) {
        queryParams.priority = params.priority;
      }
      if (params.query) {
        queryParams.query = params.query;
      }

      const response = await apiClient.api.v1.appointments.$get({
        query: queryParams,
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || "Failed to fetch appointments");
      }

      return result as PaginatedResponse<Appointment>;
    },
    staleTime: 1000 * 30, // 30 seconds (appointments change frequently)
    gcTime: 1000 * 60 * 2, // 2 minutes
  });
}

// 👤 Get single appointment by ID
export function useAppointment(appointmentId: string | undefined) {
  return useQuery({
    queryKey: APPOINTMENT_QUERY_KEYS.detail(appointmentId!),
    queryFn: async (): Promise<Appointment> => {
      const response = await apiClient.api.v1.appointments[":id"].$get({
        param: { id: appointmentId! },
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || "Failed to fetch appointment");
      }

      return result.data as Appointment;
    },
    enabled: Boolean(appointmentId),
    staleTime: 1000 * 60, // 1 minute
    gcTime: 1000 * 60 * 5, // 5 minutes
  });
}

// ➕ Create appointment mutation
export function useCreateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      appointmentData: CreateAppointment,
    ): Promise<Appointment> => {
      const response = await apiClient.api.v1.appointments.$post({
        json: appointmentData,
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || "Failed to create appointment");
      }

      return result.data as Appointment;
    },

    onSuccess: (newAppointment) => {
      // Add to appointment detail cache
      queryClient.setQueryData(
        APPOINTMENT_QUERY_KEYS.detail(newAppointment.id),
        newAppointment,
      );

      // Invalidate lists to show new appointment
      queryClient.invalidateQueries({
        queryKey: APPOINTMENT_QUERY_KEYS.lists(),
      });

      // Invalidate availability for the professional/date
      queryClient.invalidateQueries({
        queryKey: [...APPOINTMENT_QUERY_KEYS.all, "availability"],
      });

      // Update calendar views
      queryClient.invalidateQueries({
        queryKey: [...APPOINTMENT_QUERY_KEYS.all, "calendar"],
      });

      // Update stats
      queryClient.invalidateQueries({
        queryKey: APPOINTMENT_QUERY_KEYS.stats(),
      });
    },
  });
}

// ✏️ Update appointment mutation
export function useUpdateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updateData: UpdateAppointment): Promise<Appointment> => {
      const { id, ...data } = updateData;

      const response = await apiClient.api.v1.appointments[":id"].$put({
        param: { id },
        json: data,
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || "Failed to update appointment");
      }

      return result.data as Appointment;
    },

    onSuccess: (updatedAppointment) => {
      // Update appointment detail cache
      queryClient.setQueryData(
        APPOINTMENT_QUERY_KEYS.detail(updatedAppointment.id),
        updatedAppointment,
      );

      // Update appointment in lists
      queryClient.setQueriesData(
        { queryKey: APPOINTMENT_QUERY_KEYS.lists() },
        (old: PaginatedResponse<Appointment> | undefined) => {
          if (!old?.data) {
            return old;
          }

          return {
            ...old,
            data: old.data.map((appointment) =>
              appointment.id === updatedAppointment.id
                ? updatedAppointment
                : appointment
            ),
          };
        },
      );

      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: [...APPOINTMENT_QUERY_KEYS.all, "availability"],
      });

      queryClient.invalidateQueries({
        queryKey: [...APPOINTMENT_QUERY_KEYS.all, "calendar"],
      });
    },
  });
}

// 📅 Reschedule appointment mutation
export function useRescheduleAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      rescheduleData: RescheduleAppointment,
    ): Promise<Appointment> => {
      const response = await apiClient.api.v1.appointments[
        ":id"
      ].reschedule.$post({
        param: { id: rescheduleData.id },
        json: {
          newScheduledAt: rescheduleData.newScheduledAt,
          reason: rescheduleData.reason,
        },
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || "Failed to reschedule appointment");
      }

      return result.data as Appointment;
    },

    onSuccess: (rescheduledAppointment) => {
      // Update caches similar to update
      queryClient.setQueryData(
        APPOINTMENT_QUERY_KEYS.detail(rescheduledAppointment.id),
        rescheduledAppointment,
      );

      // Invalidate availability and calendar
      queryClient.invalidateQueries({
        queryKey: [...APPOINTMENT_QUERY_KEYS.all, "availability"],
      });

      queryClient.invalidateQueries({
        queryKey: [...APPOINTMENT_QUERY_KEYS.all, "calendar"],
      });

      queryClient.invalidateQueries({
        queryKey: APPOINTMENT_QUERY_KEYS.lists(),
      });
    },
  });
}

// ❌ Cancel appointment mutation
export function useCancelAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (cancelData: CancelAppointment): Promise<Appointment> => {
      const response = await apiClient.api.v1.appointments[":id"].cancel.$post({
        param: { id: cancelData.id },
        json: {
          reason: cancelData.reason,
          cancelledBy: cancelData.cancelledBy,
        },
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || "Failed to cancel appointment");
      }

      return result.data as Appointment;
    },

    onSuccess: (cancelledAppointment) => {
      // Update appointment status to cancelled
      queryClient.setQueryData(
        APPOINTMENT_QUERY_KEYS.detail(cancelledAppointment.id),
        cancelledAppointment,
      );

      // Update in lists
      queryClient.setQueriesData(
        { queryKey: APPOINTMENT_QUERY_KEYS.lists() },
        (old: PaginatedResponse<Appointment> | undefined) => {
          if (!old?.data) {
            return old;
          }

          return {
            ...old,
            data: old.data.map((appointment) =>
              appointment.id === cancelledAppointment.id
                ? cancelledAppointment
                : appointment
            ),
          };
        },
      );

      // Invalidate availability (slot is now free)
      queryClient.invalidateQueries({
        queryKey: [...APPOINTMENT_QUERY_KEYS.all, "availability"],
      });

      queryClient.invalidateQueries({
        queryKey: [...APPOINTMENT_QUERY_KEYS.all, "calendar"],
      });

      // Update stats
      queryClient.invalidateQueries({
        queryKey: APPOINTMENT_QUERY_KEYS.stats(),
      });
    },
  });
}

// 🕐 Check availability
export function useAvailability(params: AvailabilitySearch | undefined) {
  return useQuery({
    queryKey: APPOINTMENT_QUERY_KEYS.availability(params!),
    queryFn: async (): Promise<TimeSlot[]> => {
      const response = await apiClient.api.v1.appointments.availability.$get({
        query: {
          professionalId: params?.professionalId,
          startDate: params?.startDate,
          endDate: params?.endDate,
          duration: params?.duration.toString(),
        },
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || "Failed to check availability");
      }

      return result.data as TimeSlot[];
    },
    enabled: Boolean(params?.professionalId
      && params?.startDate
      && params?.endDate
      && params?.duration),
    staleTime: 1000 * 30, // 30 seconds
    gcTime: 1000 * 60, // 1 minute
  });
}

// 📊 Appointment statistics
export function useAppointmentStats(filters?: {
  startDate?: string;
  endDate?: string;
  clinicId?: string;
}) {
  return useQuery({
    queryKey: [...APPOINTMENT_QUERY_KEYS.stats(), filters],
    queryFn: async () => {
      const queryParams: Record<string, string> = {};
      if (filters?.startDate) {
        queryParams.startDate = filters.startDate;
      }
      if (filters?.endDate) {
        queryParams.endDate = filters.endDate;
      }
      if (filters?.clinicId) {
        queryParams.clinicId = filters.clinicId;
      }

      const response = await apiClient.api.v1.appointments.stats.$get({
        query: queryParams,
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || "Failed to fetch appointment stats");
      }

      return result.data;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 5, // 5 minutes
  });
}

// 📅 Calendar view appointments
export function useCalendarAppointments(filters: {
  startDate: string;
  endDate: string;
  professionalId?: string;
  clinicId?: string;
}) {
  return useQuery({
    queryKey: APPOINTMENT_QUERY_KEYS.calendar(filters),
    queryFn: async (): Promise<Appointment[]> => {
      const queryParams: Record<string, string> = {
        startDate: filters.startDate,
        endDate: filters.endDate,
        sortBy: "scheduledAt",
        sortOrder: "asc",
        limit: "1000", // Get all appointments in date range
      };

      if (filters.professionalId) {
        queryParams.professionalId = filters.professionalId;
      }
      if (filters.clinicId) {
        queryParams.clinicId = filters.clinicId;
      }

      const response = await apiClient.api.v1.appointments.$get({
        query: queryParams,
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(
          result.message || "Failed to fetch calendar appointments",
        );
      }

      return (result as PaginatedResponse<Appointment>).data || [];
    },
    staleTime: 1000 * 30, // 30 seconds
    gcTime: 1000 * 60 * 2, // 2 minutes
  });
}

// 🔧 Appointment utilities
export function useAppointmentUtils() {
  const queryClient = useQueryClient();

  return {
    // Prefetch appointment details
    prefetchAppointment: async (appointmentId: string) => {
      await queryClient.prefetchQuery({
        queryKey: APPOINTMENT_QUERY_KEYS.detail(appointmentId),
        queryFn: async () => {
          const response = await apiClient.api.v1.appointments[":id"].$get({
            param: { id: appointmentId },
          });
          const result = await response.json();
          return result.data;
        },
        staleTime: 1000 * 60,
      });
    },

    // Invalidate all appointment queries
    invalidateAllAppointments: () => {
      queryClient.invalidateQueries({
        queryKey: APPOINTMENT_QUERY_KEYS.all,
      });
    },

    // Refresh availability for a specific professional
    refreshAvailability: (professionalId: string) => {
      queryClient.invalidateQueries({
        queryKey: [...APPOINTMENT_QUERY_KEYS.all, "availability"],
        predicate: (query) => {
          const params = query.queryKey[3] as AvailabilitySearch;
          return params?.professionalId === professionalId;
        },
      });
    },

    // Get appointment count for a specific date
    getAppointmentCount: (date: string, professionalId?: string): number => {
      const calendarData = queryClient.getQueriesData({
        queryKey: [...APPOINTMENT_QUERY_KEYS.all, "calendar"],
      });

      for (const [, data] of calendarData) {
        const appointments = data as Appointment[] | undefined;
        if (!appointments) {
          continue;
        }

        const count = appointments.filter((apt) => {
          const aptDate = apt.scheduledAt.split("T")[0];
          const matchesDate = aptDate === date;
          const matchesProfessional = !professionalId || apt.professionalId === professionalId;
          const isActive = !["cancelled", "no_show"].includes(apt.status);

          return matchesDate && matchesProfessional && isActive;
        }).length;

        if (count > 0) {
          return count;
        }
      }

      return 0;
    },
  };
}
