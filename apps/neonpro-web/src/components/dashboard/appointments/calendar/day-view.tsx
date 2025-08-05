"use client";

import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { format, isSameDay, startOfDay, endOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AppointmentCard } from "./appointment-card";
import type { AppointmentWithRelations } from "@/app/lib/types/appointments";

interface DayViewProps {
  date: Date;
  appointments: AppointmentWithRelations[];
  onAppointmentClick?: (appointment: AppointmentWithRelations) => void;
  onAppointmentEdit?: (appointment: AppointmentWithRelations) => void;
  onAppointmentCancel?: (appointment: AppointmentWithRelations) => void;
  onAppointmentComplete?: (appointment: AppointmentWithRelations) => void;
  onTimeSlotClick?: (time: string) => void;
  className?: string;
}

export function DayView({
  date,
  appointments,
  onAppointmentClick,
  onAppointmentEdit,
  onAppointmentCancel,
  onAppointmentComplete,
  onTimeSlotClick,
  className,
}: DayViewProps) {
  // Filter appointments for the specific date
  const dayAppointments = appointments.filter(appointment =>
    isSameDay(new Date(appointment.start_time), date)
  );

  // Generate time slots from 8 AM to 6 PM
  const generateTimeSlots = () => {
    const slots = [];
    const startHour = 8;
    const endHour = 18;
    
    for (let hour = startHour; hour < endHour; hour++) {
      for (const minutes of [0, 15, 30, 45]) {
        const time = new Date(date);
        time.setHours(hour, minutes, 0, 0);
        slots.push(time);
      }
    }
    
    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Function to get appointments for a specific time slot
  const getAppointmentsForSlot = (slotTime: Date) => {
    return dayAppointments.filter(appointment => {
      const appointmentStart = new Date(appointment.start_time);
      const appointmentEnd = new Date(appointment.end_time);
      const slotEnd = new Date(slotTime.getTime() + 15 * 60 * 1000); // 15 minutes later

      return (
        (appointmentStart >= slotTime && appointmentStart < slotEnd) ||
        (appointmentStart <= slotTime && appointmentEnd > slotTime)
      );
    });
  };

  // Function to calculate appointment height based on duration
  const getAppointmentHeight = (appointment: AppointmentWithRelations) => {
    const start = new Date(appointment.start_time);
    const end = new Date(appointment.end_time);
    const duration = (end.getTime() - start.getTime()) / (1000 * 60); // minutes
    const slotHeight = 48; // 48px per 15-minute slot
    return Math.max((duration / 15) * slotHeight, slotHeight);
  };

  const handleTimeSlotClick = (slotTime: Date) => {
    if (onTimeSlotClick) {
      onTimeSlotClick(format(slotTime, "HH:mm"));
    }
  };

  return (
    <div className={cn("flex-1 flex flex-col", className)}>
      {/* Date header */}
      <div className="p-4 border-b bg-muted/50">
        <h2 className="text-lg font-semibold">
          {format(date, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}
        </h2>
        <p className="text-sm text-muted-foreground">
          {dayAppointments.length} agendamento{dayAppointments.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Time grid */}
      <ScrollArea className="flex-1">
        <div className="relative">
          {/* Time slots grid */}
          <div className="grid grid-cols-1 gap-px bg-border">
            {timeSlots.map((slotTime, index) => {
              const slotAppointments = getAppointmentsForSlot(slotTime);
              const isHourMark = slotTime.getMinutes() === 0;
              
              return (
                <div
                  key={index}
                  className={cn(
                    "relative bg-background border-r border-border",
                    isHourMark && "border-t-2 border-t-border/50",
                    "hover:bg-muted/50 cursor-pointer transition-colors"
                  )}
                  style={{ minHeight: "48px" }}
                  onClick={() => handleTimeSlotClick(slotTime)}
                >
                  {/* Time label */}
                  <div className="absolute -left-12 top-0 w-10 text-xs text-muted-foreground text-right pr-2">
                    {isHourMark && format(slotTime, "HH:mm")}
                  </div>

                  {/* Appointments in this slot */}
                  <div className="pl-2 pr-2 pt-1">
                    {slotAppointments.map((appointment, appointmentIndex) => (
                      <div
                        key={`${appointment.id}-${appointmentIndex}`}
                        className="mb-1"
                        style={{
                          height: `${getAppointmentHeight(appointment)}px`,
                          minHeight: "40px",
                        }}
                      >
                        <AppointmentCard
                          appointment={appointment}
                          variant="compact"
                          showTime={true}
                          showPatient={true}
                          showProfessional={false}
                          showActions={true}
                          onClick={() => onAppointmentClick?.(appointment)}
                          onEdit={() => onAppointmentEdit?.(appointment)}
                          onCancel={() => onAppointmentCancel?.(appointment)}
                          onComplete={() => onAppointmentComplete?.(appointment)}
                          className="h-full"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Current time indicator */}
          <CurrentTimeIndicator date={date} />
        </div>
      </ScrollArea>

      {/* Empty state */}
      {dayAppointments.length === 0 && (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
              <span className="text-2xl">📅</span>
            </div>
            <h3 className="text-lg font-medium mb-2">Nenhum agendamento hoje</h3>
            <p className="text-muted-foreground mb-4">
              Clique em um horário para criar um novo agendamento
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// Component to show current time indicator
function CurrentTimeIndicator({ date }: { date: Date }) {
  const [currentTime, setCurrentTime] = React.useState<Date | null>(null);

  React.useEffect(() => {
    // Set initial time only on client side to avoid hydration mismatch
    setCurrentTime(new Date());
    
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  // Don't render anything during SSR or before client hydration
  if (!currentTime) {
    return null;
  }

  // Only show if viewing today
  if (!isSameDay(date, currentTime)) {
    return null;
  }

  // Calculate position based on current time
  const startHour = 8;
  const currentHour = currentTime.getHours();
  const currentMinute = currentTime.getMinutes();
  
  if (currentHour < startHour || currentHour >= 18) {
    return null;
  }

  const totalMinutesFromStart = (currentHour - startHour) * 60 + currentMinute;
  const position = (totalMinutesFromStart / 15) * 48; // 48px per 15-minute slot

  return (
    <div
      className="absolute left-0 right-0 z-10 flex items-center pointer-events-none"
      style={{ top: `${position}px` }}
    >
      <div className="w-2 h-2 bg-red-500 rounded-full mr-2" />
      <div className="flex-1 h-px bg-red-500" />
      <div className="text-xs text-red-500 ml-2">
        {format(currentTime, "HH:mm")}
      </div>
    </div>
  );
}
