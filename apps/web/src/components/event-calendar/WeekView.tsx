/**
 * Week View Component
 */

import React from 'react';
import type { WeekViewProps } from '../../types/event-calendar';
import { formatCalendarDate, getEventColor } from './utils';

export function WeekView({
  date,
  events,
  filters,
  onEventClick,
  onDateClick,
  workingHours,
}: WeekViewProps) {
  // Calculate week start and end
  const weekStart = new Date(date);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(weekStart);
    day.setDate(day.getDate() + i);
    return day;
  });

  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <div className="week-view flex-1 overflow-auto">
      <div className="week-grid">
        {/* Header with day names */}
        <div className="week-header flex border-b border-gray-200">
          <div className="time-header w-20 p-2 text-sm font-medium text-gray-500 border-r border-gray-200">
            Hora
          </div>
          {weekDays.map((day, index) => (
            <div
              key={index}
              className={`day-header flex-1 p-2 text-center cursor-pointer hover:bg-gray-50 ${
                day.toDateString() === new Date().toDateString() ? 'bg-blue-50' : ''
              }`}
              onClick={() => onDateClick(day)}
            >
              <div className="day-name text-sm font-medium text-gray-600">
                {dayNames[index]}
              </div>
              <div className="day-number text-lg font-semibold">
                {day.getDate()}
              </div>
            </div>
          ))}
        </div>

        {/* Time slots */}
        {Array.from({ length: workingHours.end - workingHours.start }, (_, hour) => {
          const currentHour = workingHours.start + hour;
          
          return (
            <div key={hour} className="week-row flex border-b border-gray-100">
              <div className="time-label w-20 p-2 text-sm text-gray-500 border-r border-gray-200 text-right">
                {currentHour.toString().padStart(2, '0')}:00
              </div>
              
              {weekDays.map((day, dayIndex) => {
                const dayEvents = events.filter(event => {
                  const eventDate = new Date(event.start);
                  return (
                    eventDate.getDate() === day.getDate() &&
                    eventDate.getMonth() === day.getMonth() &&
                    eventDate.getFullYear() === day.getFullYear() &&
                    eventDate.getHours() === currentHour
                  );
                });

                return (
                  <div
                    key={dayIndex}
                    className="time-slot flex-1 border-r border-gray-100 min-h-[60px] p-1 hover:bg-gray-50 cursor-pointer"
                    onClick={() => {
                      const clickDate = new Date(day);
                      clickDate.setHours(currentHour, 0, 0, 0);
                      onDateClick(clickDate);
                    }}
                  >
                    {dayEvents.map((event, eventIndex) => (
                      <div
                        key={event.id}
                        className={`event-card p-1 rounded text-xs mb-1 cursor-pointer hover:shadow-md transition-shadow ${
                          event.status === 'cancelled' ? 'line-through opacity-50' : ''
                        }`}
                        style={{
                          backgroundColor: getEventColor(event) + '20',
                          borderLeft: `3px solid ${getEventColor(event)}`,
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEventClick(event);
                        }}
                      >
                        <div className="event-title font-medium truncate">
                          {event.title}
                        </div>
                        <div className="event-time text-xs text-gray-600">
                          {new Date(event.start).toLocaleTimeString('pt-BR', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                        {event.patientName && (
                          <div className="event-patient text-xs text-gray-600 truncate">
                            {event.patientName}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default WeekView;