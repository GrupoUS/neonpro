"use client";

import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { 
  format, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameDay, 
  isToday,
  addDays 
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { AppointmentCard } from "./appointment-card";
import type { AppointmentWithRelations } from "@/app/lib/types/appointments";

interface WeekViewProps {
  date: Date;
  appointments: AppointmentWithRelations[];
  onAppointmentClick?: (appointment: AppointmentWithRelations) => void;
  onAppointmentEdit?: (appointment: AppointmentWithRelations) => void;
  onAppointmentCancel?: (appointment: AppointmentWithRelations) => void;
  onAppointmentComplete?: (appointment: AppointmentWithRelations) => void;
  onTimeSlotClick?: (date: Date, time: string) => void;
  className?: string;
}

export function WeekView({
  date,
  appointments,
  onAppointmentClick,
  onAppointmentEdit,
  onAppointmentCancel,
  onAppointmentComplete,
  onTimeSlotClick,
  className,
}: WeekViewProps) {
  // Get week boundaries
  const weekStart = startOfWeek(date, { weekStartsOn: 0 }); // Sunday = 0
  const weekEnd = endOfWeek(date, { weekStartsOn: 0 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // Filter appointments for the week
  const weekAppointments = appointments.filter(appointment => {
    const appointmentDate = new Date(appointment.start_time);
    return appointmentDate >= weekStart && appointmentDate <= weekEnd;
  });

  // Generate time slots
  const generateTimeSlots = () => {
    const slots = [];
    const startHour = 8;
    const endHour = 18;
    
    for (let hour = startHour; hour < endHour; hour++) {
      for (const minutes of [0, 15, 30, 45]) {
        slots.push({ hour, minutes, time: `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}` });
      }
    }
    
    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Get appointments for specific day and time slot
  const getAppointmentsForSlot = (day: Date, slotHour: number, slotMinutes: number) => {
    return weekAppointments.filter(appointment => {
      const appointmentStart = new Date(appointment.start_time);
      const appointmentEnd = new Date(appointment.end_time);
      
      if (!isSameDay(appointmentStart, day)) return false;

      const slotStart = new Date(day);
      slotStart.setHours(slotHour, slotMinutes, 0, 0);
      const slotEnd = new Date(slotStart.getTime() + 15 * 60 * 1000);

      return (
        (appointmentStart >= slotStart && appointmentStart < slotEnd) ||
        (appointmentStart <= slotStart && appointmentEnd > slotStart)
      );
    });
  };

  const handleTimeSlotClick = (day: Date, time: string) => {
    if (onTimeSlotClick) {
      onTimeSlotClick(day, time);
    }
  };

  return (
    <div className={cn("flex-1 flex flex-col", className)}>
      {/* Week header with days */}
      <div className="grid grid-cols-8 border-b bg-muted/50">
        {/* Time column header */}
        <div className="p-2 border-r">
          <div className="text-xs text-muted-foreground text-center">Horário</div>
        </div>
        
        {/* Day headers */}
        {weekDays.map((day, index) => (
          <div
            key={index}
            className={cn(
              "p-2 border-r text-center",
              isToday(day) && "bg-primary/10"
            )}
          >
            <div className="text-xs text-muted-foreground">
              {format(day, "EEE", { locale: ptBR })}
            </div>
            <div className={cn(
              "text-lg font-semibold",
              isToday(day) && "text-primary"
            )}>
              {format(day, "d")}
            </div>
          </div>
        ))}
      </div>

      {/* Time grid */}
      <ScrollArea className="flex-1">
        <div className="grid grid-cols-8 gap-px bg-border min-h-full">
          {/* Time slots */}
          {timeSlots.map(({ hour, minutes, time }, slotIndex) => {
            const isHourMark = minutes === 0;
            
            return (
              <React.Fragment key={slotIndex}>
                {/* Time label column */}
                <div className={cn(
                  "bg-background border-r p-1 text-xs text-muted-foreground text-right pr-2",
                  isHourMark && "border-t-2 border-t-border/50"
                )}
                style={{ minHeight: "48px" }}
                >
                  {isHourMark && time}
                </div>

                {/* Day columns */}
                {weekDays.map((day, dayIndex) => {
                  const slotAppointments = getAppointmentsForSlot(day, hour, minutes);
                  
                  return (
                    <div
                      key={`${slotIndex}-${dayIndex}`}
                      className={cn(
                        "bg-background border-r hover:bg-muted/50 cursor-pointer transition-colors relative",
                        isHourMark && "border-t-2 border-t-border/50",
                        isToday(day) && "bg-primary/5"
                      )}
                      style={{ minHeight: "48px" }}
                      onClick={() => handleTimeSlotClick(day, time)}
                    >
                      {/* Appointments in this slot */}
                      <div className="p-1">
                        {slotAppointments.map((appointment, appointmentIndex) => (
                          <div key={`${appointment.id}-${appointmentIndex}`} className="mb-1">
                            <AppointmentCard
                              appointment={appointment}
                              variant="compact"
                              showTime={false}
                              showPatient={true}
                              showProfessional={false}
                              showActions={false}
                              onClick={() => onAppointmentClick?.(appointment)}
                              className="text-xs"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </React.Fragment>
            );
          })}
        </div>

        {/* Current time indicator for week view */}
        <WeekCurrentTimeIndicator weekStart={weekStart} />
      </ScrollArea>

      {/* Week summary */}
      <div className="p-4 border-t bg-muted/50">
        <div className="flex items-center justify-between text-sm">
          <span>
            {format(weekStart, "d 'de' MMM", { locale: ptBR })} - {format(weekEnd, "d 'de' MMM 'de' yyyy", { locale: ptBR })}
          </span>
          <span className="text-muted-foreground">
            {weekAppointments.length} agendamento{weekAppointments.length !== 1 ? 's' : ''} na semana
          </span>
        </div>
      </div>
    </div>
  );
}

// Current time indicator for week view
function WeekCurrentTimeIndicator({ weekStart }: { weekStart: Date }) {
  const [currentTime, setCurrentTime] = React.useState<Date | null>(null);

  React.useEffect(() => {
    // Set initial time on client side only
    setCurrentTime(new Date());
    
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // Don't render during SSR or before client hydration
  if (!currentTime) {
    return null;
  }

  // Check if current time is within the week
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 0 });
  if (currentTime < weekStart || currentTime > weekEnd) {
    return null;
  }

  const currentHour = currentTime.getHours();
  const currentMinute = currentTime.getMinutes();
  
  if (currentHour < 8 || currentHour >= 18) {
    return null;
  }

  // Calculate position
  const totalMinutesFromStart = (currentHour - 8) * 60 + currentMinute;
  const rowPosition = (totalMinutesFromStart / 15) * 48;
  
  // Calculate which day column
  const dayOfWeek = currentTime.getDay(); // 0 = Sunday
  const columnStart = (dayOfWeek + 1) * (100 / 8); // +1 for time column

  return (
    <div
      className="absolute z-10 flex items-center pointer-events-none"
      style={{ 
        top: `${rowPosition + 80}px`, // +80 for header height
        left: `${columnStart}%`,
        width: `${100 / 8}%`
      }}
    >
      <div className="w-1 h-1 bg-red-500 rounded-full mr-1" />
      <div className="flex-1 h-px bg-red-500" />
    </div>
  );
}
