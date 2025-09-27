import { useState, useCallback } from 'react'
import { addDays, format, isSameDay, parseISO } from 'date-fns'
import type { TimeSlot } from '@/types/aesthetic-scheduling.js'

export function useDateManagement(initialDate?: Date) {
  const [selectedDate, setSelectedDate] = useState<Date>(initialDate || new Date())
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week')

  const selectDate = useCallback((date: Date) => {
    setSelectedDate(date)
  }, [])

  const navigateDate = useCallback((direction: 'prev' | 'next') => {
    setSelectedDate(prev => 
      direction === 'next' ? addDays(prev, 1) : addDays(prev, -1)
    )
  }, [])

  const formatDate = useCallback((date: Date, formatStr: string = 'yyyy-MM-dd') => {
    return format(date, formatStr)
  }, [])

  const isDateSelected = useCallback((date: Date) => {
    return isSameDay(date, selectedDate)
  }, [selectedDate])

  const parseDate = useCallback((dateString: string) => {
    return parseISO(dateString)
  }, [])

  const generateTimeSlots = useCallback((startHour: number = 8, endHour: number = 18, interval: number = 30): TimeSlot[] => {
    const slots: TimeSlot[] = []
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += interval) {
        const start = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        const endMinute = minute + interval
        const endHourAdjusted = endMinute >= 60 ? hour + 1 : hour
        const endMinuteAdjusted = endMinute >= 60 ? endMinute - 60 : endMinute
        const end = `${endHourAdjusted.toString().padStart(2, '0')}:${endMinuteAdjusted.toString().padStart(2, '0')}`
        
        slots.push({
          start,
          end,
          isAvailable: true
        })
      }
    }
    return slots
  }, [])

  return {
    selectedDate,
    viewMode,
    selectDate,
    navigateDate,
    formatDate,
    isDateSelected,
    parseDate,
    generateTimeSlots,
    setViewMode
  }
}