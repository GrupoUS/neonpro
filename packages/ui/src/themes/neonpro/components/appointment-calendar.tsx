/**
 * Appointment Calendar Component
 * Based on TweakCN NEONPRO "June 2025" calendar design
 * Optimized for Brazilian healthcare appointment scheduling
 */

import { cn } from "@neonpro/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type React from "react";
import { useMemo, useState } from "react";

// Brazilian healthcare appointment types
export type AppointmentType =
  | "consulta" // Regular consultation
  | "retorno" // Follow-up visit
  | "emergencia" // Emergency appointment
  | "cirurgia" // Surgery
  | "exame" // Examination/test
  | "avaliacao"; // Assessment

export interface Appointment {
  id: string;
  patientName: string;
  patientId: string;
  type: AppointmentType;
  startTime: Date;
  endTime: Date;
  status: "scheduled" | "confirmed" | "completed" | "cancelled" | "no-show";
  professional: string;
  room?: string;
  notes?: string;
}

export interface AppointmentCalendarProps {
  // Calendar data
  appointments: Appointment[];
  currentDate?: Date;

  // Brazilian holidays integration
  brazilianHolidays?: {
    date: Date;
    name: string;
    type: "national" | "regional" | "clinic";
  }[];

  // Calendar configuration
  showWeekNumbers?: boolean;
  firstDayOfWeek?: 0 | 1; // 0 = Sunday, 1 = Monday
  workingDays?: number[]; // [1,2,3,4,5] = Mon-Fri
  workingHours?: { start: number; end: number; }; // 8-18 = 8am-6pm

  // Density indicators (NEONPRO style)
  showDensityIndicators?: boolean;
  maxAppointmentsPerDay?: number;

  // Event handlers
  onDateSelect?: (date: Date) => void;
  onAppointmentClick?: (appointment: Appointment) => void;
  onCreateAppointment?: (date: Date, time?: Date) => void;

  // Visual customization
  size?: "sm" | "md" | "lg";
  variant?: "default" | "compact" | "detailed";
  className?: string;
}

// Brazilian month names
const BRAZILIAN_MONTHS = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

// Brazilian weekday names (short)
const BRAZILIAN_WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

// Appointment type colors (NEONPRO theme)
const APPOINTMENT_COLORS = {
  consulta: "bg-blue-100 border-blue-300 text-blue-700",
  retorno: "bg-green-100 border-green-300 text-green-700",
  emergencia: "bg-red-100 border-red-300 text-red-700",
  cirurgia: "bg-purple-100 border-purple-300 text-purple-700",
  exame: "bg-orange-100 border-orange-300 text-orange-700",
  avaliacao: "bg-cyan-100 border-cyan-300 text-cyan-700",
} as const;

// Status colors
const STATUS_COLORS = {
  scheduled: "border-gray-300",
  confirmed: "border-green-400",
  completed: "border-green-600 opacity-60",
  cancelled: "border-red-400 opacity-40",
  "no-show": "border-orange-400 opacity-40",
} as const;

// Get density level based on appointments per day
const getDensityLevel = (appointmentCount: number, maxAppointments: number) => {
  const ratio = appointmentCount / maxAppointments;
  if (ratio >= 1) {
    return "high";
  }
  if (ratio >= 0.7) {
    return "medium";
  }
  if (ratio >= 0.4) {
    return "low";
  }
  return "none";
};

// Density indicator component
const DensityIndicator: React.FC<{
  level: "none" | "low" | "medium" | "high";
  size?: "sm" | "md" | "lg";
}> = ({ level, size = "sm" }) => {
  if (level === "none") {
    return null;
  }

  const colors = {
    low: "bg-green-400",
    medium: "bg-yellow-400",
    high: "bg-red-400",
  };

  const sizes = {
    sm: "w-1 h-1",
    md: "w-1.5 h-1.5",
    lg: "w-2 h-2",
  };

  return (
    <div
      className={cn(
        "absolute top-1 right-1 rounded-full",
        colors[level],
        sizes[size],
      )}
    />
  );
};

