'use client'

import { useState, useMemo } from 'react'
import { format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameDay, 
  isSameMonth, 
  isToday,
  addHours,
  startOfDay,
  endOfDay
} from 'date-fns'
import { pt } from 'date-fns/locale'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  User,
  Calendar as CalendarIcon,
  Grid3x3,
  List
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Appointment } from '@/hooks/use-appointments-manager'

interface AppointmentCalendarViewProps {
  appointments: Appointment[]
  currentDate: Date
  onDateChange: (date: Date) => void
  onAppointmentSelect?: (appointment: Appointment) => void
  onDaySelect?: (date: Date) => void
  onCreateAppointment?: (date: Date, time?: string) => void
  loading?: boolean
  className?: string
}

interface CalendarDay {
  date: Date
  isCurrentMonth: boolean
  isToday: boolean
  appointments: Appointment[]
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  confirmed: 'bg-blue-100 text-blue-800 border-blue-300',
  cancelled: 'bg-red-100 text-red-800 border-red-300',
  completed: 'bg-green-100 text-green-800 border-green-300',
  no_show: 'bg-red-100 text-red-800 border-red-300',
  rescheduled: 'bg-purple-100 text-purple-800 border-purple-300'
}

export function AppointmentCalendarView({
  appointments,
  currentDate,
  onDateChange,
  onAppointmentSelect,
  onDaySelect,
  onCreateAppointment,
  loading = false,
  className
}: AppointmentCalendarViewProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month')

  // Calculate calendar days
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const calendarStart = startOfWeek(monthStart, { locale: pt })
    const calendarEnd = endOfWeek(monthEnd, { locale: pt })
    
    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd })
    
    return days.map(date => {
      const dayAppointments = appointments.filter(appointment =>
        isSameDay(new Date(appointment.date_time), date)
      )
      
      return {
        date,
        isCurrentMonth: isSameMonth(date, currentDate),
        isToday: isToday(date),
        appointments: dayAppointments
      } as CalendarDay
    })
  }, [currentDate, appointments])

  // Get appointments for selected date
  const selectedDateAppointments = useMemo(() => {
    if (!selectedDate) return []
    return appointments.filter(appointment =>
      isSameDay(new Date(appointment.date_time), selectedDate)
    ).sort((a, b) => new Date(a.date_time).getTime() - new Date(b.date_time).getTime())
  }, [selectedDate, appointments])

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1))
    onDateChange(newDate)
  }

  const handleDayClick = (day: CalendarDay) => {
    setSelectedDate(day.date)
    onDaySelect?.(day.date)
  }

  const formatTime = (dateTime: string) => {
    return format(new Date(dateTime), 'HH:mm', { locale: pt })
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="grid grid-cols-7 gap-2">
              {[...Array(35)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

  return (
    <div className={cn('space-y-4', className)}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              {format(currentDate, 'MMMM yyyy', { locale: pt })}
            </CardTitle>
            
            <div className="flex items-center space-x-2">
              {/* View Mode Toggle */}
              <div className="flex items-center bg-muted rounded-md p-1">
                <Button
                  variant={viewMode === 'month' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('month')}
                  className="px-3"
                >
                  <Grid3x3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'week' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('week')}
                  className="px-3"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Navigation */}
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigateMonth('prev')}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onDateChange(new Date())}
              >
                Hoje
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigateMonth('next')}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
            {/* Weekday Headers */}
            {weekdays.map((day, index) => (
              <div 
                key={day}
                className="bg-muted p-3 text-center text-sm font-medium text-muted-foreground"
              >
                {day}
              </div>
            ))}
            
            {/* Calendar Days */}
            {calendarDays.map((day, index) => (
              <div
                key={index}
                className={cn(
                  'bg-background p-2 min-h-[80px] cursor-pointer hover:bg-muted/50 transition-colors',
                  !day.isCurrentMonth && 'opacity-40',
                  day.isToday && 'bg-primary/5',
                  selectedDate && isSameDay(day.date, selectedDate) && 'bg-primary/10 ring-2 ring-primary'
                )}
                onClick={() => handleDayClick(day)}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className={cn(
                    'text-sm font-medium',
                    day.isToday && 'text-primary'
                  )}>
                    {format(day.date, 'd')}
                  </span>
                  
                  {day.appointments.length > 0 && (
                    <Badge variant="secondary" className="text-xs h-4 px-1">
                      {day.appointments.length}
                    </Badge>
                  )}
                </div>
                
                {/* Appointment previews */}
                <div className="space-y-1">
                  {day.appointments.slice(0, 2).map((appointment) => (
                    <div
                      key={appointment.id}
                      className={cn(
                        'text-xs p-1 rounded border cursor-pointer truncate',
                        statusColors[appointment.status]
                      )}
                      onClick={(e) => {
                        e.stopPropagation()
                        onAppointmentSelect?.(appointment)
                      }}
                      title={`${formatTime(appointment.date_time)} - ${appointment.patient.full_name}`}
                    >
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTime(appointment.date_time)}
                      </div>
                      <div className="truncate">{appointment.patient.full_name}</div>
                    </div>
                  ))}
                  
                  {day.appointments.length > 2 && (
                    <div className="text-xs text-muted-foreground px-1">
                      +{day.appointments.length - 2} mais
                    </div>
                  )}
                </div>
                
                {/* Add appointment button on hover */}
                <div className="opacity-0 hover:opacity-100 transition-opacity mt-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full h-6 text-xs"
                    onClick={(e) => {
                      e.stopPropagation()
                      onCreateAppointment?.(day.date)
                    }}
                  >
                    +
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Selected Date Details */}
      {selectedDate && selectedDateAppointments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              {format(selectedDate, "dd 'de' MMMM", { locale: pt })}
              <Badge variant="outline">
                {selectedDateAppointments.length} agendamento{selectedDateAppointments.length !== 1 ? 's' : ''}
              </Badge>
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-3">
            {selectedDateAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => onAppointmentSelect?.(appointment)}
              >
                <div className="flex items-center space-x-3">
                  <div className="flex flex-col items-center">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      {formatTime(appointment.date_time)}
                    </span>
                  </div>
                  
                  <div>
                    <p className="font-medium">{appointment.patient.full_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {appointment.service.name}
                    </p>
                    {appointment.professional && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {appointment.professional.full_name}
                      </p>
                    )}
                  </div>
                </div>
                
                <Badge 
                  variant="outline"
                  className={statusColors[appointment.status]}
                >
                  {appointment.status === 'pending' && 'Pendente'}
                  {appointment.status === 'confirmed' && 'Confirmado'}
                  {appointment.status === 'cancelled' && 'Cancelado'}
                  {appointment.status === 'completed' && 'Concluído'}
                  {appointment.status === 'no_show' && 'Não Compareceu'}
                  {appointment.status === 'rescheduled' && 'Reagendado'}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
