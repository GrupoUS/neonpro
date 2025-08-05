'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns'
import { pt } from 'date-fns/locale'

export interface Appointment {
  id: string
  patient_id: string
  professional_id: string
  service_id: string
  time_slot_id: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show' | 'rescheduled'
  notes?: string
  created_at: string
  updated_at: string
  
  // Relations
  patient: {
    id: string
    name: string
    email: string
    phone?: string
  }
  professional: {
    id: string
    name: string
    specialty: string
  }
  service: {
    id: string
    name: string
    duration: number
    price: number
  }
  time_slot: {
    id: string
    date: string
    start_time: string
    end_time: string
  }
}

export interface AppointmentFilters {
  dateRange: 'today' | 'week' | 'month' | 'custom'
  startDate?: Date
  endDate?: Date
  professionalId?: string
  status?: Appointment['status']
  patientName?: string
}

export interface AppointmentStats {
  total: number
  confirmed: number
  pending: number
  cancelled: number
  completed: number
  noShow: number
  todayTotal: number
  weekTotal: number
}

export function useAppointmentsManager() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  
  const [filters, setFilters] = useState<AppointmentFilters>({
    dateRange: 'week'
  })
  
  const supabase = await createClient()
  const { toast } = useToast()

  // Calculate date ranges based on filters
  const dateRange = useMemo(() => {
    const now = new Date()
    
    switch (filters.dateRange) {
      case 'today':
        return { start: startOfDay(now), end: endOfDay(now) }
      case 'week':
        return { start: startOfWeek(now, { locale: pt }), end: endOfWeek(now, { locale: pt }) }
      case 'month':
        return { start: startOfMonth(now), end: endOfMonth(now) }
      case 'custom':
        return { 
          start: filters.startDate || startOfDay(now), 
          end: filters.endDate || endOfDay(now) 
        }
      default:
        return { start: startOfWeek(now, { locale: pt }), end: endOfWeek(now, { locale: pt }) }
    }
  }, [filters.dateRange, filters.startDate, filters.endDate])

  // Fetch appointments from database
  const fetchAppointments = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      let query = supabase
        .from('appointments')
        .select(`
          *,
          patient:profiles!appointments_patient_id_fkey(
            id,
            name:full_name,
            email,
            phone
          ),
          professional:professionals(
            id,
            name,
            specialty
          ),
          service:services(
            id,
            name,
            duration,
            price
          ),
          time_slot:time_slots(
            id,
            date,
            start_time,
            end_time
          )
        `)
        .gte('time_slot.date', format(dateRange.start, 'yyyy-MM-dd'))
        .lte('time_slot.date', format(dateRange.end, 'yyyy-MM-dd'))
        .order('time_slot(date)', { ascending: true })
        .order('time_slot(start_time)', { ascending: true })

      // Apply filters
      if (filters.professionalId) {
        query = query.eq('professional_id', filters.professionalId)
      }

      if (filters.status) {
        query = query.eq('status', filters.status)
      }

      const { data, error } = await query

      if (error) {
        throw new Error(`Erro ao carregar agendamentos: ${error.message}`)
      }

      // Filter by patient name if provided
      let filteredData = data || []
      if (filters.patientName) {
        const searchTerm = filters.patientName.toLowerCase()
        filteredData = filteredData.filter(apt => 
          apt.patient?.name?.toLowerCase().includes(searchTerm)
        )
      }

      setAppointments(filteredData as Appointment[])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(errorMessage)
      console.error('Erro ao buscar agendamentos:', err)
      
      toast({
        title: 'Erro ao carregar agendamentos',
        description: errorMessage,
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }, [dateRange, filters, supabase, toast])

  // Setup real-time subscriptions
  useEffect(() => {
    fetchAppointments()

    const channel = supabase
      .channel('appointments_management')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments'
        },
        (payload) => {
          console.log('Appointment update:', payload)
          
          switch (payload.eventType) {
            case 'INSERT':
              handleAppointmentInsert(payload.new as any)
              break
            case 'UPDATE':
              handleAppointmentUpdate(payload.new as any, payload.old as any)
              break
            case 'DELETE':
              handleAppointmentDelete(payload.old as any)
              break
          }
        }
      )
      .subscribe((status) => {
        console.log('Appointments subscription status:', status)
        setIsConnected(status === 'SUBSCRIBED')
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchAppointments, supabase])

  // Real-time event handlers
  const handleAppointmentInsert = (newAppointment: any) => {
    // Fetch full appointment data with relations
    fetchAppointments()
    
    toast({
      title: 'Novo agendamento',
      description: 'Um novo agendamento foi criado',
      duration: 3000
    })
  }

  const handleAppointmentUpdate = (updatedAppointment: any, oldAppointment: any) => {
    setAppointments(prev => 
      prev.map(apt => 
        apt.id === updatedAppointment.id 
          ? { ...apt, ...updatedAppointment, updated_at: new Date().toISOString() }
          : apt
      )
    )

    // Notify about status changes
    if (oldAppointment.status !== updatedAppointment.status) {
      const statusMessages = {
        confirmed: 'Agendamento confirmado',
        cancelled: 'Agendamento cancelado',
        completed: 'Agendamento concluído',
        no_show: 'Paciente não compareceu',
        rescheduled: 'Agendamento reagendado'
      }

      toast({
        title: statusMessages[updatedAppointment.status as keyof typeof statusMessages] || 'Agendamento atualizado',
        description: `Status alterado para ${updatedAppointment.status}`,
        duration: 3000
      })
    }
  }

  const handleAppointmentDelete = (deletedAppointment: any) => {
    setAppointments(prev => 
      prev.filter(apt => apt.id !== deletedAppointment.id)
    )
    
    toast({
      title: 'Agendamento removido',
      description: 'Um agendamento foi removido do sistema',
      duration: 3000
    })
  }

  // Action functions
  const updateAppointmentStatus = useCallback(async (
    appointmentId: string, 
    newStatus: Appointment['status'],
    notes?: string
  ) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ 
          status: newStatus, 
          notes: notes || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', appointmentId)

      if (error) {
        throw new Error(`Erro ao atualizar status: ${error.message}`)
      }

      return { success: true }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      
      toast({
        title: 'Erro ao atualizar agendamento',
        description: errorMessage,
        variant: 'destructive'
      })
      
      return { success: false, error: errorMessage }
    }
  }, [supabase, toast])

  const confirmAppointment = useCallback((appointmentId: string) => {
    return updateAppointmentStatus(appointmentId, 'confirmed')
  }, [updateAppointmentStatus])

  const cancelAppointment = useCallback((appointmentId: string, reason?: string) => {
    return updateAppointmentStatus(appointmentId, 'cancelled', reason)
  }, [updateAppointmentStatus])

  const completeAppointment = useCallback((appointmentId: string, notes?: string) => {
    return updateAppointmentStatus(appointmentId, 'completed', notes)
  }, [updateAppointmentStatus])

  const markNoShow = useCallback((appointmentId: string) => {
    return updateAppointmentStatus(appointmentId, 'no_show')
  }, [updateAppointmentStatus])

  // Statistics
  const statistics = useMemo((): AppointmentStats => {
    const total = appointments.length
    const confirmed = appointments.filter(apt => apt.status === 'confirmed').length
    const pending = appointments.filter(apt => apt.status === 'pending').length
    const cancelled = appointments.filter(apt => apt.status === 'cancelled').length
    const completed = appointments.filter(apt => apt.status === 'completed').length
    const noShow = appointments.filter(apt => apt.status === 'no_show').length

    const today = format(new Date(), 'yyyy-MM-dd')
    const todayTotal = appointments.filter(apt => apt.time_slot?.date === today).length

    const weekStart = format(startOfWeek(new Date(), { locale: pt }), 'yyyy-MM-dd')
    const weekEnd = format(endOfWeek(new Date(), { locale: pt }), 'yyyy-MM-dd')
    const weekTotal = appointments.filter(apt => 
      apt.time_slot?.date >= weekStart && apt.time_slot?.date <= weekEnd
    ).length

    return {
      total,
      confirmed,
      pending,
      cancelled,
      completed,
      noShow,
      todayTotal,
      weekTotal
    }
  }, [appointments])

  // Grouped appointments
  const appointmentsByDate = useMemo(() => {
    const grouped: { [date: string]: Appointment[] } = {}
    
    appointments.forEach(appointment => {
      const date = appointment.time_slot?.date
      if (date) {
        if (!grouped[date]) {
          grouped[date] = []
        }
        grouped[date].push(appointment)
      }
    })

    // Sort appointments within each date
    Object.keys(grouped).forEach(date => {
      grouped[date].sort((a, b) => {
        const timeA = a.time_slot?.start_time || '00:00'
        const timeB = b.time_slot?.start_time || '00:00'
        return timeA.localeCompare(timeB)
      })
    })

    return grouped
  }, [appointments])

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<AppointmentFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }, [])

  const clearFilters = useCallback(() => {
    setFilters({ dateRange: 'week' })
  }, [])

  return {
    // Data
    appointments,
    appointmentsByDate,
    statistics,
    
    // State
    isLoading,
    error,
    isConnected,
    filters,
    dateRange,
    
    // Actions
    updateFilters,
    clearFilters,
    refetch: fetchAppointments,
    confirmAppointment,
    cancelAppointment,
    completeAppointment,
    markNoShow,
    updateAppointmentStatus
  }
}

