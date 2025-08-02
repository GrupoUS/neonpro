'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { Metadata } from 'next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CalendarDays, Clock, Users, Plus, Filter, Settings } from 'lucide-react'
import { AppointmentCalendar } from '@/components/appointments/appointment-calendar'
import { CalendarViews } from '@/components/appointments/calendar-views'
import { QuickBookingModal } from '@/components/appointments/quick-booking-modal'
import { CalendarFilters } from '@/components/appointments/calendar-filters'
import { ProfessionalSchedule } from '@/components/appointments/professional-schedule'
import { ScheduleConflictResolver } from '@/components/appointments/schedule-conflict-resolver'

// Types for appointment management
export interface AppointmentEvent {
  id: string
  title: string
  start: Date
  end: Date
  resource?: string
  serviceType: 'consultation' | 'botox' | 'fillers' | 'procedure'
  status: 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'no-show'
  patientId: string
  professionalId: string
  patientName: string
  professionalName: string
  notes?: string
  whatsappReminder?: boolean
  roomId?: string
  equipmentNeeded?: string[]
  phoneNumber?: string
  email?: string
}

export interface Professional {
  id: string
  name: string
  specialization: string
  color: string
  workingHours: {
    start: string
    end: string
    days: number[]
  }
  availability: boolean
}

export interface CalendarFilters {
  serviceTypes: string[]
  statuses: string[]
  professionals: string[]
  dateRange: {
    start: Date | null
    end: Date | null
  }
}

// Mock data for development - In production, this would come from your API
const mockProfessionals: Professional[] = [
  {
    id: '1',
    name: 'Dra. Maria Silva',
    specialization: 'Dermatologista',
    color: '#3B82F6',
    workingHours: { start: '08:00', end: '17:00', days: [1, 2, 3, 4, 5] },
    availability: true
  },
  {
    id: '2', 
    name: 'Dr. João Santos',
    specialization: 'Cirurgião Plástico',
    color: '#8B5CF6',
    workingHours: { start: '09:00', end: '18:00', days: [1, 2, 3, 4, 5] },
    availability: true
  }
]

const mockAppointments: AppointmentEvent[] = [
  {
    id: '1',
    title: 'Ana Costa - Consulta',
    start: new Date(2024, 0, 15, 9, 0),
    end: new Date(2024, 0, 15, 10, 0),
    serviceType: 'consultation',
    status: 'confirmed',
    patientId: 'p1',
    professionalId: '1',
    patientName: 'Ana Costa',
    professionalName: 'Dra. Maria Silva',
    resource: '1',
    phoneNumber: '(11) 99999-9999',
    whatsappReminder: true
  },
  {
    id: '2',
    title: 'Carlos Lima - Botox',
    start: new Date(2024, 0, 15, 14, 0),
    end: new Date(2024, 0, 15, 15, 30),
    serviceType: 'botox',
    status: 'scheduled',
    patientId: 'p2',
    professionalId: '2',
    patientName: 'Carlos Lima',
    professionalName: 'Dr. João Santos',
    resource: '2',
    phoneNumber: '(11) 88888-8888',
    whatsappReminder: true
  }
]

