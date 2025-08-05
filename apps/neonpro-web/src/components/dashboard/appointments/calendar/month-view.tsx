"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek,
  eachDayOfInterval, 
  isSameDay, 
  isToday,
  isSameMonth,
  getDay
} from "date-fns";
import { ptBR } from "date-fns/locale";
import type { AppointmentWithRelations } from "@/app/lib/types/appointments";

interface MonthViewProps {
  date: Date;
  appointments: AppointmentWithRelations[];
  onAppointmentClick?: (appointment: AppointmentWithRelations) => void;
  onDayClick?: (date: Date) => void;
  className?: string;
}

export function MonthView({
  date,
  appointments,
  onAppointmentClick,
  onDayClick,
  className,
}: MonthViewProps) {
  // Get month boundaries
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  
  // Get the full calendar grid (including leading/trailing days)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  // Get appointments for the month
  const monthAppointments = appointments.filter(appointment => {
    const appointmentDate = new Date(appointment.start_time);
    return appointmentDate >= calendarStart && appointmentDate <= calendarEnd;
  });

  // Get appointments for a specific day
  const getAppointmentsForDay = (day: Date) => {
    return monthAppointments.filter(appointment =>
      isSameDay(new Date(appointment.start_time), day)
    );
  };

  // Get appointment count by status for a day
  const getStatusCounts = (dayAppointments: AppointmentWithRelations[]) => {
    const counts = {
      scheduled: 0,
      confirmed: 0,
      in_progress: 0,
      completed: 0,
      cancelled: 0,
      no_show: 0,
    };

    dayAppointments.forEach(appointment => {
      if (counts.hasOwnProperty(appointment.status)) {
        counts[appointment.status as keyof typeof counts]++;
      }
    });

    return counts;
  };

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const handleDayClick = (day: Date) => {
    if (onDayClick) {
      onDayClick(day);
    }
  };

  return (
    <div className={cn("flex-1 flex flex-col", className)}>
      {/* Month header */}
      <div className="p-4 border-b bg-muted/50">
        <h2 className="text-lg font-semibold">
          {format(date, "MMMM 'de' yyyy", { locale: ptBR })}
        </h2>
        <p className="text-sm text-muted-foreground">
          {monthAppointments.length} agendamento{monthAppointments.length !== 1 ? 's' : ''} no mês
        </p>
      </div>

      {/* Calendar grid */}
      <div className="flex-1 flex flex-col">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 border-b">
          {weekDays.map((day, index) => (
            <div key={index} className="p-2 text-center text-sm font-medium border-r last:border-r-0">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days grid */}
        <div className="flex-1 grid grid-rows-6">
          {Array.from({ length: 6 }).map((_, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-7 border-b last:border-b-0">
              {calendarDays.slice(weekIndex * 7, (weekIndex + 1) * 7).map((day, dayIndex) => {
                const dayAppointments = getAppointmentsForDay(day);
                const statusCounts = getStatusCounts(dayAppointments);
                const isCurrentMonth = isSameMonth(day, date);
                
                return (
                  <div
                    key={dayIndex}
                    className={cn(
                      "border-r last:border-r-0 p-1 cursor-pointer hover:bg-muted/50 transition-colors min-h-[100px] flex flex-col",
                      !isCurrentMonth && "bg-muted/20 text-muted-foreground",
                      isToday(day) && "bg-primary/10 border-primary/20"
                    )}
                    onClick={() => handleDayClick(day)}
                  >
                    {/* Day number */}
                    <div className="flex items-center justify-between mb-1">
                      <span className={cn(
                        "text-sm font-medium",
                        isToday(day) && isCurrentMonth && "bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs"
                      )}>
                        {format(day, "d")}
                      </span>
                      
                      {/* Total appointments badge */}
                      {dayAppointments.length > 0 && (
                        <Badge variant="secondary" className="text-xs h-5 px-1.5">
                          {dayAppointments.length}
                        </Badge>
                      )}
                    </div>

                    {/* Appointment indicators */}
                    <div className="flex-1 space-y-1">
                      {/* Show first few appointments */}
                      {dayAppointments.slice(0, 3).map((appointment, index) => (
                        <div
                          key={index}
                          className={cn(
                            "text-xs p-1 rounded text-white cursor-pointer hover:opacity-80",
                            appointment.status === 'scheduled' && "bg-blue-500",
                            appointment.status === 'confirmed' && "bg-green-500",
                            appointment.status === 'in_progress' && "bg-yellow-500",
                            appointment.status === 'completed' && "bg-emerald-500",
                            appointment.status === 'cancelled' && "bg-red-500",
                            appointment.status === 'no_show' && "bg-gray-500"
                          )}
                          onClick={(e) => {
                            e.stopPropagation();
                            onAppointmentClick?.(appointment);
                          }}
                        >
                          <div className="truncate">
                            {format(new Date(appointment.start_time), "HH:mm")} - {appointment.patients?.full_name || 'Sem nome'}
                          </div>
                        </div>
                      ))}

                      {/* Show "more" indicator */}
                      {dayAppointments.length > 3 && (
                        <div className="text-xs text-muted-foreground p-1">
                          +{dayAppointments.length - 3} mais
                        </div>
                      )}

                      {/* Status dots for quick overview */}
                      {dayAppointments.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {statusCounts.scheduled > 0 && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full" title={`${statusCounts.scheduled} agendado(s)`} />
                          )}
                          {statusCounts.confirmed > 0 && (
                            <div className="w-2 h-2 bg-green-500 rounded-full" title={`${statusCounts.confirmed} confirmado(s)`} />
                          )}
                          {statusCounts.in_progress > 0 && (
                            <div className="w-2 h-2 bg-yellow-500 rounded-full" title={`${statusCounts.in_progress} em andamento`} />
                          )}
                          {statusCounts.completed > 0 && (
                            <div className="w-2 h-2 bg-emerald-500 rounded-full" title={`${statusCounts.completed} concluído(s)`} />
                          )}
                          {statusCounts.cancelled > 0 && (
                            <div className="w-2 h-2 bg-red-500 rounded-full" title={`${statusCounts.cancelled} cancelado(s)`} />
                          )}
                          {statusCounts.no_show > 0 && (
                            <div className="w-2 h-2 bg-gray-500 rounded-full" title={`${statusCounts.no_show} não compareceu`} />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Month summary */}
      <div className="p-4 border-t bg-muted/50">
        <div className="flex items-center justify-between text-sm">
          <span>
            {format(monthStart, "d", { locale: ptBR })} - {format(monthEnd, "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </span>
          <div className="flex items-center gap-4 text-muted-foreground">
            {monthAppointments.length > 0 && (
              <>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                  <span>Confirmados: {monthAppointments.filter(a => a.status === 'confirmed').length}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full" />
                  <span>Agendados: {monthAppointments.filter(a => a.status === 'scheduled').length}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full" />
                  <span>Concluídos: {monthAppointments.filter(a => a.status === 'completed').length}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
