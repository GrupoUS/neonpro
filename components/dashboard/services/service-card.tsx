'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  Clock, 
  DollarSign, 
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Tag
} from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
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

interface ServiceCardProps {
  service: Service
}

export function ServiceCard({ service }: ServiceCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount)
  }

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}min`
    }
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`
  }

  const formatDate = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), {
      addSuffix: true,
      locale: ptBR
    })
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
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-2">
          <div>
            <h3 className="font-semibold text-sm">{service.name}</h3>
            <div className="flex items-center space-x-2 mt-1">
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
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/servicos/${service.id}`}>
                <Eye className="mr-2 h-4 w-4" />
                Ver detalhes
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/servicos/${service.id}/editar`}>
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
      
      <CardContent className="space-y-3">
        {service.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {service.description}
          </p>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="mr-1 h-4 w-4" />
            {formatDuration(service.duration_minutes)}
          </div>
          
          <div className="flex items-center text-sm font-semibold text-green-600">
            <DollarSign className="mr-1 h-4 w-4" />
            {formatCurrency(service.price)}
          </div>
        </div>
        
        <div className="text-xs text-muted-foreground">
          Atualizado {formatDate(service.updated_at)}
        </div>
      </CardContent>
    </Card>
  )
}
