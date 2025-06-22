'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Settings,
  Clock,
  DollarSign,
  Tag,
  Calendar,
  FileText,
  TrendingUp
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Service {
  id: string
  name: string
  description: string | null
  duration_minutes: number
  price: number
  category: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

interface ServiceDetailsProps {
  service: Service
}

export function ServiceDetails({ service }: ServiceDetailsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount)
  }

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} minutos`
    }
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours} hora${hours > 1 ? 's' : ''}`
  }

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
  }

  const getCategoryLabel = (category: string | null) => {
    const categories: Record<string, string> = {
      'facial': 'Facial',
      'corporal': 'Corporal',
      'estetica': 'Estética',
      'massagem': 'Massagem',
      'depilacao': 'Depilação',
      'outros': 'Outros'
    }
    return category ? categories[category] || category : 'Sem categoria'
  }

  const getCategoryColor = (category: string | null) => {
    const colors: Record<string, string> = {
      'facial': 'bg-pink-100 text-pink-800',
      'corporal': 'bg-blue-100 text-blue-800',
      'estetica': 'bg-purple-100 text-purple-800',
      'massagem': 'bg-green-100 text-green-800',
      'depilacao': 'bg-orange-100 text-orange-800',
      'outros': 'bg-gray-100 text-gray-800'
    }
    return category ? colors[category] || 'bg-gray-100 text-gray-800' : 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {/* Informações Básicas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="mr-2 h-5 w-5" />
            Informações Básicas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold text-lg mb-2">{service.name}</h3>
            <div className="flex items-center space-x-2 mb-3">
              <Badge 
                variant="secondary" 
                className={getCategoryColor(service.category)}
              >
                <Tag className="mr-1 h-3 w-3" />
                {getCategoryLabel(service.category)}
              </Badge>
              <Badge variant={service.is_active ? "default" : "secondary"}>
                {service.is_active ? 'Ativo' : 'Inativo'}
              </Badge>
            </div>
          </div>

          {service.description && (
            <div>
              <h4 className="font-medium text-sm mb-2">Descrição</h4>
              <p className="text-sm text-muted-foreground">
                {service.description}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Duração e Preço */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="mr-2 h-5 w-5" />
            Duração e Preço
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center text-sm">
              <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Duração:</span>
              <span className="ml-2">{formatDuration(service.duration_minutes)}</span>
            </div>
            
            <div className="flex items-center text-sm">
              <DollarSign className="mr-2 h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Preço:</span>
              <span className="ml-2 font-semibold text-green-600">
                {formatCurrency(service.price)}
              </span>
            </div>
          </div>

          <div className="pt-2 border-t">
            <div className="text-sm text-muted-foreground">
              <span className="font-medium">Valor por hora:</span>
              <span className="ml-2">
                {formatCurrency((service.price / service.duration_minutes) * 60)}
              </span>
            </div>
          </div>
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
          </div>

          <div className="pt-2 border-t text-xs text-muted-foreground">
            Estatísticas baseadas nos últimos 30 dias
          </div>
        </CardContent>
      </Card>

      {/* Informações do Sistema */}
      <Card className="md:col-span-2 lg:col-span-3">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="mr-2 h-5 w-5" />
            Informações do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div>
              <span className="font-medium">Criado em:</span>{' '}
              {formatDate(service.created_at)}
            </div>
            <div>
              <span className="font-medium">Última atualização:</span>{' '}
              {formatDate(service.updated_at)}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
