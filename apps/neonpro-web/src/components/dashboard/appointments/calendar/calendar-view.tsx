"use client";

import React, { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { CalendarNavigation, type CalendarView } from "./calendar-navigation";
import { DayView } from "./day-view";
import { WeekView } from "./week-view";
import { MonthView } from "./month-view";
import type { AppointmentWithRelations } from "@/app/lib/types/appointments";

interface CalendarViewProps {
  appointments: AppointmentWithRelations[];
  onRefresh?: () => void;
  onAppointmentClick?: (appointment: AppointmentWithRelations) => void;
  onAppointmentEdit?: (appointment: AppointmentWithRelations) => void;
  onAppointmentCancel?: (appointment: AppointmentWithRelations) => void;
  onAppointmentComplete?: (appointment: AppointmentWithRelations) => void;
  onCreateAppointment?: (date?: Date, time?: string) => void;
  className?: string;
}

export function CalendarView({
  appointments,
  onRefresh,
  onAppointmentClick,
  onAppointmentEdit,
  onAppointmentCancel,
  onAppointmentComplete,
  onCreateAppointment,
  className,
}: CalendarViewProps) {
  // State management
  const [currentDate, setCurrentDate] = useState<Date | null>(null);
  const [view, setView] = useState<CalendarView>("week");
  const [isLoading, setIsLoading] = useState(false);

  // Initialize current date on client side only
  useEffect(() => {
    setCurrentDate(new Date());
  }, []);

  // Handle real-time updates via Supabase
  useEffect(() => {
    // This will be implemented when we add real-time functionality
    // For now, we can refresh appointments periodically or on window focus
    
    const handleFocus = () => {
      if (onRefresh) {
        onRefresh();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [onRefresh]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Only handle if no input elements are focused
      const activeElement = document.activeElement;
      if (activeElement?.tagName === 'INPUT' || 
          activeElement?.tagName === 'TEXTAREA' || 
          activeElement?.tagName === 'SELECT') {
        return;
      }

      switch (event.key) {
        case 'ArrowLeft':
          handlePreviousNavigation();
          break;
        case 'ArrowRight':
          handleNextNavigation();
          break;
        case 't':
          setCurrentDate(new Date());
          break;
        case '1':
          setView('day');
          break;
        case '2':
          setView('week');
          break;
        case '3':
          setView('month');
          break;
        case 'n':
          if (onCreateAppointment) {
            onCreateAppointment(currentDate || undefined);
          }
          break;
        case 'r':
          if (onRefresh) {
            onRefresh();
            toast.success("Calendário atualizado");
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [currentDate, onCreateAppointment, onRefresh]);

  // Navigation handlers
  const handlePreviousNavigation = useCallback(() => {
    if (!currentDate) return;
    const today = new Date();
    switch (view) {
      case 'day':
        setCurrentDate(prev => prev ? new Date(prev.getTime() - 24 * 60 * 60 * 1000) : new Date());
        break;
      case 'week':
        setCurrentDate(prev => prev ? new Date(prev.getTime() - 7 * 24 * 60 * 60 * 1000) : new Date());
        break;
      case 'month':
        setCurrentDate(prev => {
          if (!prev) return new Date();
          const newDate = new Date(prev);
          newDate.setMonth(prev.getMonth() - 1);
          return newDate;
        });
        break;
    }
  }, [view, currentDate]);

  const handleNextNavigation = useCallback(() => {
    if (!currentDate) return;
    switch (view) {
      case 'day':
        setCurrentDate(prev => prev ? new Date(prev.getTime() + 24 * 60 * 60 * 1000) : new Date());
        break;
      case 'week':
        setCurrentDate(prev => prev ? new Date(prev.getTime() + 7 * 24 * 60 * 60 * 1000) : new Date());
        break;
      case 'month':
        setCurrentDate(prev => {
          if (!prev) return new Date();
          const newDate = new Date(prev);
          newDate.setMonth(prev.getMonth() + 1);
          return newDate;
        });
        break;
    }
  }, [view, currentDate]);

  const handleToday = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  // Appointment action handlers with optimistic updates
  const handleAppointmentEdit = useCallback(async (appointment: AppointmentWithRelations) => {
    if (onAppointmentEdit) {
      setIsLoading(true);
      try {
        await onAppointmentEdit(appointment);
        // Refresh appointments after edit
        if (onRefresh) {
          onRefresh();
        }
      } catch (error) {
        console.error("Error editing appointment:", error);
        toast.error("Erro ao editar agendamento");
      } finally {
        setIsLoading(false);
      }
    }
  }, [onAppointmentEdit, onRefresh]);

  const handleAppointmentCancel = useCallback(async (appointment: AppointmentWithRelations) => {
    if (onAppointmentCancel) {
      setIsLoading(true);
      try {
        await onAppointmentCancel(appointment);
        toast.success("Agendamento cancelado");
        // Refresh appointments after cancel
        if (onRefresh) {
          onRefresh();
        }
      } catch (error) {
        console.error("Error cancelling appointment:", error);
        toast.error("Erro ao cancelar agendamento");
      } finally {
        setIsLoading(false);
      }
    }
  }, [onAppointmentCancel, onRefresh]);

  const handleAppointmentComplete = useCallback(async (appointment: AppointmentWithRelations) => {
    if (onAppointmentComplete) {
      setIsLoading(true);
      try {
        await onAppointmentComplete(appointment);
        toast.success("Agendamento marcado como concluído");
        // Refresh appointments after complete
        if (onRefresh) {
          onRefresh();
        }
      } catch (error) {
        console.error("Error completing appointment:", error);
        toast.error("Erro ao concluir agendamento");
      } finally {
        setIsLoading(false);
      }
    }
  }, [onAppointmentComplete, onRefresh]);

  // Handle time slot clicks
  const handleTimeSlotClick = useCallback((time: string) => {
    if (onCreateAppointment) {
      onCreateAppointment(currentDate || undefined, time);
    }
  }, [currentDate, onCreateAppointment]);

  const handleWeekTimeSlotClick = useCallback((date: Date, time: string) => {
    if (onCreateAppointment) {
      onCreateAppointment(date, time);
    }
  }, [onCreateAppointment]);

  const handleDayClick = useCallback((date: Date) => {
    // Switch to day view when clicking on a day in month view
    setCurrentDate(date);
    setView('day');
  }, []);

  // Render current view
  const renderCurrentView = () => {
    const commonProps = {
      appointments,
      onAppointmentClick,
      onAppointmentEdit: handleAppointmentEdit,
      onAppointmentCancel: handleAppointmentCancel,
      onAppointmentComplete: handleAppointmentComplete,
    };

    switch (view) {
      case 'day':
        return (
          <DayView
            date={currentDate}
            onTimeSlotClick={handleTimeSlotClick}
            {...commonProps}
          />
        );
      case 'week':
        return (
          <WeekView
            date={currentDate}
            onTimeSlotClick={handleWeekTimeSlotClick}
            {...commonProps}
          />
        );
      case 'month':
        return (
          <MonthView
            date={currentDate}
            onDayClick={handleDayClick}
            {...commonProps}
          />
        );
      default:
        return null;
    }
  };

  // Don't render until currentDate is initialized
  if (!currentDate) {
    return (
      <div className={`flex flex-col h-full ${className || ''}`}>
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full ${className || ''}`}>
      {/* Navigation */}
      <CalendarNavigation
        currentDate={currentDate}
        view={view}
        onDateChange={setCurrentDate}
        onViewChange={setView}
        onToday={handleToday}
      />

      {/* Current view */}
      <div className="flex-1 relative">
        {isLoading && (
          <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-50">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}
        {renderCurrentView()}
      </div>

      {/* Keyboard shortcuts help */}
      <div className="hidden lg:block p-2 border-t text-xs text-muted-foreground">
        <div className="flex flex-wrap gap-4">
          <span><kbd className="bg-muted px-1 rounded">←/→</kbd> Navegar</span>
          <span><kbd className="bg-muted px-1 rounded">T</kbd> Hoje</span>
          <span><kbd className="bg-muted px-1 rounded">1/2/3</kbd> Dia/Semana/Mês</span>
          <span><kbd className="bg-muted px-1 rounded">N</kbd> Novo agendamento</span>
          <span><kbd className="bg-muted px-1 rounded">R</kbd> Atualizar</span>
        </div>
      </div>
    </div>
  );
}
