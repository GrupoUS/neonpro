'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { 
  Clock,
  User,
  MapPin,
  Plus,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { format, startOfDay, endOfDay, addDays, subDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import Link from 'next/link'

interface Appointment {
  id: string
  start_time: string
  end_time: string
  status: string
  notes: string | null
  clients: {
    id: string
    full_name: string
  } | null
  services: {
    id: string
    name: string
  } | null
  professionals: {
    id: string
    name: string
  } | null
}

export function AppointmentsCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadAppointments()
  }, [selectedDate])

  const loadAppointments = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const startDate = startOfDay(selectedDate)
      const endDate = endOfDay(selectedDate)

      const { data, error } = await supabase
        .from('appointments')
        .select(`
          id,
          start_time,
          end_time,
          status,
          notes,
          clients (
            id,
            full_name
          ),
          services (
            id,
            name
          ),
          professionals (
            id,
            name
          )
        `)
        .eq('user_id', user.id)
        .gte('start_time', startDate.toISOString())
        .lte('start_time', endDate.toISOString())
        .order('start_time')

      if (error) {
        console.error('Erro ao carregar agendamentos:', error)
        return
      }

      setAppointments(data || [])
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: any; label: string; color: string }> = {
      'scheduled': { variant: 'default', label: 'Agendado', color: 'bg-blue-100 text-blue-800' },
      'confirmed': { variant: 'default', label: 'Confirmado', color: 'bg-green-100 text-green-800' },
      'completed': { variant: 'secondary', label: 'Concluído', color: 'bg-gray-100 text-gray-800' },
      'cancelled': { variant: 'destructive', label: 'Cancelado', color: 'bg-red-100 text-red-800' },
      'no_show': { variant: 'outline', label: 'Faltou', color: 'bg-orange-100 text-orange-800' },
    }
    
    const statusInfo = statusMap[status] || { variant: 'outline', label: status, color: 'bg-gray-100 text-gray-800' }
    return (
      <Badge variant={statusInfo.variant} className={statusInfo.color}>
        {statusInfo.label}
      </Badge>
    )
  }

  const formatTime = (dateString: string) => {
    return format(new Date(dateString), 'HH:mm')
  }

  const formatDate = (date: Date) => {
    return format(date, "EEEE, dd 'de' MMMM", { locale: ptBR })
  }

  const navigateDate = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setSelectedDate(subDays(selectedDate, 1))
    } else {
      setSelectedDate(addDays(selectedDate, 1))
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {/* Calendário */}
      <Card>
        <CardHeader>
          <CardTitle>Calendário</CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            className="rounded-md border"
            locale={ptBR}
          />
        </CardContent>
      </Card>

      {/* Agendamentos do dia */}
      <Card className="md:col-span-2">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="capitalize">
                {formatDate(selectedDate)}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {appointments.length} agendamento(s)
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateDate('prev')}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateDate('next')}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Link href="/dashboard/agendamentos/novo">
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Agendar
                </Button>
              </Link>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-gray-200 animate-pulse p-4 rounded-lg">
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : appointments.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">
                Nenhum agendamento
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Não há agendamentos para este dia.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-medium">
                          {appointment.services?.name || 'Serviço não especificado'}
                        </h4>
                        {getStatusBadge(appointment.status)}
                      </div>
                      
                      <div className="flex items-center text-sm text-muted-foreground space-x-4">
                        <div className="flex items-center">
                          <Clock className="mr-1 h-4 w-4" />
                          {formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}
                        </div>
                        
                        {appointment.clients?.full_name && (
                          <div className="flex items-center">
                            <User className="mr-1 h-4 w-4" />
                            {appointment.clients.full_name}
                          </div>
                        )}

                        {appointment.professionals?.name && (
                          <div className="flex items-center">
                            <MapPin className="mr-1 h-4 w-4" />
                            {appointment.professionals.name}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {appointment.notes && (
                    <p className="text-sm text-muted-foreground">
                      {appointment.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
