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
  FileText,
  User,
  Calendar,
  MoreVertical,
  Edit,
  Eye,
  Trash2
} from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export async function MedicalRecordsList() {
  const supabase = createClient()
  
  // Verificar autenticação
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return <div>Acesso negado</div>
  }

  // Buscar prontuários do usuário
  const { data: medicalRecords, error } = await supabase
    .from('medical_records')
    .select(`
      id,
      chief_complaint,
      treatment_plan,
      status,
      created_at,
      updated_at,
      clients (
        id,
        full_name,
        email
      )
    `)
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-sm text-red-600">
            Erro ao carregar prontuários: {error.message}
          </p>
        </CardContent>
      </Card>
    )
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: any; label: string }> = {
      'active': { variant: 'default', label: 'Ativo' },
      'completed': { variant: 'secondary', label: 'Concluído' },
      'suspended': { variant: 'outline', label: 'Suspenso' },
      'cancelled': { variant: 'destructive', label: 'Cancelado' },
    }
    
    const statusInfo = statusMap[status] || { variant: 'outline', label: status }
    return (
      <Badge variant={statusInfo.variant}>
        {statusInfo.label}
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR })
  }

  if (!medicalRecords || medicalRecords.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900">
              Nenhum prontuário
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Você ainda não possui prontuários cadastrados.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {medicalRecords.map((record: any) => (
        <Card key={record.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <div>
                <CardTitle className="text-sm font-medium">
                  {record.clients?.full_name || 'Cliente não especificado'}
                </CardTitle>
                {getStatusBadge(record.status)}
              </div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/dashboard/prontuarios/${record.id}`}>
                    <Eye className="mr-2 h-4 w-4" />
                    Ver detalhes
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/dashboard/prontuarios/${record.id}/editar`}>
                    <Edit className="mr-2 h-4 w-4" />
                    Editar
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="text-red-600">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardHeader>
          
          <CardContent className="space-y-2">
            {record.chief_complaint && (
              <div>
                <p className="text-sm font-medium">Queixa Principal:</p>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {record.chief_complaint}
                </p>
              </div>
            )}
            
            {record.treatment_plan && (
              <div>
                <p className="text-sm font-medium">Plano de Tratamento:</p>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {record.treatment_plan}
                </p>
              </div>
            )}
            
            <div className="flex items-center justify-between text-sm text-muted-foreground pt-2">
              <div className="flex items-center">
                <Calendar className="mr-1 h-4 w-4" />
                {formatDate(record.created_at)}
              </div>
              
              {record.clients?.email && (
                <div className="flex items-center">
                  <User className="mr-1 h-4 w-4" />
                  <Link 
                    href={`/dashboard/clientes/${record.clients.id}`}
                    className="hover:underline"
                  >
                    Ver cliente
                  </Link>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
