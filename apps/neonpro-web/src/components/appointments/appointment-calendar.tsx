'use client'

import React, { useCallback, useMemo } from 'react'
import { Calendar, momentLocalizer, Views, View } from 'react-big-calendar'
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop'
import moment from 'moment'
import 'moment/locale/pt-br'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css'
import { AppointmentEvent, Professional } from '@/app/appointments/page'
import { AppointmentSlot } from './appointment-slot'
import { cn } from '@/lib/utils'

// Configure moment for Brazilian Portuguese
moment.locale('pt-br')
const localizer = momentLocalizer(moment)

// Create draggable calendar
const DnDCalendar = withDragAndDrop(Calendar)

interface AppointmentCalendarProps {
  appointments: AppointmentEvent[]
  professionals: Professional[]
  view: 'month' | 'week' | 'day' | 'agenda'
  date: Date
  onViewChange: (view: 'month' | 'week' | 'day' | 'agenda') => void
  onDateChange: (date: Date) => void
  onAppointmentDrop: (event: AppointmentEvent, start: Date, end: Date) => void
  onAppointmentResize: (event: AppointmentEvent, start: Date, end: Date) => void
  onAppointmentSelect: (appointment: AppointmentEvent) => void
  onSlotSelect: (slotInfo: any) => void
}

// Service type colors for appointments
const serviceColors = {
  consultation: '#3B82F6', // blue-500
  botox: '#8B5CF6',        // violet-500  
  fillers: '#10B981',      // emerald-500
  procedure: '#F59E0B'     // amber-500
}

// Status styling modifiers
const statusStyles = {
  scheduled: { opacity: 0.7, borderStyle: 'dashed' },
  confirmed: { opacity: 1, borderStyle: 'solid' },
  'in-progress': { opacity: 1, borderStyle: 'solid', animation: 'pulse 2s infinite' },
  completed: { opacity: 0.6, filter: 'grayscale(0.3)' },
  cancelled: { opacity: 0.4, textDecoration: 'line-through' },
  'no-show': { opacity: 0.3, filter: 'grayscale(0.8)' }
}

// Brazilian Portuguese messages
const messages = {
  date: 'Data',
  time: 'Horário',
  event: 'Consulta',
  allDay: 'Dia Todo',
  week: 'Semana',
  work_week: 'Semana Útil',
  day: 'Dia',
  month: 'Mês',
  previous: 'Anterior',
  next: 'Próximo',
  yesterday: 'Ontem',
  tomorrow: 'Amanhã',
  today: 'Hoje',
  agenda: 'Agenda',
  noEventsInRange: 'Não há consultas neste período.',
  showMore: (total: number) => `+${total} mais`,
}

// Brazilian date formats
const formats = {
  dayFormat: 'dddd',
  dayRangeHeaderFormat: ({ start, end }: { start: Date; end: Date }) =>
    `${moment(start).format('DD/MM')} - ${moment(end).format('DD/MM/YYYY')}`,
  dayHeaderFormat: 'dddd, DD/MM',
  monthHeaderFormat: 'MMMM YYYY',
  agendaDateFormat: 'DD/MM/YYYY',
  agendaTimeFormat: 'HH:mm',
  agendaTimeRangeFormat: ({ start, end }: { start: Date; end: Date }) =>
    `${moment(start).format('HH:mm')} - ${moment(end).format('HH:mm')}`,
  timeGutterFormat: 'HH:mm',
  selectRangeFormat: ({ start, end }: { start: Date; end: Date }) =>
    `${moment(start).format('DD/MM HH:mm')} - ${moment(end).format('DD/MM HH:mm')}`,
}

