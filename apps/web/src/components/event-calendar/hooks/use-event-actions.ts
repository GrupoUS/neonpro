'use client';

import type {
  CalendarEventExtended,
  CreateEventData,
  UpdateEventData,
} from '@/services/event.service';
import { useCallback } from 'react';
import { toast } from 'sonner';
import { useCalendarContext } from '../calendar-context';

/**
 * Hook for event actions (create, update, delete, duplicate, etc.)
 */
export function useEventActions() {
  const {
    createEvent,
    updateEvent,
    deleteEvent,
    refreshEvents,
    loading,
    error,
  } = useCalendarContext();

  // Create event with validation and conflict checking
  const createEventWithValidation = useCallback(async (
    eventData: CreateEventData,
    options: {
      checkConflicts?: boolean;
      showToast?: boolean;
    } = {},
  ) => {
    const { checkConflicts = true, showToast = true } = options;

    try {
      // Check for conflicts if requested
      if (checkConflicts) {
        const { EventService } = await import('@/services/event.service');
        const conflicts = await EventService.checkConflicts(
          eventData.start,
          eventData.end,
        );

        if (conflicts.length > 0) {
          const conflictTitles = conflicts.map(c => c.title).join(', ');
          throw new Error(`Time conflict with existing events: ${conflictTitles}`);
        }
      }

      await createEvent(eventData);

      if (showToast) {
        toast.success('Event created successfully');
      }

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create event';
      if (showToast) {
        toast.error(errorMessage);
      }
      throw err;
    }
  }, [createEvent]);

  // Update event with validation and conflict checking
  const updateEventWithValidation = useCallback(async (
    eventData: UpdateEventData,
    options: {
      checkConflicts?: boolean;
      showToast?: boolean;
      excludeEventId?: string;
    } = {},
  ) => {
    const { checkConflicts = true, showToast = true, excludeEventId } = options;

    try {
      // Check for conflicts if requested and dates are being updated
      if (checkConflicts && (eventData.start || eventData.end)) {
        const { EventService } = await import('@/services/event.service');
        const currentEvent = await EventService.getEventById(eventData.id);

        if (currentEvent) {
          const start = eventData.start || currentEvent.start;
          const end = eventData.end || currentEvent.end;

          const conflicts = await EventService.checkConflicts(
            start,
            end,
            excludeEventId || eventData.id,
          );

          if (conflicts.length > 0) {
            const conflictTitles = conflicts.map(c => c.title).join(', ');
            throw new Error(`Time conflict with existing events: ${conflictTitles}`);
          }
        }
      }

      await updateEvent(eventData);

      if (showToast) {
        toast.success('Event updated successfully');
      }

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update event';
      if (showToast) {
        toast.error(errorMessage);
      }
      throw err;
    }
  }, [updateEvent]);

  // Delete event with confirmation
  const deleteEventWithConfirmation = useCallback(async (
    eventId: string,
    options: {
      requireConfirmation?: boolean;
      customMessage?: string;
      showToast?: boolean;
    } = {},
  ) => {
    const {
      requireConfirmation = true,
      customMessage,
      showToast = true,
    } = options;

    try {
      if (requireConfirmation) {
        const message = customMessage || 'Are you sure you want to delete this event?';
        const confirmed = window.confirm(message);

        if (!confirmed) {
          return false; // User cancelled
        }
      }

      await deleteEvent(eventId);

      if (showToast) {
        toast.success('Event deleted successfully');
      }

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete event';
      if (showToast) {
        toast.error(errorMessage);
      }
      throw err;
    }
  }, [deleteEvent]);

  // Duplicate event
  const duplicateEvent = useCallback(async (
    eventId: string,
    options: {
      offsetDays?: number;
      offsetHours?: number;
      updateTitle?: string;
      showToast?: boolean;
    } = {},
  ) => {
    const {
      offsetDays = 0,
      offsetHours = 1,
      updateTitle,
      showToast = true,
    } = options;

    try {
      const { EventService } = await import('@/services/event.service');
      const originalEvent = await EventService.getEventById(eventId);

      if (!originalEvent) {
        throw new Error('Event not found');
      }

      // Create new event with offset times
      const newEvent: CreateEventData = {
        title: updateTitle || `${originalEvent.title} (Copy)`,
        start: new Date(
          originalEvent.start.getTime() + (offsetDays * 24 * 60 * 60 * 1000)
            + (offsetHours * 60 * 60 * 1000),
        ),
        end: new Date(
          originalEvent.end.getTime() + (offsetDays * 24 * 60 * 60 * 1000)
            + (offsetHours * 60 * 60 * 1000),
        ),
        description: originalEvent.description,
        allDay: originalEvent.allDay,
        color: originalEvent.color,
        location: originalEvent.location,
        patientId: originalEvent.patientId,
        professionalId: originalEvent.professionalId,
        serviceTypeId: originalEvent.serviceTypeId,
        clinicId: originalEvent.clinicId,
        notes: originalEvent.notes,
        priority: originalEvent.priority,
        status: originalEvent.status,
      };

      await createEvent(newEvent);

      if (showToast) {
        toast.success('Event duplicated successfully');
      }

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to duplicate event';
      if (showToast) {
        toast.error(errorMessage);
      }
      throw err;
    }
  }, [createEvent]);

  // Move event to new time
  const moveEvent = useCallback(async (
    eventId: string,
    newStart: Date,
    newEnd: Date,
    options: {
      checkConflicts?: boolean;
      showToast?: boolean;
    } = {},
  ) => {
    const { checkConflicts = true, showToast = true } = options;

    try {
      if (checkConflicts) {
        const { EventService } = await import('@/services/event.service');
        const conflicts = await EventService.checkConflicts(
          newStart,
          newEnd,
          eventId,
        );

        if (conflicts.length > 0) {
          const conflictTitles = conflicts.map(c => c.title).join(', ');
          throw new Error(`Time conflict with existing events: ${conflictTitles}`);
        }
      }

      await updateEvent({
        id: eventId,
        start: newStart,
        end: newEnd,
      });

      if (showToast) {
        toast.success('Event moved successfully');
      }

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to move event';
      if (showToast) {
        toast.error(errorMessage);
      }
      throw err;
    }
  }, [updateEvent]);

  // Update event status
  const updateEventStatus = useCallback(async (
    eventId: string,
    status: string,
    options: {
      showToast?: boolean;
    } = {},
  ) => {
    const { showToast = true } = options;

    try {
      await updateEvent({
        id: eventId,
        status,
      });

      if (showToast) {
        toast.success(`Event status updated to ${status}`);
      }

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update event status';
      if (showToast) {
        toast.error(errorMessage);
      }
      throw err;
    }
  }, [updateEvent]);

  // Bulk event operations
  const bulkUpdateEvents = useCallback(async (
    eventIds: string[],
    updates: Partial<UpdateEventData>,
    options: {
      showToast?: boolean;
    } = {},
  ) => {
    const { showToast = true } = options;

    try {
      const updatePromises = eventIds.map(id => updateEvent({ id, ...updates }));

      await Promise.all(updatePromises);

      if (showToast) {
        toast.success(`${eventIds.length} events updated successfully`);
      }

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update events';
      if (showToast) {
        toast.error(errorMessage);
      }
      throw err;
    }
  }, [updateEvent]);

  const bulkDeleteEvents = useCallback(async (
    eventIds: string[],
    options: {
      requireConfirmation?: boolean;
      showToast?: boolean;
    } = {},
  ) => {
    const { requireConfirmation = true, showToast = true } = options;

    try {
      if (requireConfirmation) {
        const confirmed = window.confirm(
          `Are you sure you want to delete ${eventIds.length} events?`,
        );
        if (!confirmed) {
          return false;
        }
      }

      const deletePromises = eventIds.map(id => deleteEvent(id));
      await Promise.all(deletePromises);

      if (showToast) {
        toast.success(`${eventIds.length} events deleted successfully`);
      }

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete events';
      if (showToast) {
        toast.error(errorMessage);
      }
      throw err;
    }
  }, [deleteEvent]);

  // Refresh events
  const refreshCalendarEvents = useCallback(async () => {
    try {
      await refreshEvents();
      toast.success('Events refreshed');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to refresh events';
      toast.error(errorMessage);
      throw err;
    }
  }, [refreshEvents]);

  return {
    // State
    loading,
    error,

    // Basic CRUD operations
    createEvent: createEventWithValidation,
    updateEvent: updateEventWithValidation,
    deleteEvent: deleteEventWithConfirmation,
    refreshEvents: refreshCalendarEvents,

    // Advanced operations
    duplicateEvent,
    moveEvent,
    updateEventStatus,

    // Bulk operations
    bulkUpdateEvents,
    bulkDeleteEvents,
  };
}

