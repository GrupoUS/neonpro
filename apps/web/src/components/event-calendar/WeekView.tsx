/**
 * Week View Component
 */

import type { KeyboardEvent, MouseEvent } from 'react'
import type { WeekViewProps } from '../../types/event-calendar.ts'
import { getEventColor } from './utils.ts'

export function WeekView({
  date,
  events,
  filters: _filters, // renamed to _filters to avoid unused parameter lint error
  onEventClick,
  onDateClick,
  workingHours,
}: WeekViewProps) {
  // helper to activate on Enter or Space
  const handleKeyActivate = (e: KeyboardEvent, cb: () => void) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      cb()
    }
  }

  // Calculate week start and end
  const weekStart = new Date(date)
  weekStart.setDate(weekStart.getDate() - weekStart.getDay())

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(weekStart)
    day.setDate(day.getDate() + i)
    return day
  })

  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

  return (
    <div className='week-view flex-1 overflow-auto'>
      <div className='week-grid'>
        {/* Header with day names */}
        <div className='week-header flex border-b border-gray-200'>
          <div className='time-header w-20 p-2 text-sm font-medium text-gray-500 border-r border-gray-200'>
            Hora
          </div>
          {weekDays.map(day => (
            <button
              // use stable, data-derived key
              key={day.getTime()}
              type="button"
              className={`day-header flex-1 p-2 text-center cursor-pointer hover:bg-gray-50 ${
                day.toDateString() === new Date().toDateString() ? 'bg-blue-50' : ''
              }`}
              onClick={() => onDateClick(day)}
              // keep keyboard handler for consistent behavior (buttons already activate on Enter/Space)
              onKeyDown={e => handleKeyActivate(e, () => onDateClick(day))}
            >
              <div className='day-name text-sm font-medium text-gray-600'>
                {dayNames[day.getDay()]}
              </div>
              <div className='day-number text-lg font-semibold'>
                {day.getDate()}
              </div>
            </button>
          ))}
        </div>

        {/* Time slots */}
        {Array.from({ length: workingHours.end - workingHours.start }, (_, hourIndex) => {
          const currentHour = workingHours.start + hourIndex

          return (
            // use a data-derived row key
            <div key={`hour-${currentHour}`} className='week-row flex border-b border-gray-100'>
              <div className='time-label w-20 p-2 text-sm text-gray-500 border-r border-gray-200 text-right'>
                {currentHour.toString().padStart(2, '0')}:00
              </div>

              {weekDays.map(day => {
                const dayEvents = events.filter(event => {
                  const eventDate = new Date(event.start)
                  return (
                    eventDate.getDate() === day.getDate() &&
                    eventDate.getMonth() === day.getMonth() &&
                    eventDate.getFullYear() === day.getFullYear() &&
                    eventDate.getHours() === currentHour
                  )
                })

                return (
                  <button
                    // combine day + hour for stable unique key
                    key={`${day.getTime()}-${currentHour}`}
                    type="button"
                    className='time-slot flex-1 border-r border-gray-100 min-h-[60px] p-1 hover:bg-gray-50 cursor-pointer'
                    onClick={() => {
                      const clickDate = new Date(day)
                      clickDate.setHours(currentHour, 0, 0, 0)
                      onDateClick(clickDate)
                    }}
                    // keep keyboard handler to explicitly control activation
                    onKeyDown={e =>
                      handleKeyActivate(e, () => {
                        const clickDate = new Date(day)
                        clickDate.setHours(currentHour, 0, 0, 0)
                        onDateClick(clickDate)
                      })}
                  >
                    {dayEvents.map(event => {
                      const color = getEventColor(event)
                      return (
                        <button
                          key={event.id}
                          type="button"
                          className={`event-card p-1 rounded text-xs mb-1 cursor-pointer hover:shadow-md transition-shadow ${
                            event.status === 'cancelled' ? 'line-through opacity-50' : ''
                          }`}
                          style={{
                            backgroundColor: `${color}20`,
                            borderLeft: `3px solid ${color}`,
                          }}
                          onClick={(e: MouseEvent) => {
                            e.stopPropagation()
                            onEventClick(event)
                          }}
                          // stop propagation on keyboard activation and invoke handler explicitly to avoid duplicate activations
                          onKeyDown={(ke: KeyboardEvent) => {
                            ke.stopPropagation()
                            handleKeyActivate(ke, () => onEventClick(event))
                          }}
                        >
                          <div className='event-title font-medium truncate'>
                            {event.title}
                          </div>
                          <div className='event-time text-xs text-gray-600'>
                            {new Date(event.start).toLocaleTimeString('pt-BR', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                          {event.patientName && (
                            <div className='event-patient text-xs text-gray-600 truncate'>
                              {event.patientName}
                            </div>
                          )}
                        </button>
                      )
                    })}
                  </button>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}
export default WeekView