export function AppointmentCalendar({
  appointments,
  professionals,
  view,
  date,
  onViewChange,
  onDateChange,
  onAppointmentDrop,
  onAppointmentResize,
  onAppointmentSelect,
  onSlotSelect
}: AppointmentCalendarProps) {
  
  // Convert appointments to calendar events
  const calendarEvents = useMemo(() => {
    return appointments.map(appointment => ({
      ...appointment,
      resource: appointment.professionalId
    }))
  }, [appointments])

  // Professional resources for resource view
  const resources = useMemo(() => {
    return professionals.map(prof => ({
      resourceId: prof.id,
      resourceTitle: prof.name
    }))
  }, [professionals])

  // Event style getter for color coding
  const eventStyleGetter = useCallback((event: AppointmentEvent) => {
    const baseColor = serviceColors[event.serviceType] || '#6B7280'
    const statusStyle = statusStyles[event.status] || {}
    
    return {
      style: {
        backgroundColor: baseColor,
        borderColor: baseColor,
        color: 'white',
        border: '2px solid',
        borderRadius: '6px',
        fontSize: '12px',
        fontWeight: '500',
        ...statusStyle
      }
    }
  }, [])

  // Slot style getter for time slots
  const slotStyleGetter = useCallback((date: Date) => {
    const hour = date.getHours()
    const isBusinessHours = hour >= 8 && hour < 18
    const isLunchTime = hour >= 12 && hour < 14
    
    const style: React.CSSProperties = {}
    
    if (!isBusinessHours) {
      style.backgroundColor = '#F3F4F6' // gray-100
      style.cursor = 'not-allowed'
    } else if (isLunchTime) {
      style.backgroundColor = '#FEF3C7' // amber-100
    }
    
    return { style }
  }, [])

  // Day prop getter for date cells
  const dayPropGetter = useCallback((date: Date) => {
    const isWeekend = date.getDay() === 0 || date.getDay() === 6
    const isToday = moment(date).isSame(moment(), 'day')
    
    let className = ''
    const style: React.CSSProperties = {}
    
    if (isWeekend) {
      className += ' weekend-day'
      style.backgroundColor = '#F9FAFB' // gray-50
    }
    
    if (isToday) {
      className += ' today'
      style.backgroundColor = '#EFF6FF' // blue-50
      style.fontWeight = 'bold'
    }
    
    return { className: className.trim(), style }
  }, [])

  // Handle event drop (drag and drop)
  const handleEventDrop = useCallback(({ event, start, end }: any) => {
    onAppointmentDrop(event, start, end)
  }, [onAppointmentDrop])

  // Handle event resize
  const handleEventResize = useCallback(({ event, start, end }: any) => {
    onAppointmentResize(event, start, end)
  }, [onAppointmentResize])

  // Handle event selection
  const handleSelectEvent = useCallback((event: AppointmentEvent) => {
    onAppointmentSelect(event)
  }, [onAppointmentSelect])

  // Handle slot selection
  const handleSelectSlot = useCallback((slotInfo: any) => {
    // Only allow booking during business hours
    const hour = slotInfo.start.getHours()
    const isBusinessHours = hour >= 8 && hour < 18
    
    if (isBusinessHours) {
      onSlotSelect(slotInfo)
    }
  }, [onSlotSelect])

  // Custom components
  const components = useMemo(() => ({
    event: AppointmentSlot,
    toolbar: (props: any) => (
      <div className="flex items-center justify-between mb-4 p-4 bg-muted/50 rounded-lg">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => props.onNavigate('PREV')}
            className="px-3 py-1 text-sm bg-background hover:bg-muted rounded border"
          >
            ← {messages.previous}
          </button>
          <button
            onClick={() => props.onNavigate('TODAY')}
            className="px-3 py-1 text-sm bg-primary text-primary-foreground hover:bg-primary/90 rounded"
          >
            {messages.today}
          </button>
          <button
            onClick={() => props.onNavigate('NEXT')}
            className="px-3 py-1 text-sm bg-background hover:bg-muted rounded border"
          >
            {messages.next} →
          </button>
        </div>
        
        <h3 className="text-lg font-semibold">
          {props.label}
        </h3>
        
        <div className="flex items-center space-x-1">
          {[
            { key: 'month', label: messages.month },
            { key: 'week', label: messages.week },
            { key: 'day', label: messages.day },
            { key: 'agenda', label: messages.agenda }
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => props.onView(key)}
              className={cn(
                'px-3 py-1 text-sm rounded border',
                props.view === key
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-background hover:bg-muted'
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    )
  }), [])

  return (
    <div className="h-[600px] w-full">
      <style jsx global>{`
        .rbc-calendar {
          font-family: inherit;
        }
        
        .rbc-time-view .rbc-time-gutter {
          font-size: 12px;
        }
        
        .rbc-time-slot {
          border-bottom: 1px solid #e5e7eb;
        }
        
        .rbc-day-slot .rbc-time-slot {
          border-bottom: 1px solid #f3f4f6;
        }
        
        .rbc-current-time-indicator {
          background-color: #ef4444;
          height: 2px;
        }
        
        .rbc-time-header {
          border-bottom: 2px solid #e5e7eb;
        }
        
        .rbc-header {
          font-weight: 600;
          padding: 8px;
          background-color: #f9fafb;
        }
        
        .weekend-day {
          background-color: #f9fafb;
        }
        
        .today {
          background-color: #eff6ff !important;
        }
        
        .rbc-event {
          outline: none;
        }
        
        .rbc-event:focus {
          outline: 2px solid #3b82f6;
          outline-offset: 2px;
        }
        
        .rbc-time-slot:hover {
          background-color: #f0f9ff;
        }
        
        .rbc-day-bg:hover {
          background-color: #f0f9ff;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>
      
      <DnDCalendar
        localizer={localizer}
        events={calendarEvents}
        resources={view === 'day' ? resources : undefined}
        resourceIdAccessor="resourceId"
        resourceTitleAccessor="resourceTitle"
        startAccessor="start"
        endAccessor="end"
        titleAccessor="title"
        view={view as View}
        date={date}
        onView={(newView) => onViewChange(newView as any)}
        onNavigate={onDateChange}
        onEventDrop={handleEventDrop}
        onEventResize={handleEventResize}
        onSelectEvent={handleSelectEvent}
        onSelectSlot={handleSelectSlot}
        selectable
        resizable
        draggableAccessor={() => true}
        eventPropGetter={eventStyleGetter}
        slotPropGetter={slotStyleGetter}
        dayPropGetter={dayPropGetter}
        messages={messages}
        formats={formats}
        components={components}
        min={new Date(2024, 0, 1, 8, 0)} // 8:00 AM
        max={new Date(2024, 0, 1, 18, 0)} // 6:00 PM
        step={15} // 15-minute intervals
        timeslots={4} // 4 slots per hour (15 min each)
        showMultiDayTimes
        popup
        popupOffset={{ x: 10, y: 10 }}
        className="rbc-calendar"
      />
    </div>
  )
}