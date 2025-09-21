'use client';

import type { EventFilterOptions } from '@/services/event.service';
import { useCallback, useMemo } from 'react';
import { useCalendarContext } from '../calendar-context';

/**
 * Hook for managing event filters with the calendar context
 */
export function useEventFilters() {
  const {
    filteredEvents,
    applyFilters,
    clearFilters,
    currentFilters,
    events,
    loading,
  } = useCalendarContext();

  // Apply filters locally for immediate feedback
  const applyLocalFilters = useCallback((_filters: [a-zA-Z][a-zA-Z]*) => {
    // First update the context filters (will trigger backend fetch)
    applyFilters(filters);
  }, [applyFilters]);

  // Filter events based on current filters
  const locallyFilteredEvents = useMemo(() => {
    if (!currentFilters) return filteredEvents;

    return filteredEvents.filter(event => {
      // Status filter
      if (currentFilters.status && currentFilters.status.length > 0) {
        if (!event.status || !currentFilters.status.includes(event.status)) {
          return false;
        }
      }

      // Priority filter
      if (currentFilters.priority && currentFilters.priority.length > 0) {
        if (event.priority === undefined || !currentFilters.priority.includes(event.priority)) {
          return false;
        }
      }

      // Patient filter
      if (currentFilters.patientId && currentFilters.patientId.length > 0) {
        if (!event.patientId || !currentFilters.patientId.includes(event.patientId)) {
          return false;
        }
      }

      // Professional filter
      if (currentFilters.professionalId && currentFilters.professionalId.length > 0) {
        if (
          !event.professionalId || !currentFilters.professionalId.includes(event.professionalId)
        ) {
          return false;
        }
      }

      // Clinic filter
      if (currentFilters.clinicId && currentFilters.clinicId.length > 0) {
        if (!event.clinicId || !currentFilters.clinicId.includes(event.clinicId)) {
          return false;
        }
      }

      // Color filter
      if (currentFilters.color && currentFilters.color.length > 0) {
        if (!event.color || !currentFilters.color.includes(event.color)) {
          return false;
        }
      }

      // Search term filter
      if (currentFilters.searchTerm) {
        const searchTerm = currentFilters.searchTerm.toLowerCase();
        const searchableText = [
          event.title,
          event.description,
          event.notes,
          event.internalNotes,
          event.location,
        ].filter(Boolean).join(' ').toLowerCase();

        if (!searchableText.includes(searchTerm)) {
          return false;
        }
      }

      return true;
    });
  }, [filteredEvents, currentFilters]);

  // Get available filter options from current events
  const filterOptions = useMemo(() => {
    if (loading) {
      return {
        statuses: [],
        priorities: [],
        patients: [],
        professionals: [],
        clinics: [],
        colors: [],
      };
    }

    const statuses = [...new Set(events.map(e => e.status).filter(Boolean))];
    const priorities = [...new Set(events.map(e => e.priority).filter(p => p !== undefined))];
    const patientIds = [...new Set(events.map(e => e.patientId).filter(Boolean))];
    const professionalIds = [...new Set(events.map(e => e.professionalId).filter(Boolean))];
    const clinicIds = [...new Set(events.map(e => e.clinicId).filter(Boolean))];
    const colors = [...new Set(events.map(e => e.color).filter(Boolean))];

    return {
      statuses,
      priorities: priorities.sort((a, b) => a - b),
      patients: patientIds,
      professionals: professionalIds,
      clinics: clinicIds,
      colors,
    };
  }, [events, loading]);

  // Quick filter presets
  const applyQuickFilter = useCallback((preset: 'today' | 'week' | 'month' | 'upcoming') => {
    const now = new Date();
    let filters: EventFilterOptions = {};

    switch (preset) {
      case 'today':
        const today = new Date(now);
        today.setHours(0, 0, 0, 0);
        const todayEnd = new Date(today);
        todayEnd.setHours(23, 59, 59, 999);
        filters.dateRange = { start: today, end: todayEnd };
        break;

      case 'week':
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        weekStart.setHours(0, 0, 0, 0);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);
        filters.dateRange = { start: weekStart, end: weekEnd };
        break;

      case 'month':
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        monthEnd.setHours(23, 59, 59, 999);
        filters.dateRange = { start: monthStart, end: monthEnd };
        break;

      case 'upcoming':
        const upcomingStart = new Date(now);
        const upcomingEnd = new Date(now);
        upcomingEnd.setDate(upcomingEnd.getDate() + 7);
        filters.dateRange = { start: upcomingStart, end: upcomingEnd };
        break;
    }

    applyLocalFilters(filters);
  }, [applyLocalFilters]);

  // Status filter helpers
  const filterByStatus = useCallback((statuses: string[]) => {
    applyLocalFilters({ ...currentFilters, status: statuses });
  }, [applyLocalFilters, currentFilters]);

  const filterByPriority = useCallback((priorities: number[]) => {
    applyLocalFilters({ ...currentFilters, priority: priorities });
  }, [applyLocalFilters, currentFilters]);

  const filterByColor = useCallback((colors: string[]) => {
    applyLocalFilters({ ...currentFilters, color: colors });
  }, [applyLocalFilters, currentFilters]);

  const filterByDateRange = useCallback((start: Date, end: Date) => {
    applyLocalFilters({ ...currentFilters, dateRange: { start, end } });
  }, [applyLocalFilters, currentFilters]);

  const filterBySearchTerm = useCallback((_searchTerm: [a-zA-Z][a-zA-Z]*) => {
    applyLocalFilters({ ...currentFilters, searchTerm });
  }, [applyLocalFilters, currentFilters]);

  return {
    // State
    filters: currentFilters,
    filteredEvents: locallyFilteredEvents,
    isLoading: loading,
    hasActiveFilters: !!currentFilters,

    // Filter options
    filterOptions,

    // Actions
    applyFilters: applyLocalFilters,
    clearFilters,
    applyQuickFilter,
    filterByStatus,
    filterByPriority,
    filterByColor,
    filterByDateRange,
    filterBySearchTerm,

    // Stats
    totalEvents: events.length,
    filteredCount: locallyFilteredEvents.length,
  };
}
