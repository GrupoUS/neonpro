import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Calendar,
  Clock,
  User,
  Plus,
  FileText
} from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface ServiceAppointmentsProps {
  serviceId: string
}

export async function ServiceAppointments({ serviceId }: ServiceAppointmentsProps) {
  const supabase = createClient()
  
  // Verificar autenticação
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return <div>Acesso negado</div>
  }

  // Buscar agendamentos do serviço
  const { data: appointments, error } = await supabase
    .from('appointments')
    .select(`
      id,
      start_time,
      end_time,
      status,
      notes,
      price_at_booking,
      created_at,
      clients (
        id,
        full_name
      ),
      professionals (
        id,
        name
      )
    `)
    .eq('service_id', serviceId)
    .eq('user_id', user.id)
    .order('start_time', { ascending: false })
    .limit(10)

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-sm text-red-600">
            Erro ao carregar agendamentos: {error.message}
          </p>
        </CardContent>
      </Card>
    )
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
    return format(new Date(dateString), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center">
            <Calendar className="mr-2 h-5 w-5" />
            Histórico de Agendamentos
          </CardTitle>
          <Link href={`/dashboard/agendamentos/novo?servico=${serviceId}`}>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Novo Agendamento
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {!appointments || appointments.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900">
              Nenhum agendamento
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Este serviço ainda não possui agendamentos.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((appointment: any) => (
              <div
                key={appointment.id}
                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-medium">
                        {appointment.clients?.full_name || 'Cliente não especificado'}
                      </h4>
                      {getStatusBadge(appointment.status)}
                    </div>
                    
                    <div className="flex items-center text-sm text-muted-foreground space-x-4">
                      <div className="flex items-center">
                        <Clock className="mr-1 h-4 w-4" />
                        {formatDateTime(appointment.start_time)}
                      </div>
                      
                      {appointment.professionals?.name && (
                        <div className="flex items-center">
                          <User className="mr-1 h-4 w-4" />
                          {appointment.professionals.name}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-medium">
                      {formatCurrency(appointment.price_at_booking)}
                    </div>
                  </div>
                </div>

                {appointment.notes && (
                  <div className="flex items-start text-sm text-muted-foreground">
                    <FileText className="mr-2 h-4 w-4 mt-0.5 flex-shrink-0" />
                    <p>{appointment.notes}</p>
                  </div>
                )}
              </div>
            ))}
            
            {appointments.length === 10 && (
              <div className="text-center pt-4">
                <Link href={`/dashboard/agendamentos?servico=${serviceId}`}>
                  <Button variant="outline" size="sm">
                    Ver todos os agendamentos
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
