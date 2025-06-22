'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  User,
  Mail,
  Phone,
  Star,
  Calendar,
  FileText,
  Clock,
  TrendingUp
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Professional {
  id: string
  name: string
  email: string | null
  phone: string | null
  specialties: string | null
  commission_rate: number
  bio: string | null
  work_schedule: string | null
  is_active: boolean
  profile_photo_url: string | null
  created_at: string
  updated_at: string
}

interface ProfessionalDetailsProps {
  professional: Professional
}

export function ProfessionalDetails({ professional }: ProfessionalDetailsProps) {
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const formatCommission = (rate: number) => {
    return `${rate}%`
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {/* Informações Pessoais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="mr-2 h-5 w-5" />
            Informações Pessoais
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={professional.profile_photo_url || undefined} />
              <AvatarFallback className="text-lg">
                {getInitials(professional.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-lg">{professional.name}</h3>
              <Badge variant={professional.is_active ? "default" : "secondary"}>
                {professional.is_active ? 'Ativo' : 'Inativo'}
              </Badge>
            </div>
          </div>

          <div className="space-y-2">
            {professional.email && (
              <div className="flex items-center text-sm">
                <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                {professional.email}
              </div>
            )}
            
            {professional.phone && (
              <div className="flex items-center text-sm">
                <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                {professional.phone}
              </div>
            )}
          </div>

          {professional.bio && (
            <div>
              <h4 className="font-medium text-sm mb-2">Biografia</h4>
              <p className="text-sm text-muted-foreground">
                {professional.bio}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Especialidades e Comissão */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Star className="mr-2 h-5 w-5" />
            Especialidades
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {professional.specialties ? (
            <div>
              <h4 className="font-medium text-sm mb-2">Áreas de Atuação</h4>
              <div className="flex flex-wrap gap-2">
                {professional.specialties.split(',').map((specialty, index) => (
                  <Badge key={index} variant="outline">
                    {specialty.trim()}
                  </Badge>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Nenhuma especialidade cadastrada
            </p>
          )}

          <div className="pt-2 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Taxa de Comissão:</span>
              <span className="text-sm font-semibold text-green-600">
                {formatCommission(professional.commission_rate)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Horário de Trabalho */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="mr-2 h-5 w-5" />
            Horário de Trabalho
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {professional.work_schedule ? (
            <div>
              <p className="text-sm whitespace-pre-wrap">
                {professional.work_schedule}
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Horário de trabalho não definido
            </p>
          )}
        </CardContent>
      </Card>

      {/* Estatísticas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="mr-2 h-5 w-5" />
            Estatísticas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Agendamentos este mês:</span>
              <span className="font-semibold">0</span>
            </div>
            
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Receita gerada:</span>
              <span className="font-semibold text-green-600">R$ 0,00</span>
            </div>
            
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Avaliação média:</span>
              <span className="font-semibold">-</span>
            </div>
            
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Taxa de conversão:</span>
              <span className="font-semibold">-</span>
            </div>
          </div>

          <div className="pt-2 border-t text-xs text-muted-foreground">
            Estatísticas baseadas nos últimos 30 dias
          </div>
        </CardContent>
      </Card>

      {/* Agendamentos Recentes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="mr-2 h-5 w-5" />
            Próximos Agendamentos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <Calendar className="mx-auto h-8 w-8 text-gray-400" />
            <p className="text-sm text-muted-foreground mt-2">
              Nenhum agendamento próximo
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Informações do Sistema */}
      <Card className="md:col-span-2 lg:col-span-3">
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="mr-2 h-5 w-5" />
            Informações do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div>
              <span className="font-medium">Cadastrado em:</span>{' '}
              {formatDate(professional.created_at)}
            </div>
            <div>
              <span className="font-medium">Última atualização:</span>{' '}
              {formatDate(professional.updated_at)}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
