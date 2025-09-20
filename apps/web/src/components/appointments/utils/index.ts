/**
 * Appointment Utility Functions
 *
 * Helper functions for appointment scheduling and management
 * with Brazilian healthcare compliance and formatting
 */

import {
  differenceInMinutes,
  format,
  isPast,
  isToday,
  isTomorrow,
  parseISO,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Appointment, RiskLevel, TimeSlot } from "../types";

/**
 * Format appointment time for Brazilian healthcare context
 */
export function formatAppointmentTime(
  date: Date | string,
  includeDate = false,
): string {
  const appointmentDate = typeof date === "string" ? parseISO(date) : date;

  if (includeDate) {
    return format(appointmentDate, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  }

  return format(appointmentDate, "HH:mm", { locale: ptBR });
}

/**
 * Format appointment date for Brazilian context
 */
export function formatAppointmentDate(date: Date | string): string {
  const appointmentDate = typeof date === "string" ? parseISO(date) : date;

  if (isToday(appointmentDate)) {
    return "Hoje";
  }

  if (isTomorrow(appointmentDate)) {
    return "Amanhã";
  }

  return format(appointmentDate, "dd 'de' MMMM", { locale: ptBR });
}

/**
 * Get color scheme for no-show risk levels
 */
export function getNoShowRiskColor(level: RiskLevel): {
  bg: string;
  text: string;
  border: string;
  badge: "default" | "secondary" | "destructive" | "outline";
} {
  switch (level) {
    case "high":
      return {
        bg: "bg-red-50",
        text: "text-red-700",
        border: "border-red-200",
        badge: "destructive",
      };
    case "medium":
      return {
        bg: "bg-yellow-50",
        text: "text-yellow-700",
        border: "border-yellow-200",
        badge: "default",
      };
    case "low":
      return {
        bg: "bg-green-50",
        text: "text-green-700",
        border: "border-green-200",
        badge: "secondary",
      };
    default:
      return {
        bg: "bg-gray-50",
        text: "text-gray-700",
        border: "border-gray-200",
        badge: "outline",
      };
  }
}

/**
 * Generate time slots for appointment booking
 */
export function generateTimeSlots(
  startHour: number = 8,
  endHour: number = 18,
  slotDuration: number = 60,
  existingAppointments: Appointment[] = [],
): TimeSlot[] {
  const slots: TimeSlot[] = [];

  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += slotDuration) {
      const time = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;

      // Check if slot is occupied
      const existingAppointment = existingAppointments.find(
        (apt) => formatAppointmentTime(apt.startTime) === time,
      );

      slots.push({
        time,
        available: !existingAppointment,
        duration: slotDuration,
        appointmentId: existingAppointment?.id,
        patientName: existingAppointment?.patientName,
        serviceName: existingAppointment?.serviceName,
        riskLevel: existingAppointment?.noShowRisk?.level,
      });
    }
  }

  return slots;
}

/**
 * Calculate appointment duration in Brazilian format
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${remainingMinutes}min`;
}

/**
 * Check if appointment is overdue
 */
export function isAppointmentOverdue(appointment: Appointment): boolean {
  return (
    isPast(appointment.startTime) &&
    !["completed", "cancelled", "no-show"].includes(appointment.status)
  );
}

/**
 * Get appointment status display text in Portuguese
 */
export function getAppointmentStatusText(status: string): string {
  const statusMap: Record<string, string> = {
    scheduled: "Agendada",
    confirmed: "Confirmada",
    completed: "Realizada",
    cancelled: "Cancelada",
    "no-show": "Falta",
    rescheduled: "Reagendada",
  };

  return statusMap[status] || status;
}

/**
 * Calculate time until appointment
 */
export function getTimeUntilAppointment(
  appointmentTime: Date | string,
): string {
  const appointment =
    typeof appointmentTime === "string"
      ? parseISO(appointmentTime)
      : appointmentTime;
  const now = new Date();
  const diffMinutes = differenceInMinutes(appointment, now);

  if (diffMinutes < 0) {
    return "Já passou";
  }

  if (diffMinutes < 60) {
    return `${diffMinutes} min`;
  }

  if (diffMinutes < 1440) {
    // 24 hours
    const hours = Math.floor(diffMinutes / 60);
    return `${hours}h`;
  }

  const days = Math.floor(diffMinutes / 1440);
  return `${days} dia(s)`;
}

/**
 * Get reminder timing options in Portuguese
 */
export function getReminderTimingOptions(): Array<{
  value: number;
  label: string;
}> {
  return [
    { value: 24, label: "24 horas antes" },
    { value: 12, label: "12 horas antes" },
    { value: 6, label: "6 horas antes" },
    { value: 3, label: "3 horas antes" },
    { value: 1, label: "1 hora antes" },
    { value: 0.5, label: "30 minutos antes" },
    { value: 0.25, label: "15 minutos antes" },
  ];
}

/**
 * Validate appointment timing (Brazilian business hours)
 */
export function validateAppointmentTime(
  date: Date,
  time: string,
): {
  isValid: boolean;
  error?: string;
} {
  const [hours, minutes] = time.split(":").map(Number);

  // Check business hours (8 AM - 6 PM)
  if (hours < 8 || hours >= 18) {
    return {
      isValid: false,
      error: "Horário deve ser entre 08:00 e 18:00",
    };
  }

  // Check if not in the past
  const appointmentDateTime = new Date(date);
  appointmentDateTime.setHours(hours, minutes, 0, 0);

  if (appointmentDateTime <= new Date()) {
    return {
      isValid: false,
      error: "Não é possível agendar para um horário passado",
    };
  }

  return { isValid: true };
}

/**
 * Get Brazilian holiday and healthcare considerations
 */
export function getBrazilianHealthcareConsiderations(date: Date): {
  isHoliday: boolean;
  isCarnival: boolean;
  note?: string;
} {
  const month = date.getMonth() + 1;
  const day = date.getDate();

  // Major Brazilian holidays that affect healthcare
  const holidays = [
    { month: 1, day: 1, name: "Ano Novo" },
    { month: 4, day: 21, name: "Tiradentes" },
    { month: 9, day: 7, name: "Independência do Brasil" },
    { month: 10, day: 12, name: "Nossa Senhora Aparecida" },
    { month: 11, day: 2, name: "Finados" },
    { month: 11, day: 15, name: "Proclamação da República" },
    { month: 12, day: 25, name: "Natal" },
  ];

  const holiday = holidays.find((h) => h.month === month && h.day === day);

  // Carnival period (approximate - varies each year)
  const isCarnival = month === 2 || (month === 3 && day <= 7);

  return {
    isHoliday: !!holiday,
    isCarnival,
    note: holiday
      ? `Feriado: ${holiday.name}`
      : isCarnival
        ? "Período de Carnaval - maior risco de faltas"
        : undefined,
  };
}

/**
 * Export all utility functions as a single object
 */
export const appointmentUtils = {
  formatAppointmentTime,
  formatAppointmentDate,
  getNoShowRiskColor,
  generateTimeSlots,
  formatDuration,
  isAppointmentOverdue,
  getAppointmentStatusText,
  getTimeUntilAppointment,
  getReminderTimingOptions,
  validateAppointmentTime,
  getBrazilianHealthcareConsiderations,
};
