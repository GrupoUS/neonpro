'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Calendar,
  Clock,
  User,
  MapPin,
  DollarSign,
  FileText,
  Phone,
  Mail,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import Link from 'next/link'

interface Appointment {
  id: string
  start_time: string
  end_time: string
  status: string
  notes: string | null
  price_at_booking: number
  created_at: string
  updated_at: string
  clients: {
    id: string
    full_name: string
    email: string | null
    phone: string | null
  } | null
  services: {
    id: string
    name: string
    duration_minutes: number
    price: number
  } | null
  professionals: {
    id: string
    name: string
    email: string | null
  } | null
}

interface AppointmentDetailsProps {
  appointment: Appointment
}

export function AppointmentDetails({ appointment }: AppointmentDetailsProps) {
  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: any; label: string; icon: any; color: string }> = {
      'scheduled': { 
        variant: 'default', 
        label: 'Agendado', 
        icon: Clock,
        color: 'bg-blue-100 text-blue-800' 
      },
      'confirmed': { 
        variant: 'default', 
        label: 'Confirmado', 
        icon: CheckCircle,
        color: 'bg-green-100 text-green-800' 
      },
      'completed': { 
        variant: 'secondary', 
        label: 'Concluído', 
        icon: CheckCircle,
        color: 'bg-gray-100 text-gray-800' 
      },
      'cancelled': { 
        variant: 'destructive', 
        label: 'Cancelado', 
        icon: XCircle,
        color: 'bg-red-100 text-red-800' 
      },
      'no_show': { 
        variant: 'outline', 
        label: 'Faltou', 
        icon: AlertCircle,
        color: 'bg-orange-100 text-orange-800' 
      },
    }
    
    const statusInfo = statusMap[status] || { 
      variant: 'outline', 
      label: status, 
      icon: Clock,
      color: 'bg-gray-100 text-gray-800' 
    }
    
    const IconComponent = statusInfo.icon
    
    return (
      <Badge variant={statusInfo.variant} className={`${statusInfo.color} flex items-center`}>
        <IconComponent className="mr-1 h-3 w-3" />
        {statusInfo.label}
      </Badge>
    )
  }

  const formatDateTime = (dateString: string) => {
    return format(new Date(dateString), "EEEE, dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })
  }

  const formatTime = (dateString: string) => {
    return format(new Date(dateString), 'HH:mm')
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount)
  }

  const calculateDuration = () => {
    const start = new Date(appointment.start_time)
    const end = new Date(appointment.end_time)
    const diffMinutes = Math.round((end.getTime() - start.getTime()) / (1000 * 60))
    return `${diffMinutes} minutos`
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {/* Informações do Agendamento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="mr-2 h-5 w-5" />
            Informações do Agendamento
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div>
              <h3 className="font-semibold text-lg mb-2">
                {appointment.services?.name || 'Serviço não especificado'}
              </h3>
              {getStatusBadge(appointment.status)}
            </div>

            <div className="space-y-2">
              <div className="flex items-center text-sm">
                <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                {formatDateTime(appointment.start_time)}
              </div>
              
              <div className="flex items-center text-sm">
                <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                {formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}
                <span className="ml-2 text-muted-foreground">
                  ({calculateDuration()})
                </span>
              </div>

              <div className="flex items-center text-sm">
                <DollarSign className="mr-2 h-4 w-4 text-muted-foreground" />
                {formatCurrency(appointment.price_at_booking)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informações do Cliente */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="mr-2 h-5 w-5" />
            Cliente
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {appointment.clients ? (
            <div className="space-y-3">
              <div>
                <Link 
                  href={`/dashboard/clientes/${appointment.clients.id}`}
                  className="font-semibold text-lg hover:underline"
                >
                  {appointment.clients.full_name}
                </Link>
              </div>

              <div className="space-y-2">
                {appointment.clients.email && (
                  <div className="flex items-center text-sm">
                    <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                    {appointment.clients.email}
                  </div>
                )}
                
                {appointment.clients.phone && (
                  <div className="flex items-center text-sm">
                    <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                    {appointment.clients.phone}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Cliente não especificado
            </p>
          )}
        </CardContent>
      </Card>

      {/* Informações do Profissional */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="mr-2 h-5 w-5" />
            Profissional
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {appointment.professionals ? (
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-lg">
                  {appointment.professionals.name}
                </h3>
              </div>

              <div className="space-y-2">
                {appointment.professionals.email && (
                  <div className="flex items-center text-sm">
                    <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                    {appointment.professionals.email}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Profissional não especificado
            </p>
          )}
        </CardContent>
      </Card>

      {/* Observações */}
      {appointment.notes && (
        <Card className="md:col-span-2 lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              Observações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {appointment.notes}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Informações do Sistema */}
      <Card className="md:col-span-2 lg:col-span-3">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="mr-2 h-5 w-5" />
            Informações do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div>
              <span className="font-medium">Criado em:</span>{' '}
              {format(new Date(appointment.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
            </div>
            <div>
              <span className="font-medium">Última atualização:</span>{' '}
              {format(new Date(appointment.updated_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
