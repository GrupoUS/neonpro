import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  Clock,
  User,
  MapPin,
  MoreVertical,
  Edit,
  Trash2,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import Link from 'next/link'

export async function AppointmentsList() {
  const supabase = createClient()
  
  // Verificar autenticação
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return <div>Acesso negado</div>
  }

  // Buscar agendamentos recentes
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
        full_name,
        phone
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
    .order('start_time', { ascending: false })
    .limit(20)

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

  if (!appointments || appointments.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <Clock className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900">
              Nenhum agendamento
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Você ainda não possui agendamentos cadastrados.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {appointments.map((appointment: any) => (
        <Card key={appointment.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="font-semibold">
                    {appointment.services?.name || 'Serviço não especificado'}
                  </h3>
                  {getStatusBadge(appointment.status)}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Clock className="mr-2 h-4 w-4" />
                    {formatDateTime(appointment.start_time)}
                  </div>
                  
                  {appointment.clients?.full_name && (
                    <div className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      <Link 
                        href={`/dashboard/clientes/${appointment.clients.id}`}
                        className="hover:underline"
                      >
                        {appointment.clients.full_name}
                      </Link>
                    </div>
                  )}

                  {appointment.professionals?.name && (
                    <div className="flex items-center">
                      <MapPin className="mr-2 h-4 w-4" />
                      {appointment.professionals.name}
                    </div>
                  )}
                </div>

                {appointment.notes && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {appointment.notes}
                  </p>
                )}
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="font-semibold">
                    {formatCurrency(appointment.price_at_booking)}
                  </div>
                  {appointment.clients?.phone && (
                    <div className="text-sm text-muted-foreground">
                      {appointment.clients.phone}
                    </div>
                  )}
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/agendamentos/${appointment.id}/editar`}>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </Link>
                    </DropdownMenuItem>
                    
                    {appointment.status === 'scheduled' && (
                      <DropdownMenuItem>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Confirmar
                      </DropdownMenuItem>
                    )}
                    
                    {appointment.status !== 'completed' && appointment.status !== 'cancelled' && (
                      <DropdownMenuItem>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Marcar como concluído
                      </DropdownMenuItem>
                    )}
                    
                    {appointment.status !== 'cancelled' && (
                      <DropdownMenuItem className="text-red-600">
                        <XCircle className="mr-2 h-4 w-4" />
                        Cancelar
                      </DropdownMenuItem>
                    )}
                    
                    <DropdownMenuItem className="text-red-600">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
