/**
 * Month View Component
 */

import React from 'react';
import type { MonthViewProps } from '../../types/event-calendar';
import { formatCalendarDate, getEventColor } from './utils';

export function MonthView({
  date,
  events,
  filters,
  onEventClick,
  onDateClick,
}: MonthViewProps) {
  const year = date.getFullYear();
  const month = date.getMonth();

  // Get first day of month
  const firstDay = new Date(year, month, 1);
  // Get last day of month
  const lastDay = new Date(year, month + 1, 0);

  // Calculate calendar grid
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());

  const endDate = new Date(lastDay);
  endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()));

  const calendarDays = [];
  const currentDay = new Date(startDate);

  while (currentDay <= endDate) {
    calendarDays.push(new Date(currentDay));
    currentDay.setDate(currentDay.getDate() + 1);
  }

  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const getEventsForDay = (day: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.start);
      return (
        eventDate.getDate() === day.getDate()
        && eventDate.getMonth() === day.getMonth()
        && eventDate.getFullYear() === day.getFullYear()
      );
    });
  };

  const isCurrentMonth = (day: Date) => {
    return day.getMonth() === month;
  };

  const isToday = (day: Date) => {
    const today = new Date();
    return (
      day.getDate() === today.getDate()
      && day.getMonth() === today.getMonth()
      && day.getFullYear() === today.getFullYear()
    );
  };

  return (
    <div className='month-view flex-1 overflow-auto'>
      <div className='month-grid'>
        {/* Day names header */}
        <div className='month-header grid grid-cols-7 border-b border-gray-200'>
          {dayNames.map((dayName, index) => (
            <div
              key={index}
              className='day-name p-2 text-center text-sm font-medium text-gray-600'
            >
              {dayName}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className='month-body grid grid-cols-7'>
          {calendarDays.map((day, index) => {
            const dayEvents = getEventsForDay(day);
            const currentMonth = isCurrentMonth(day);
            const today = isToday(day);

            return (
              <div
                key={index}
                className={`calendar-day border border-gray-200 min-h-[100px] p-1 ${
                  currentMonth ? 'bg-white' : 'bg-gray-50'
                } ${today ? 'bg-blue-50' : ''} hover:bg-gray-50 cursor-pointer`}
                onClick={() => onDateClick(day)}
              >
                <div
                  className={`day-number text-sm font-medium mb-1 ${
                    currentMonth ? 'text-gray-800' : 'text-gray-400'
                  } ${today ? 'text-blue-600' : ''}`}
                >
                  {day.getDate()}
                </div>

                <div className='events space-y-1 max-h-[80px] overflow-y-auto'>
                  {dayEvents.slice(0, 3).map((event, eventIndex) => (
                    <div
                      key={event.id}
                      className={`event-card p-1 rounded text-xs cursor-pointer hover:shadow-md transition-shadow ${
                        event.status === 'cancelled' ? 'line-through opacity-50' : ''
                      }`}
                      style={{
                        backgroundColor: getEventColor(event) + '20',
                        borderLeft: `2px solid ${getEventColor(event)}`,
                      }}
                      onClick={e => {
                        e.stopPropagation();
                        onEventClick(event);
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
                    </div>
                  ))}

                  {dayEvents.length > 3 && (
                    <div className='more-events text-xs text-gray-500 px-1'>
                      +{dayEvents.length - 3} mais
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default MonthView;
