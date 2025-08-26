"use client";

import { useCallback, useEffect, useState } from "react";

export interface AppointmentRecurrence {
  type: "daily" | "weekly" | "monthly";
  interval: number;
  daysOfWeek?: number[];
  endDate?: Date;
  maxOccurrences?: number;
}

export interface RecurringAppointment {
  id: string;
  title: string;
  professional_id: string;
  service_id: string;
  patient_id: string;
  recurrence: AppointmentRecurrence;
  start_time: string;
  duration: number;
  created_at: string;
  is_active: boolean;
}

export interface AppointmentInstance {
  id: string;
  recurring_appointment_id: string;
  date: string;
  start_time: string;
  end_time: string;
  status: "scheduled" | "confirmed" | "cancelled" | "completed";
  is_exception: boolean;
}

export interface UseRecurringAppointmentsOptions {
  professionalId?: string;
  patientId?: string;
  dateRange?: { start: Date; end: Date };
}

export interface UseRecurringAppointmentsReturn {
  recurringAppointments: RecurringAppointment[];
  instances: AppointmentInstance[];
  isLoading: boolean;
  error: string | null;
  createRecurring: (
    appointment: Omit<RecurringAppointment, "id" | "created_at" | "is_active">,
  ) => Promise<string | null>;
  updateRecurring: (
    id: string,
    updates: Partial<RecurringAppointment>,
  ) => Promise<boolean>;
  cancelRecurring: (id: string) => Promise<boolean>;
  createException: (
    recurringId: string,
    date: string,
    changes?: Partial<AppointmentInstance>,
  ) => Promise<string | null>;
  generateInstances: (
    recurringId: string,
    dateRange: { start: Date; end: Date },
  ) => Promise<AppointmentInstance[]>;
  refreshData: () => Promise<void>;
}

export function useRecurringAppointments(
  options: UseRecurringAppointmentsOptions = {},
): UseRecurringAppointmentsReturn {
  const [recurringAppointments, setRecurringAppointments] = useState<
    RecurringAppointment[]
  >([]);
  const [instances, setInstances] = useState<AppointmentInstance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>();

  const refreshData = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(undefined);

      // Placeholder implementation
      const mockRecurring: RecurringAppointment[] = [
        {
          id: "1",
          title: "Weekly Consultation",
          professional_id: options.professionalId || "prof-1",
          service_id: "service-1",
          patient_id: options.patientId || "patient-1",
          recurrence: {
            type: "weekly",
            interval: 1,
            daysOfWeek: [1], // Monday
          },
          start_time: "09:00",
          duration: 60,
          created_at: new Date().toISOString(),
          is_active: true,
        },
      ];

      const mockInstances: AppointmentInstance[] = [
        {
          id: "inst-1",
          recurring_appointment_id: "1",
          date: new Date().toISOString().split("T")[0],
          start_time: "09:00",
          end_time: "10:00",
          status: "scheduled",
          is_exception: false,
        },
      ];

      setRecurringAppointments(mockRecurring);
      setInstances(mockInstances);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to refresh data";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [options.professionalId, options.patientId]);

  const createRecurring = useCallback(
    async (
      appointment: Omit<
        RecurringAppointment,
        "id" | "created_at" | "is_active"
      >,
    ): Promise<string | null> => {
      try {
        const newId = `recurring-${Date.now()}`;
        const newAppointment: RecurringAppointment = {
          ...appointment,
          id: newId,
          created_at: new Date().toISOString(),
          is_active: true,
        };

        setRecurringAppointments((prev) => [...prev, newAppointment]);
        return newId;
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to create recurring appointment";
        setError(errorMessage);
        return;
      }
    },
    [],
  );

  const updateRecurring = useCallback(
    async (
      id: string,
      updates: Partial<RecurringAppointment>,
    ): Promise<boolean> => {
      try {
        setRecurringAppointments((prev) =>
          prev.map((appointment) =>
            appointment.id === id
              ? { ...appointment, ...updates }
              : appointment,
          ),
        );

        return true;
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to update recurring appointment";
        setError(errorMessage);
        return false;
      }
    },
    [],
  );

  const cancelRecurring = useCallback(async (id: string): Promise<boolean> => {
    try {
      setRecurringAppointments((prev) =>
        prev.map((appointment) =>
          appointment.id === id
            ? { ...appointment, is_active: false }
            : appointment,
        ),
      );

      return true;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to cancel recurring appointment";
      setError(errorMessage);
      return false;
    }
  }, []);

  const createException = useCallback(
    async (
      recurringId: string,
      date: string,
      changes?: Partial<AppointmentInstance>,
    ): Promise<string | null> => {
      try {
        const newId = `exception-${Date.now()}`;
        const exception: AppointmentInstance = {
          id: newId,
          recurring_appointment_id: recurringId,
          date,
          start_time: "09:00",
          end_time: "10:00",
          status: "scheduled",
          is_exception: true,
          ...changes,
        };

        setInstances((prev) => [...prev, exception]);
        return newId;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to create exception";
        setError(errorMessage);
        return;
      }
    },
    [],
  );

  const generateInstances = useCallback(
    async (
      recurringId: string,
      dateRange: { start: Date; end: Date },
    ): Promise<AppointmentInstance[]> => {
      try {
        // Placeholder implementation
        const mockInstances: AppointmentInstance[] = [
          {
            id: `generated-${Date.now()}`,
            recurring_appointment_id: recurringId,
            date: dateRange.start.toISOString().split("T")[0],
            start_time: "09:00",
            end_time: "10:00",
            status: "scheduled",
            is_exception: false,
          },
        ];

        return mockInstances;
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to generate instances";
        setError(errorMessage);
        return [];
      }
    },
    [],
  );

  // Initialize data
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  return {
    recurringAppointments,
    instances,
    isLoading,
    error,
    createRecurring,
    updateRecurring,
    cancelRecurring,
    createException,
    generateInstances,
    refreshData,
  };
}