/**
 * Hook for event validation and utilities
 */
export function useEventValidation() {
  const validateEvent = useCallback((eventData: Partial<CreateEventData | UpdateEventData>) => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required fields
    if (!eventData.title?.trim()) {
      errors.push('Event title is required');
    }

    if (eventData.start && eventData.end) {
      // Time validation
      if (eventData.start >= eventData.end) {
        errors.push('Event end time must be after start time');
      }

      // Duration validation
      const duration = eventData.end.getTime() - eventData.start.getTime();
      const durationMinutes = duration / (1000 * 60);

      if (durationMinutes < 5) {
        warnings.push('Event duration is less than 5 minutes');
      }

      if (durationMinutes > 480) { // 8 hours
        warnings.push('Event duration exceeds 8 hours');
      }

      // Business hours validation (optional)
      const startHour = eventData.start.getHours();
      if (startHour < 6 || startHour > 22) {
        warnings.push('Event is scheduled outside normal business hours');
      }
    }

    // Future date validation
    if (eventData.start && eventData.start < new Date()) {
      warnings.push('Event is scheduled in the past');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }, []);

  const getEventConflicts = useCallback(async (
    start: Date,
    end: Date,
    excludeEventId?: string,
  ) => {
    const { EventService } = await import('@/services/event.service');
    return EventService.checkConflicts(start, end, excludeEventId);
  }, []);

  const getEventStatistics = useCallback(async (dateRange?: { start: Date; end: Date }) => {
    const { EventService } = await import('@/services/event.service');
    return EventService.getEventStatistics(dateRange);
  }, []);

  return {
    validateEvent,
    getEventConflicts,
    getEventStatistics,
  };
}
