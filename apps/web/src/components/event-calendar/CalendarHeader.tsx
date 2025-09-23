/**
 * Calendar Header Component
 */

import React from 'react';
import type { CalendarHeaderProps, CalendarNavigationProps } from '../../types/event-calendar';
import { formatCalendarDate } from './utils';

function CalendarNavigation({
  currentDate,
  onPrevious,
  onNext,
  onToday,
}: CalendarNavigationProps) {
  return (
    <div className="calendar-navigation flex items-center space-x-2">
      <button
        onClick={onToday}
        className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
      >
        Hoje
      </button>
      <button
        onClick={onPrevious}
        className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
        aria-label="Previous"
      >
        ◀
      </button>
      <button
        onClick={onNext}
        className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
        aria-label="Next"
      >
        ▶
      </button>
    </div>
  );
}

export function CalendarHeader({
  currentDate,
  view,
  onViewChange,
  onDateChange,
  onTodayClick,
}: CalendarHeaderProps) {
  const handlePrevious = () => {
    const newDate = new Date(currentDate);
    switch (view.type) {
      case 'day':
        newDate.setDate(newDate.getDate() - 1);
        break;
      case 'week':
        newDate.setDate(newDate.getDate() - 7);
        break;
      case 'month':
        newDate.setMonth(newDate.getMonth() - 1);
        break;
    }
    onDateChange(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    switch (view.type) {
      case 'day':
        newDate.setDate(newDate.getDate() + 1);
        break;
      case 'week':
        newDate.setDate(newDate.getDate() + 7);
        break;
      case 'month':
        newDate.setMonth(newDate.getMonth() + 1);
        break;
    }
    onDateChange(newDate);
  };

  const getViewLabel = () => {
    switch (view.type) {
      case 'day':
        return formatCalendarDate(view.date, "dd 'de' MMMM 'de' yyyy");
      case 'week':
        const weekStart = new Date(view.date);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        return `${formatCalendarDate(weekStart, "dd/MM")} - ${formatCalendarDate(weekEnd, "dd/MM/yyyy")}`;
      case 'month':
        return formatCalendarDate(view.date, "MMMM 'de' yyyy");
      default:
        return '';
    }
  };

  return (
    <div className="calendar-header bg-gray-50 border-b border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-semibold text-gray-800">
            {getViewLabel()}
          </h1>
          <CalendarNavigation
            currentDate={currentDate}
            onPrevious={handlePrevious}
            onNext={handleNext}
            onToday={onTodayClick}
          />
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onViewChange({ type: 'day', date: currentDate })}
            className={`px-3 py-1 text-sm rounded transition-colors ${
              view.type === 'day'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Dia
          </button>
          <button
            onClick={() => onViewChange({ type: 'week', date: currentDate })}
            className={`px-3 py-1 text-sm rounded transition-colors ${
              view.type === 'week'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Semana
          </button>
          <button
            onClick={() => onViewChange({ type: 'month', date: currentDate })}
            className={`px-3 py-1 text-sm rounded transition-colors ${
              view.type === 'month'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Mês
          </button>
        </div>
      </div>
    </div>
  );
}

export default CalendarHeader;