export default function AppointmentsPage() {
  // State management
  const [appointments, setAppointments] = useState<AppointmentEvent[]>(mockAppointments)
  const [professionals, setProfessionals] = useState<Professional[]>(mockProfessionals)
  const [currentView, setCurrentView] = useState<'month' | 'week' | 'day' | 'agenda'>('month')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentEvent | null>(null)
  const [isQuickBookingOpen, setIsQuickBookingOpen] = useState(false)
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)
  const [isProfessionalScheduleOpen, setIsProfessionalScheduleOpen] = useState(false)
  const [conflicts, setConflicts] = useState<AppointmentEvent[]>([])
  const [filters, setFilters] = useState<CalendarFilters>({
    serviceTypes: [],
    statuses: [],
    professionals: [],
    dateRange: { start: null, end: null }
  })

  // Filter appointments based on current filters
  const filteredAppointments = useMemo(() => {
    return appointments.filter(appointment => {
      if (filters.serviceTypes.length > 0 && !filters.serviceTypes.includes(appointment.serviceType)) {
        return false
      }
      if (filters.statuses.length > 0 && !filters.statuses.includes(appointment.status)) {
        return false
      }
      if (filters.professionals.length > 0 && !filters.professionals.includes(appointment.professionalId)) {
        return false
      }
      if (filters.dateRange.start && appointment.start < filters.dateRange.start) {
        return false
      }
      if (filters.dateRange.end && appointment.start > filters.dateRange.end) {
        return false
      }
      return true
    })
  }, [appointments, filters])

  // Statistics calculations
  const stats = useMemo(() => {
    const today = new Date()
    const todayAppointments = filteredAppointments.filter(apt => 
      apt.start.toDateString() === today.toDateString()
    )
    
    return {
      total: filteredAppointments.length,
      today: todayAppointments.length,
      confirmed: filteredAppointments.filter(apt => apt.status === 'confirmed').length,
      professionals: professionals.filter(p => p.availability).length
    }
  }, [filteredAppointments, professionals])

  // Conflict detection
  const detectConflicts = (newAppointment: AppointmentEvent, existingAppointments: AppointmentEvent[]) => {
    return existingAppointments.filter(existing => {
      if (existing.id === newAppointment.id) return false
      if (existing.professionalId !== newAppointment.professionalId) return false
      
      const newStart = new Date(newAppointment.start)
      const newEnd = new Date(newAppointment.end)
      const existingStart = new Date(existing.start)
      const existingEnd = new Date(existing.end)
      
      return (newStart < existingEnd && newEnd > existingStart)
    })
  }

  // Handle appointment operations
  const handleAppointmentDrop = (event: AppointmentEvent, start: Date, end: Date) => {
    const updatedAppointment = { ...event, start, end }
    const potentialConflicts = detectConflicts(updatedAppointment, appointments)
    
    if (potentialConflicts.length > 0) {
      setConflicts([updatedAppointment, ...potentialConflicts])
      return
    }
    
    setAppointments(prev => prev.map(apt => 
      apt.id === event.id ? updatedAppointment : apt
    ))
  }

  const handleAppointmentResize = (event: AppointmentEvent, start: Date, end: Date) => {
    handleAppointmentDrop(event, start, end)
  }

  const handleNewAppointment = (appointmentData: Partial<AppointmentEvent>) => {
    const newAppointment: AppointmentEvent = {
      id: Date.now().toString(),
      title: `${appointmentData.patientName} - ${appointmentData.serviceType}`,
      start: appointmentData.start!,
      end: appointmentData.end!,
      serviceType: appointmentData.serviceType!,
      status: 'scheduled',
      patientId: appointmentData.patientId!,
      professionalId: appointmentData.professionalId!,
      patientName: appointmentData.patientName!,
      professionalName: professionals.find(p => p.id === appointmentData.professionalId)?.name || '',
      resource: appointmentData.professionalId!,
      whatsappReminder: appointmentData.whatsappReminder || false,
      ...appointmentData
    }

    const potentialConflicts = detectConflicts(newAppointment, appointments)
    
    if (potentialConflicts.length > 0) {
      setConflicts([newAppointment, ...potentialConflicts])
      return
    }

    setAppointments(prev => [...prev, newAppointment])
    setIsQuickBookingOpen(false)
  }

  const handleConflictResolution = (resolvedAppointments: AppointmentEvent[]) => {
    setAppointments(prev => {
      const updatedAppointments = [...prev]
      resolvedAppointments.forEach(resolved => {
        const index = updatedAppointments.findIndex(apt => apt.id === resolved.id)
        if (index >= 0) {
          updatedAppointments[index] = resolved
        } else {
          updatedAppointments.push(resolved)
        }
      })
      return updatedAppointments
    })
    setConflicts([])
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-6 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Agenda de Consultas</h2>
          <p className="text-muted-foreground">
            Gerencie agendamentos, horários e disponibilidade profissional
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsFiltersOpen(true)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
          <Button
            variant="outline"
            size="sm" 
            onClick={() => setIsProfessionalScheduleOpen(true)}
          >
            <Settings className="h-4 w-4 mr-2" />
            Agenda Profissional
          </Button>
          <Button
            onClick={() => setIsQuickBookingOpen(true)}
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nova Consulta
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Consultas</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {filters.serviceTypes.length > 0 ? 'filtradas' : 'no período atual'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hoje</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.today}</div>
            <p className="text-xs text-muted-foreground">
              consultas agendadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confirmadas</CardTitle>
            <Badge variant="secondary" className="h-4 w-4 p-0" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.confirmed}</div>
            <p className="text-xs text-muted-foreground">
              aguardando atendimento
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profissionais</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.professionals}</div>
            <p className="text-xs text-muted-foreground">
              disponíveis hoje
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Calendar Views and Main Calendar */}
      <Card className="col-span-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Agenda</CardTitle>
            <CalendarViews
              currentView={currentView}
              onViewChange={setCurrentView}
              currentDate={currentDate}
              onDateChange={setCurrentDate}
            />
          </div>
        </CardHeader>
        <CardContent>
          <AppointmentCalendar
            appointments={filteredAppointments}
            professionals={professionals}
            view={currentView}
            date={currentDate}
            onViewChange={setCurrentView}
            onDateChange={setCurrentDate}
            onAppointmentDrop={handleAppointmentDrop}
            onAppointmentResize={handleAppointmentResize}
            onAppointmentSelect={setSelectedAppointment}
            onSlotSelect={(slotInfo) => {
              // Pre-fill quick booking with selected slot
              setIsQuickBookingOpen(true)
            }}
          />
        </CardContent>
      </Card>

      {/* Modals and Dialogs */}
      <QuickBookingModal
        isOpen={isQuickBookingOpen}
        onClose={() => setIsQuickBookingOpen(false)}
        onSubmit={handleNewAppointment}
        professionals={professionals}
        selectedDate={currentDate}
      />

      <CalendarFilters
        isOpen={isFiltersOpen}
        onClose={() => setIsFiltersOpen(false)}
        filters={filters}
        onFiltersChange={setFilters}
        professionals={professionals}
      />

      <ProfessionalSchedule
        isOpen={isProfessionalScheduleOpen}
        onClose={() => setIsProfessionalScheduleOpen(false)}
        professionals={professionals}
        onProfessionalsUpdate={setProfessionals}
      />

      <ScheduleConflictResolver
        conflicts={conflicts}
        isOpen={conflicts.length > 0}
        onResolve={handleConflictResolution}
        onCancel={() => setConflicts([])}
        professionals={professionals}
      />
    </div>
  )
}