// Day cell component
const DayCell: React.FC<{
  date: Date;
  appointments: Appointment[];
  isToday: boolean;
  isCurrentMonth: boolean;
  isSelected: boolean;
  isHoliday: boolean;
  holidayName?: string;
  workingHours: { start: number; end: number; };
  showDensityIndicators: boolean;
  maxAppointmentsPerDay: number;
  onSelect: (date: Date) => void;
  onAppointmentClick: (appointment: Appointment) => void;
  variant: "default" | "compact" | "detailed";
}> = ({
  date,
  appointments,
  isToday,
  isCurrentMonth,
  isSelected,
  isHoliday,
  holidayName,
  showDensityIndicators,
  maxAppointmentsPerDay,
  onSelect,
  onAppointmentClick,
  variant,
}) => {
  const dayNumber = date.getDate();
  const densityLevel = getDensityLevel(
    appointments.length,
    maxAppointmentsPerDay,
  );

  return (
    <div
      onClick={() => onSelect(date)}
      className={cn(
        "relative min-h-[80px] p-2 border-r border-b border-gray-100 cursor-pointer",
        "hover:bg-blue-50 transition-colors duration-150",
        !isCurrentMonth && "text-gray-400 bg-gray-50",
        isToday && "bg-blue-100 ring-2 ring-blue-400",
        isSelected && "bg-blue-200 ring-2 ring-blue-500",
        isHoliday && "bg-red-50 border-red-200",
      )}
    >
      {/* Day number */}
      <div
        className={cn(
          "text-sm font-medium mb-1",
          isToday && "text-blue-700",
          isHoliday && "text-red-600",
        )}
      >
        {dayNumber}
      </div>

      {/* Holiday indicator */}
      {isHoliday && holidayName && (
        <div className="text-xs text-red-600 font-medium mb-1 truncate">
          {holidayName}
        </div>
      )}

      {/* Density indicator */}
      {showDensityIndicators && <DensityIndicator level={densityLevel} />}

      {/* Appointments */}
      <div className="space-y-1">
        {appointments
          .slice(0, variant === "compact" ? 2 : 4)
          .map((appointment) => (
            <div
              key={appointment.id}
              onClick={(e) => {
                e.stopPropagation();
                onAppointmentClick(appointment);
              }}
              className={cn(
                "text-xs p-1 rounded border truncate cursor-pointer",
                "hover:shadow-sm transition-shadow duration-150",
                APPOINTMENT_COLORS[appointment.type],
                STATUS_COLORS[appointment.status],
              )}
            >
              <div className="font-medium truncate">
                {appointment.startTime.toLocaleTimeString("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
              {variant !== "compact" && (
                <div className="truncate opacity-75">
                  {appointment.patientName}
                </div>
              )}
            </div>
          ))}

        {/* More appointments indicator */}
        {appointments.length > (variant === "compact" ? 2 : 4) && (
          <div className="text-xs text-gray-500 font-medium">
            +{appointments.length - (variant === "compact" ? 2 : 4)} mais
          </div>
        )}
      </div>
    </div>
  );
};

export const AppointmentCalendar: React.FC<AppointmentCalendarProps> = ({
  appointments = [],
  currentDate = new Date(),
  brazilianHolidays = [],
  _showWeekNumbers = false,
  firstDayOfWeek = 1, // Monday first (Brazilian standard)
  _workingDays = [1, 2, 3, 4, 5], // Mon-Fri
  workingHours = { start: 8, end: 18 }, // 8am-6pm
  showDensityIndicators = true,
  maxAppointmentsPerDay = 12,
  onDateSelect,
  onAppointmentClick = () => {},
  _onCreateAppointment,
  _size = "md",
  variant = "default",
  className,
}) => {
  const [viewDate, setViewDate] = useState(currentDate);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Generate calendar grid
  const calendarDays = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    // First day of the month
    const firstDay = new Date(year, month, 1);

    // Start of calendar grid (including previous month days)
    const startDate = new Date(firstDay);
    const dayOfWeek = firstDay.getDay();
    const daysBack = dayOfWeek === 0 ? 6 : dayOfWeek - firstDayOfWeek;
    startDate.setDate(firstDay.getDate() - daysBack);

    // Generate 42 days (6 weeks)
    const days = [];
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      days.push(date);
    }

    return days;
  }, [viewDate, firstDayOfWeek]);

  // Group appointments by date
  const appointmentsByDate = useMemo(() => {
    const grouped: { [key: string]: Appointment[]; } = {};

    appointments.forEach((appointment) => {
      const [dateKey] = appointment.startTime.toISOString().split("T");
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(appointment);
    });

    return grouped;
  }, [appointments]);

  // Check if date is holiday
  const isHoliday = (date: Date) => {
    return brazilianHolidays.some(
      (holiday) => holiday.date.toDateString() === date.toDateString(),
    );
  };

  const getHolidayName = (date: Date) => {
    const holiday = brazilianHolidays.find(
      (holiday) => holiday.date.toDateString() === date.toDateString(),
    );
    return holiday?.name;
  };

  // Navigation handlers
  const goToPreviousMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1));
  };

  const goToToday = () => {
    setViewDate(new Date());
    setSelectedDate(new Date());
  };

  // Handle date selection
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    onDateSelect?.(date);
  };

  return (
    <div
      className={cn("bg-white rounded-xl border border-gray-200", className)}
    >
      {/* Calendar header (NEONPRO style) */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {BRAZILIAN_MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}
          </h2>
          <button
            onClick={goToToday}
            className="px-3 py-1 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            Hoje
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={goToPreviousMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <button
            onClick={goToNextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 border-b border-gray-200">
        {BRAZILIAN_WEEKDAYS.map((day, _index) => (
          <div
            key={day}
            className="p-3 text-sm font-medium text-gray-700 text-center bg-gray-50"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7">
        {calendarDays.map((date, index) => {
          const [dateKey] = date.toISOString().split("T");
          const dayAppointments = appointmentsByDate[dateKey] || [];
          const isToday = date.toDateString() === new Date().toDateString();
          const isCurrentMonth = date.getMonth() === viewDate.getMonth();
          const isSelected = selectedDate?.toDateString() === date.toDateString();

          return (
            <DayCell
              key={index}
              date={date}
              appointments={dayAppointments}
              isToday={isToday}
              isCurrentMonth={isCurrentMonth}
              isSelected={isSelected}
              isHoliday={isHoliday(date)}
              holidayName={getHolidayName(date)}
              workingHours={workingHours}
              showDensityIndicators={showDensityIndicators}
              maxAppointmentsPerDay={maxAppointmentsPerDay}
              onSelect={handleDateSelect}
              onAppointmentClick={onAppointmentClick}
              variant={variant}
            />
          );
        })}
      </div>

      {/* Legend */}
      <div className="p-4 border-t border-gray-100 bg-gray-50">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded" />
            <span>Consulta</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-100 border border-green-300 rounded" />
            <span>Retorno</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-100 border border-red-300 rounded" />
            <span>Emergência</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentCalendar;
