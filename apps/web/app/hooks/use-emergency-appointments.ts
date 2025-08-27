"use client";

import { useCallback, useMemo, useState } from "react";

// Emergency appointment interfaces
export interface EmergencyDoctor {
  id: string;
  name: string;
  specialty: string;
  crm: string;
  available: boolean;
  nextSlot: string;
  emergencyRating: number; // 1-5 scale for emergency handling
  contact: {
    phone: string;
    extension?: string;
    location: string;
  };
  currentLoad: number; // 0-100 percentage
  estimatedResponseTime: string; // in minutes
}

export interface EmergencyAppointment {
  id: string;
  patientId: string;
  doctorId: string;
  scheduledAt: string;
  priority: "critical" | "urgent" | "high" | "normal";
  status: "scheduled" | "in_progress" | "completed" | "cancelled";
  type: "emergency" | "urgent_care" | "consultation";
  symptoms?: string;
  notes?: string;
  estimatedDuration: number; // in minutes
  roomNumber?: string;
  createdAt: string;
  createdBy: string;
}

// Booking request interface
interface EmergencyBookingRequest {
  patientId: string;
  doctorId: string;
  priority: EmergencyAppointment["priority"];
  symptoms?: string;
  notes?: string;
  preferredTime?: string;
}

// Hook return interface
interface UseEmergencyAppointmentsReturn {
  availableDoctors: EmergencyDoctor[];
  appointments: EmergencyAppointment[];
  bookEmergencyAppointment: (
    request: EmergencyBookingRequest,
  ) => Promise<EmergencyAppointment>;
  getAvailableDoctors: (specialty?: string) => Promise<EmergencyDoctor[]>;
  getAppointmentById: (id: string) => Promise<EmergencyAppointment | null>;
  cancelAppointment: (id: string, reason: string) => Promise<boolean>;
  updateAppointmentStatus: (
    id: string,
    status: EmergencyAppointment["status"],
  ) => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

// Mock emergency doctors data
const mockEmergencyDoctors: EmergencyDoctor[] = [
  {
    id: "DOC-EMG-001",
    name: "Dr. Ana Carolina Silva",
    specialty: "Medicina de Emergência",
    crm: "CRM/SP 123456",
    available: true,
    nextSlot: "10:30",
    emergencyRating: 5,
    contact: {
      phone: "(11) 3333-1001",
      extension: "101",
      location: "Sala de Emergência 1",
    },
    currentLoad: 30,
    estimatedResponseTime: "5",
  },
  {
    id: "DOC-EMG-002",
    name: "Dr. Carlos Eduardo Santos",
    specialty: "Cardiologia",
    crm: "CRM/SP 234567",
    available: true,
    nextSlot: "11:00",
    emergencyRating: 4,
    contact: {
      phone: "(11) 3333-1002",
      extension: "102",
      location: "Sala de Cardiologia",
    },
    currentLoad: 60,
    estimatedResponseTime: "15",
  },
  {
    id: "DOC-EMG-003",
    name: "Dra. Maria Fernanda Costa",
    specialty: "Neurologia",
    crm: "CRM/SP 345678",
    available: false,
    nextSlot: "14:30",
    emergencyRating: 5,
    contact: {
      phone: "(11) 3333-1003",
      extension: "103",
      location: "Sala de Neurologia",
    },
    currentLoad: 90,
    estimatedResponseTime: "30",
  },
  {
    id: "DOC-EMG-004",
    name: "Dr. Roberto Oliveira",
    specialty: "Cirurgia Geral",
    crm: "CRM/SP 456789",
    available: true,
    nextSlot: "12:15",
    emergencyRating: 4,
    contact: {
      phone: "(11) 3333-1004",
      extension: "104",
      location: "Centro Cirúrgico",
    },
    currentLoad: 45,
    estimatedResponseTime: "10",
  },
  {
    id: "DOC-EMG-005",
    name: "Dra. Juliana Rodrigues",
    specialty: "Pediatria de Emergência",
    crm: "CRM/SP 567890",
    available: true,
    nextSlot: "10:45",
    emergencyRating: 5,
    contact: {
      phone: "(11) 3333-1005",
      extension: "105",
      location: "Emergência Pediátrica",
    },
    currentLoad: 20,
    estimatedResponseTime: "8",
  },
];

// Mock appointments data
const mockAppointments: EmergencyAppointment[] = [
  {
    id: "APT-EMG-001",
    patientId: "PAT-EMG-001",
    doctorId: "DOC-EMG-001",
    scheduledAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes from now
    priority: "urgent",
    status: "scheduled",
    type: "emergency",
    symptoms: "Dor no peito, falta de ar",
    notes: "Paciente com histórico de problemas cardíacos",
    estimatedDuration: 30,
    roomNumber: "EMERG-01",
    createdAt: new Date().toISOString(),
    createdBy: "sistema-emergencia",
  },
];

/**
 * Emergency Appointments Hook
 *
 * Manages emergency appointment scheduling, doctor availability, and crisis booking.
 * Optimized for high-priority medical scenarios with real-time availability checking.
 */
export function useEmergencyAppointments(): UseEmergencyAppointmentsReturn {
  const [availableDoctors, setAvailableDoctors] = useState<EmergencyDoctor[]>(mockEmergencyDoctors);
  const [appointments, setAppointments] = useState<EmergencyAppointment[]>(mockAppointments);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>();

  // Get available doctors, optionally filtered by specialty
  const getAvailableDoctors = useCallback(
    async (specialty?: string): Promise<EmergencyDoctor[]> => {
      setIsLoading(true);
      setError(undefined);

      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 300));

        let doctors = [...mockEmergencyDoctors];

        if (specialty) {
          doctors = doctors.filter((doctor) =>
            doctor.specialty.toLowerCase().includes(specialty.toLowerCase())
          );
        }

        // Sort by availability, then by emergency rating, then by current load
        doctors.sort((a, b) => {
          if (a.available !== b.available) {
            return a.available ? -1 : 1; // Available doctors first
          }
          if (a.emergencyRating !== b.emergencyRating) {
            return b.emergencyRating - a.emergencyRating; // Higher rating first
          }
          return a.currentLoad - b.currentLoad; // Lower load first
        });

        setAvailableDoctors(doctors);
        return doctors;
      } catch (error) {
        const errorMessage = error instanceof Error
          ? error.message
          : "Erro ao carregar médicos disponíveis";
        setError(errorMessage);
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  // Book emergency appointment
  const bookEmergencyAppointment = useCallback(
    async (request: EmergencyBookingRequest): Promise<EmergencyAppointment> => {
      setIsLoading(true);
      setError(undefined);

      try {
        // Validate doctor availability
        const doctor = availableDoctors.find((d) => d.id === request.doctorId);
        if (!doctor) {
          throw new Error("Médico não encontrado");
        }

        if (!doctor.available) {
          throw new Error(
            `Dr(a). ${doctor.name} não está disponível no momento`,
          );
        }

        // Calculate appointment time based on priority
        let appointmentTime = new Date();
        switch (request.priority) {
          case "critical": {
            appointmentTime = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
            break;
          }
          case "urgent": {
            appointmentTime = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
            break;
          }
          case "high": {
            appointmentTime = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
            break;
          }
          default: {
            appointmentTime = new Date(Date.now() + 60 * 60 * 1000);
          } // 1 hour
        }

        // If preferred time is specified and reasonable, use it
        if (request.preferredTime) {
          const preferredDate = new Date(request.preferredTime);
          const now = new Date();
          const maxAdvanceTime = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours max

          if (preferredDate > now && preferredDate < maxAdvanceTime) {
            appointmentTime = preferredDate;
          }
        }

        // Create new appointment
        const newAppointment: EmergencyAppointment = {
          id: `APT-EMG-${Date.now()}`,
          patientId: request.patientId,
          doctorId: request.doctorId,
          scheduledAt: appointmentTime.toISOString(),
          priority: request.priority,
          status: "scheduled",
          type: request.priority === "critical" ? "emergency" : "urgent_care",
          symptoms: request.symptoms,
          notes: request.notes,
          estimatedDuration: request.priority === "critical" ? 45 : 30,
          roomNumber: `EMERG-${Math.floor(Math.random() * 10) + 1}`,
          createdAt: new Date().toISOString(),
          createdBy: "sistema-emergencia",
        };

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Add to appointments list
        setAppointments((prev) => [...prev, newAppointment]);

        // Update doctor availability if this is a critical appointment
        if (request.priority === "critical") {
          setAvailableDoctors((prev) =>
            prev.map((doc) =>
              doc.id === request.doctorId
                ? { ...doc, currentLoad: Math.min(100, doc.currentLoad + 20) }
                : doc
            )
          );
        }

        return newAppointment;
      } catch (error) {
        const errorMessage = error instanceof Error
          ? error.message
          : "Erro ao agendar consulta de emergência";
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [availableDoctors],
  );

  // Get appointment by ID
  const getAppointmentById = useCallback(
    async (id: string): Promise<EmergencyAppointment | null> => {
      setIsLoading(true);
      setError(undefined);

      try {
        await new Promise((resolve) => setTimeout(resolve, 200));

        const appointment = appointments.find((apt) => apt.id === id);
        return appointment || undefined;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Erro ao carregar consulta";
        setError(errorMessage);
        return;
      } finally {
        setIsLoading(false);
      }
    },
    [appointments],
  );

  // Cancel appointment
  const cancelAppointment = useCallback(
    async (id: string, reason: string): Promise<boolean> => {
      setIsLoading(true);
      setError(undefined);

      try {
        await new Promise((resolve) => setTimeout(resolve, 300));

        const appointment = appointments.find((apt) => apt.id === id);
        if (!appointment) {
          throw new Error("Consulta não encontrada");
        }

        // Update appointment status
        setAppointments((prev) =>
          prev.map((apt) =>
            apt.id === id
              ? {
                ...apt,
                status: "cancelled" as const,
                notes: `${apt.notes || ""}\nCancelado: ${reason}`,
              }
              : apt
          )
        );

        // Update doctor availability
        const doctor = availableDoctors.find(
          (d) => d.id === appointment.doctorId,
        );
        if (doctor) {
          setAvailableDoctors((prev) =>
            prev.map((doc) =>
              doc.id === appointment.doctorId
                ? { ...doc, currentLoad: Math.max(0, doc.currentLoad - 15) }
                : doc
            )
          );
        }

        return true;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Erro ao cancelar consulta";
        setError(errorMessage);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [appointments, availableDoctors],
  );

  // Update appointment status
  const updateAppointmentStatus = useCallback(
    async (
      id: string,
      status: EmergencyAppointment["status"],
    ): Promise<boolean> => {
      setIsLoading(true);
      setError(undefined);

      try {
        await new Promise((resolve) => setTimeout(resolve, 200));

        const appointment = appointments.find((apt) => apt.id === id);
        if (!appointment) {
          throw new Error("Consulta não encontrada");
        }

        setAppointments((prev) => prev.map((apt) => (apt.id === id ? { ...apt, status } : apt)));

        // Update doctor load based on status
        if (status === "completed" || status === "cancelled") {
          setAvailableDoctors((prev) =>
            prev.map((doc) =>
              doc.id === appointment.doctorId
                ? { ...doc, currentLoad: Math.max(0, doc.currentLoad - 20) }
                : doc
            )
          );
        }

        return true;
      } catch (error) {
        const errorMessage = error instanceof Error
          ? error.message
          : "Erro ao atualizar status da consulta";
        setError(errorMessage);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [appointments],
  );

  // Clear error state
  const clearError = useCallback(() => {
    setError(undefined);
  }, []);

  // Memoize available doctors sorted by emergency readiness
  const sortedAvailableDoctors = useMemo(() => {
    return [...availableDoctors].sort((a, b) => {
      if (a.available !== b.available) {
        return a.available ? -1 : 1;
      }
      if (a.emergencyRating !== b.emergencyRating) {
        return b.emergencyRating - a.emergencyRating;
      }
      return a.currentLoad - b.currentLoad;
    });
  }, [availableDoctors]);

  return {
    availableDoctors: sortedAvailableDoctors,
    appointments,
    bookEmergencyAppointment,
    getAvailableDoctors,
    getAppointmentById,
    cancelAppointment,
    updateAppointmentStatus,
    isLoading,
    error,
    clearError,
  };
}
