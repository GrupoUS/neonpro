'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar,
  Clock,
  Plus,
  User,
  FileText
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import Link from 'next/link'

interface Appointment {
  id: string
  start_time: string
  end_time: string
  status: string
  clients: {
    id: string
    full_name: string
  } | null
  services: {
    id: string
    name: string
  } | null
}

interface ProfessionalScheduleProps {
  professionalId: string
}

export function ProfessionalSchedule({ professionalId }: ProfessionalScheduleProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadSchedule()
  }, [professionalId])

  const loadSchedule = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Buscar agendamentos dos próximos 7 dias
      const today = new Date()
      const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)

      const { data, error } = await supabase
        .from('appointments')
        .select(`
          id,
          start_time,
          end_time,
          status,
          clients (
            id,
            full_name
          ),
          services (
            id,
            name
          )
        `)
        .eq('professional_id', professionalId)
        .eq('user_id', user.id)
        .gte('start_time', today.toISOString())
        .lte('start_time', nextWeek.toISOString())
        .order('start_time')

      if (error) {
        console.error('Erro ao carregar agenda:', error)
        return
      }

      setAppointments(data || [])
    } catch (error) {
      console.error('Erro ao carregar agenda:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: any; label: string }> = {
      'scheduled': { variant: 'default', label: 'Agendado' },
      'confirmed': { variant: 'default', label: 'Confirmado' },
      'completed': { variant: 'secondary', label: 'Concluído' },
      'cancelled': { variant: 'destructive', label: 'Cancelado' },
      'no_show': { variant: 'outline', label: 'Faltou' },
    }
    
    const statusInfo = statusMap[status] || { variant: 'outline', label: status }
    return (
      <Badge variant={statusInfo.variant}>
        {statusInfo.label}
      </Badge>
    )
  }

  const formatDateTime = (dateString: string) => {
    return format(new Date(dateString), "EEEE, dd/MM 'às' HH:mm", { locale: ptBR })
  }

  const formatTime = (dateString: string) => {
    return format(new Date(dateString), 'HH:mm')
  }

  const groupAppointmentsByDate = (appointments: Appointment[]) => {
    const grouped: { [key: string]: Appointment[] } = {}
    
    appointments.forEach(appointment => {
      const date = format(new Date(appointment.start_time), 'yyyy-MM-dd')
      if (!grouped[date]) {
        grouped[date] = []
      }
      grouped[date].push(appointment)
    })
    
    return grouped
  }

  const groupedAppointments = groupAppointmentsByDate(appointments)

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
            <span className="ml-2">Carregando agenda...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header com ações */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5" />
              Agenda dos Próximos 7 Dias
            </CardTitle>
            <Link href={`/dashboard/agendamentos/novo?profissional=${professionalId}`}>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Novo Agendamento
              </Button>
            </Link>
          </div>
        </CardHeader>
      </Card>

      {/* Lista de agendamentos por data */}
      {Object.keys(groupedAppointments).length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-8">
              <Calendar className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">
                Nenhum agendamento
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Este profissional não possui agendamentos nos próximos 7 dias.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedAppointments).map(([date, dayAppointments]) => (
            <Card key={date}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">
                  {format(new Date(date), "EEEE, dd 'de' MMMM", { locale: ptBR })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dayAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center text-sm font-medium">
                          <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                          {formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {appointment.clients?.full_name && (
                            <div className="flex items-center text-sm">
                              <User className="mr-1 h-4 w-4 text-muted-foreground" />
                              <Link 
                                href={`/dashboard/clientes/${appointment.clients.id}`}
                                className="hover:underline"
                              >
                                {appointment.clients.full_name}
                              </Link>
                            </div>
                          )}
                          
                          {appointment.services?.name && (
                            <div className="flex items-center text-sm text-muted-foreground">
                              <FileText className="mr-1 h-4 w-4" />
                              {appointment.services.name}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(appointment.status)}
                        <Link href={`/dashboard/agendamentos/${appointment.id}`}>
                          <Button variant="outline" size="sm">
                            Ver detalhes
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
