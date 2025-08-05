'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { 
  Calendar, 
  CalendarDays, 
  Clock, 
  List,
  ChevronLeft,
  ChevronRight,
  RotateCcw
} from 'lucide-react'
import { cn } from '@/lib/utils'
import moment from 'moment'
import 'moment/locale/pt-br'

// Configure moment for Brazilian Portuguese
moment.locale('pt-br')

interface CalendarViewsProps {
  currentView: 'month' | 'week' | 'day' | 'agenda'
  onViewChange: (view: 'month' | 'week' | 'day' | 'agenda') => void
  currentDate: Date
  onDateChange: (date: Date) => void
}

const viewConfig = [
  {
    key: 'month' as const,
    label: 'Mês',
    icon: Calendar,
    shortcut: 'M'
  },
  {
    key: 'week' as const,
    label: 'Semana',
    icon: CalendarDays,
    shortcut: 'S'
  },
  {
    key: 'day' as const,
    label: 'Dia',
    icon: Clock,
    shortcut: 'D'
  },
  {
    key: 'agenda' as const,
    label: 'Agenda',
    icon: List,
    shortcut: 'A'
  }
]

export function CalendarViews({
  currentView,
  onViewChange,
  currentDate,
  onDateChange
}: CalendarViewsProps) {
  
  // Navigation handlers
  const handlePrevious = () => {
    const newDate = moment(currentDate).subtract(1, getNavigationUnit()).toDate()
    onDateChange(newDate)
  }

  const handleNext = () => {
    const newDate = moment(currentDate).add(1, getNavigationUnit()).toDate()
    onDateChange(newDate)
  }

  const handleToday = () => {
    onDateChange(new Date())
  }

  // Get navigation unit based on current view
  const getNavigationUnit = () => {
    switch (currentView) {
      case 'month':
        return 'month'
      case 'week':
        return 'week'
      case 'day':
        return 'day'
      case 'agenda':
        return 'week'
      default:
        return 'month'
    }
  }

  // Get formatted date label
  const getDateLabel = () => {
    const momentDate = moment(currentDate)
    
    switch (currentView) {
      case 'month':
        return momentDate.format('MMMM YYYY')
      case 'week':
        const weekStart = momentDate.startOf('week')
        const weekEnd = momentDate.endOf('week')
        
        if (weekStart.month() === weekEnd.month()) {
          return `${weekStart.format('DD')} - ${weekEnd.format('DD')} de ${momentDate.format('MMMM YYYY')}`
        } else {
          return `${weekStart.format('DD MMM')} - ${weekEnd.format('DD MMM YYYY')}`
        }
      case 'day':
        return momentDate.format('dddd, DD [de] MMMM [de] YYYY')
      case 'agenda':
        return `Agenda - ${momentDate.format('MMMM YYYY')}`
      default:
        return momentDate.format('MMMM YYYY')
    }
  }

  // Keyboard shortcuts handler
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle if no input is focused
      if (document.activeElement?.tagName === 'INPUT' || 
          document.activeElement?.tagName === 'TEXTAREA') {
        return
      }

      // View shortcuts
      if (event.ctrlKey || event.metaKey) {
        switch (event.key.toLowerCase()) {
          case 'm':
            event.preventDefault()
            onViewChange('month')
            break
          case 's':
            event.preventDefault()
            onViewChange('week')
            break
          case 'd':
            event.preventDefault()
            onViewChange('day')
            break
          case 'a':
            event.preventDefault()
            onViewChange('agenda')
            break
        }
      }

      // Navigation shortcuts
      switch (event.key) {
        case 'ArrowLeft':
          if (event.shiftKey) {
            event.preventDefault()
            handlePrevious()
          }
          break
        case 'ArrowRight':
          if (event.shiftKey) {
            event.preventDefault()
            handleNext()
          }
          break
        case 'Home':
          event.preventDefault()
          handleToday()
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [currentView, currentDate, onViewChange, onDateChange])

  return (
    <div className="flex items-center justify-between w-full">
      {/* Navigation Controls */}
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrevious}
          className="h-8 w-8 p-0"
          title={`Anterior (Shift + ←)`}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleToday}
          className="h-8 px-3"
          title="Hoje (Home)"
        >
          <RotateCcw className="h-3 w-3 mr-1" />
          Hoje
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleNext}
          className="h-8 w-8 p-0"
          title={`Próximo (Shift + →)`}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Date Label */}
      <div className="flex-1 text-center">
        <h3 className="text-lg font-semibold text-foreground">
          {getDateLabel()}
        </h3>
        {currentView === 'day' && (
          <p className="text-sm text-muted-foreground">
            {moment().isSame(currentDate, 'day') ? 'Hoje' : ''}
          </p>
        )}
      </div>

      {/* View Toggle Buttons */}
      <div className="flex items-center space-x-1 bg-muted rounded-lg p-1">
        {viewConfig.map(({ key, label, icon: Icon, shortcut }) => (
          <Button
            key={key}
            variant={currentView === key ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => onViewChange(key)}
            className={cn(
              'h-8 px-3 text-xs font-medium transition-all',
              currentView === key
                ? 'bg-background shadow-sm'
                : 'hover:bg-background/50'
            )}
            title={`${label} (Ctrl/Cmd + ${shortcut})`}
          >
            <Icon className="h-3 w-3 mr-1" />
            {label}
          </Button>
        ))}
      </div>
    </div>
  )
}

// Additional component for mobile view toggle
export function MobileCalendarViews({
  currentView,
  onViewChange,
  currentDate,
  onDateChange
}: CalendarViewsProps) {
  const handlePrevious = () => {
    const unit = currentView === 'month' ? 'month' : 
                 currentView === 'week' ? 'week' : 'day'
    const newDate = moment(currentDate).subtract(1, unit).toDate()
    onDateChange(newDate)
  }

  const handleNext = () => {
    const unit = currentView === 'month' ? 'month' : 
                 currentView === 'week' ? 'week' : 'day'
    const newDate = moment(currentDate).add(1, unit).toDate()
    onDateChange(newDate)
  }

  const getShortDateLabel = () => {
    const momentDate = moment(currentDate)
    
    switch (currentView) {
      case 'month':
        return momentDate.format('MMM YYYY')
      case 'week':
        return `${momentDate.startOf('week').format('DD/MM')} - ${momentDate.endOf('week').format('DD/MM')}`
      case 'day':
        return momentDate.format('DD/MM')
      case 'agenda':
        return 'Agenda'
      default:
        return momentDate.format('MMM YYYY')
    }
  }

  return (
    <div className="flex flex-col space-y-3 md:hidden">
      {/* Date Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={handlePrevious}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <h3 className="text-lg font-semibold">
          {getShortDateLabel()}
        </h3>
        
        <Button variant="ghost" size="sm" onClick={handleNext}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* View Toggle */}
      <div className="grid grid-cols-4 gap-1 bg-muted rounded-lg p-1">
        {viewConfig.map(({ key, label, icon: Icon }) => (
          <Button
            key={key}
            variant={currentView === key ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => onViewChange(key)}
            className={cn(
              'h-8 text-xs',
              currentView === key && 'bg-background shadow-sm'
            )}
          >
            <Icon className="h-3 w-3 mr-1" />
            {label}
          </Button>
        ))}
      </div>
    </div>
  )
}
