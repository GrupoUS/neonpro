/**
 * Day View Component
 */

import React from 'react';
import type { DayViewProps, CalendarEvent } from '../../types/event-calendar';
import { formatCalendarTime, getEventColor, generateTimeSlots, isTimeSlotAvailable } from './utils';

export function DayView({
  date,
  events,
  filters,
  onEventClick,
  onTimeSlotClick,
  workingHours,
  intervalMinutes,
}: DayViewProps) {
  const timeSlots = generateTimeSlots(date, intervalMinutes, workingHours.start, workingHours.end);

  const handleTimeSlotClick = (slot: any) => {
    onTimeSlotClick(date, slot);
  };

  const getEventsForTimeSlot = (slot: any) => {
    return events.filter(event => {
      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end);
      const slotStart = new Date(slot.start);
      const slotEnd = new Date(slot.end);

      return (
        eventStart <= slotEnd && eventEnd >= slotStart
      );
    });
  };

  return (
    <div className="day-view flex-1 overflow-auto">
      <div className="time-grid">
        {timeSlots.map((slot, index) => {
          const slotEvents = getEventsForTimeSlot(slot);
          const isAvailable = isTimeSlotAvailable(slot, events);

          return (
            <div
              key={index}
              className={`time-slot border-b border-gray-200 min-h-[60px] flex ${
                isAvailable ? 'hover:bg-gray-50 cursor-pointer' : 'bg-gray-100'
              }`}
              onClick={() => isAvailable && handleTimeSlotClick(slot)}
            >
              <div className="time-label w-20 px-2 py-1 text-sm text-gray-500 border-r border-gray-200">
                {formatCalendarTime(slot.start)}
              </div>
              <div className="events flex-1 p-1 relative">
                {slotEvents.map((event, eventIndex) => (
                  <div
                    key={event.id}
                    className={`event-card absolute left-1 right-1 p-2 rounded text-sm cursor-pointer hover:shadow-md transition-shadow ${
                      event.status === 'cancelled' ? 'line-through opacity-50' : ''
                    }`}
                    style={{
                      backgroundColor: getEventColor(event) + '20',
                      borderLeft: `4px solid ${getEventColor(event)}`,
                      top: `${eventIndex * 24}px`,
                      height: '20px',
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick(event);
                    }}
                  >
                    <div className="event-title font-medium truncate">
                      {event.title}
                    </div>
                    {event.patientName && (
                      <div className="event-patient text-xs text-gray-600 truncate">
                        {event.patientName}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default DayView;