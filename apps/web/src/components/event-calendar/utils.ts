/**
 * Event Calendar Utilities
 * Utility functions for calendar operations in healthcare settings
 */

import { addDays, format, isSameDay, isWithinInterval, parseISO, subDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  type: 'appointment' | 'consultation' | 'procedure' | 'follow_up' | 'blocker'
  patientId?: string
  patientName?: string
  professionalId?: string
  professionalName?: string
  clinicId: string
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'
  notes?: string
  color?: string
  reminder?: boolean
  reminderTime?: number // minutes before event
}

export interface CalendarView {
  type: 'day' | 'week' | 'month'
  date: Date
}

export interface CalendarFilters {
  type?: CalendarEvent['type'][]
  status?: CalendarEvent['status'][]
  professionalId?: string
  patientId?: string
  searchQuery?: string
}

export interface TimeSlot {
  start: Date
  end: Date
  available: boolean
  professionalId?: string
}

/**
 * Generate time slots for a given date
 */
export function generateTimeSlots(
  date: Date,
  intervalMinutes: number = 15,
  startHour: number = 8,
  endHour: number = 18,
): TimeSlot[] {
  const slots: TimeSlot[] = []
  const startTime = new Date(date)
  startTime.setHours(startHour, 0, 0, 0)

  const endTime = new Date(date)
  endTime.setHours(endHour, 0, 0, 0)

  const currentSlot = new Date(startTime)

  while (currentSlot < endTime) {
    const slotEnd = new Date(currentSlot)
    slotEnd.setMinutes(currentSlot.getMinutes() + intervalMinutes)

    slots.push({
      start: new Date(currentSlot),
      end: slotEnd,
      available: true,
    })

    currentSlot.setTime(slotEnd.getTime())
  }

  return slots
}

/**
 * Check if a time slot is available
 */
export function isTimeSlotAvailable(
  slot: TimeSlot,
  events: CalendarEvent[],
  professionalId?: string,
): boolean {
  return !events.some((event) => {
    if (professionalId && event.professionalId !== professionalId) {
      return false
    }

    return (
      isWithinInterval(slot.start, { start: event.start, end: event.end })
      || isWithinInterval(slot.end, { start: event.start, end: event.end })
      || isWithinInterval(event.start, { start: slot.start, end: slot.end })
    )
  })
}

/**
 * Filter events based on view and filters
 */
export function filterCalendarEvents(
  events: CalendarEvent[],
  view: CalendarView,
  filters: CalendarFilters = {},
): CalendarEvent[] {
  return events.filter((event) => {
    // Date range filter based on view
    let inDateRange = false

    switch (view.type) {
      case 'day':
        inDateRange = isSameDay(event.start, view.date)
        break
      case 'week':
        const weekStart = subDays(view.date, view.date.getDay())
        const weekEnd = addDays(weekStart, 6)
        inDateRange = isWithinInterval(event.start, { start: weekStart, end: weekEnd })
        break
      case 'month':
        inDateRange = event.start.getMonth() === view.date.getMonth()
          && event.start.getFullYear() === view.date.getFullYear()
        break
    }

    if (!inDateRange) return false

    // Type filter
    if (filters.type && !filters.type.includes(event.type)) return false

    // Status filter
    if (filters.status && !filters.status.includes(event.status)) return false

    // Professional filter
    if (filters.professionalId && event.professionalId !== filters.professionalId) return false

    // Patient filter
    if (filters.patientId && event.patientId !== filters.patientId) return false

    // Search query filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase()
      const searchText = `${event.title} ${event.patientName || ''} ${event.notes || ''}`
        .toLowerCase()
      if (!searchText.includes(query)) return false
    }

    return true
  })
}

/**
 * Get event color based on type and status
 */
export function getEventColor(event: CalendarEvent): string {
  const typeColors = {
    appointment: '#3B82F6', // blue
    consultation: '#10B981', // green
    procedure: '#F59E0B', // amber
    follow_up: '#8B5CF6', // purple
    blocker: '#EF4444', // red
  }

  const statusModifiers = {
    scheduled: '',
    confirmed: '',
    in_progress: 'opacity-75',
    completed: 'opacity-50',
    cancelled: 'line-through',
    no_show: 'bg-gray-300',
  }

  const baseColor = typeColors[event.type] || '#6B7280'

  // Return base color (CSS classes would handle modifiers in actual component)
  return baseColor
}

/**
 * Format date for calendar display
 */
export function formatCalendarDate(
  date: Date,
  formatString: string = 'dd/MM/yyyy',
): string {
  return format(date, formatString, { locale: ptBR })
}

/**
 * Format time for calendar display
 */
export function formatCalendarTime(time: Date): string {
  return format(time, 'HH:mm', { locale: ptBR })
}

/**
 * Calculate event duration
 */
export function getEventDuration(event: CalendarEvent): number {
  return (event.end.getTime() - event.start.getTime()) / (1000 * 60) // minutes
}

/**
 * Check for overlapping events
 */
export function findOverlappingEvents(events: CalendarEvent[]): CalendarEvent[][] {
  const sortedEvents = [...events].sort((a, b) => a.start.getTime() - b.start.getTime())
  const overlappingGroups: CalendarEvent[][] = []

  for (const event of sortedEvents) {
    let added = false

    // Check if this event overlaps with any existing group
    for (const group of overlappingGroups) {
      if (
        group.some((groupEvent) =>
          isWithinInterval(event.start, { start: groupEvent.start, end: groupEvent.end })
          || isWithinInterval(event.end, { start: groupEvent.start, end: groupEvent.end })
          || isWithinInterval(groupEvent.start, { start: event.start, end: event.end })
        )
      ) {
        group.push(event)
        added = true
        break
      }
    }

    if (!added) {
      overlappingGroups.push([event])
    }
  }

  return overlappingGroups
}

/**
 * Generate available time slots for scheduling
 */
export function getAvailableTimeSlots(
  date: Date,
  events: CalendarEvent[],
  professionalId?: string,
  intervalMinutes: number = 15,
): TimeSlot[] {
  const allSlots = generateTimeSlots(date, intervalMinutes)

  return allSlots.map((slot) => ({
    ...slot,
    professionalId,
    available: isTimeSlotAvailable(slot, events, professionalId),
  }))
}

/**
 * Validate event time constraints
 */
export function validateEventTime(
  start: Date,
  end: Date,
  workingHours = { start: 8, end: 18 },
): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  if (start >= end) {
    errors.push('O horário de início deve ser anterior ao horário de término')
  }

  if (start.getHours() < workingHours.start || start.getHours() >= workingHours.end) {
    errors.push('O horário de início está fora do horário de funcionamento')
  }

  if (
    end.getHours() > workingHours.end
    || (end.getHours() === workingHours.end && end.getMinutes() > 0)
  ) {
    errors.push('O horário de término está fora do horário de funcionamento')
  }

  const duration = (end.getTime() - start.getTime()) / (1000 * 60)
  if (duration < 15) {
    errors.push('O evento deve ter duração mínima de 15 minutos')
  }

  if (duration > 240) {
    errors.push('O evento não pode ter duração superior a 4 horas')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Export calendar events to different formats
 */
export function exportCalendarEvents(
  events: CalendarEvent[],
  format: 'csv' | 'json' | 'ical',
): string {
  switch (format) {
    case 'csv':
      return eventsToCSV(events)
    case 'json':
      return JSON.stringify(events, null, 2)
    case 'ical':
      return eventsToICal(events)
    default:
      throw new Error(`Unsupported export format: ${format}`)
  }
}

/**
 * Convert events to CSV format
 */
function eventsToCSV(events: CalendarEvent[]): string {
  const headers = [
    'ID',
    'Título',
    'Início',
    'Término',
    'Tipo',
    'Status',
    'Paciente',
    'Profissional',
  ]

  const rows = events.map((event) => [
    event.id,
    event.title,
    event.start.toISOString(),
    event.end.toISOString(),
    event.type,
    event.status,
    event.patientName || '',
    event.professionalName || '',
  ])

  return [headers, ...rows]
    .map((row) => row.map((cell) => `"${cell}"`).join(','))
    .join('\n')
}

/**
 * Convert events to iCal format
 */
function eventsToICal(events: CalendarEvent[]): string {
  const header = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//NeonPro//Calendar//EN
CALSCALE:GREGORIAN`

  const footer = `END:VCALENDAR`

  const eventStrings = events.map((event) => {
    const startDate = format(event.start, "yyyyMMdd'T'HHmmss")
    const endDate = format(event.end, "yyyyMMdd'T'HHmmss")

    return `BEGIN:VEVENT
UID:${event.id}
DTSTART:${startDate}
DTEND:${endDate}
SUMMARY:${event.title}
DESCRIPTION:${event.notes || ''}
STATUS:${event.status}
END:VEVENT`
  })

  return [header, ...eventStrings, footer].join('\n')
}

/**
 * Parse date from various formats
 */
export function parseDate(dateInput: string | Date): Date {
  if (dateInput instanceof Date) {
    return dateInput
  }

  // Try parsing as ISO string first
  const isoDate = parseISO(dateInput)
  if (!isNaN(isoDate.getTime())) {
    return isoDate
  }

  // Try parsing common Brazilian formats
  const formats = [
    'dd/MM/yyyy HH:mm',
    'dd/MM/yyyy',
    'yyyy-MM-dd HH:mm',
    'yyyy-MM-dd',
  ]

  for (const formatString of formats) {
    try {
      // Note: In a real implementation, you'd use a library that supports custom date parsing
      // For now, we'll rely on the Date constructor and hope for the best
      const parsed = new Date(dateInput)
      if (!isNaN(parsed.getTime())) {
        return parsed
      }
    } catch {
      // Continue to next format
    }
  }

  throw new Error(`Unable to parse date: ${dateInput}`)
}
