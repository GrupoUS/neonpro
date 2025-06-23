'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  UserCheck,
  Mail,
  Phone,
  MoreVertical,
  Edit,
  Eye,
  Trash2,
  Star
} from 'lucide-react'
import Link from 'next/link'
import { Alert, AlertDescription } from '@/components/ui/alert'

export function ProfessionalsList() {
  const [professionals, setProfessionals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    async function loadProfessionals() {
      try {
        const supabase = createClient()
        
        // Verificar autenticação
        const {
          data: { user: currentUser },
        } = await supabase.auth.getUser()

        if (!currentUser) {
          setError('Você precisa estar logado para ver os profissionais.')
          setLoading(false)
          return
        }

        setUser(currentUser)

        // Buscar profissionais do usuário - simplified query for mock
        const { data: professionalsData, error: professionalsError } = await supabase
          .from('professionals')
          .select('*')
          .eq('user_id', currentUser.id)

        if (professionalsError) {
          setError(`Erro ao carregar profissionais: ${professionalsError.message}`)
        } else {
          setProfessionals(professionalsData || [])
        }
      } catch (err: any) {
        setError(`Erro inesperado: ${err.message}`)
      } finally {
        setLoading(false)
      }
    }

    loadProfessionals()
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-gray-200 animate-pulse p-4 rounded-lg h-32"></div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (!user) {
    return (
      <Alert>
        <AlertDescription>
          Você precisa estar logado para ver os profissionais.
        </AlertDescription>
      </Alert>
    )
  }

  if (!professionals || professionals.length === 0) {
    return (
      <div className="text-center py-12">
        <UserCheck className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-semibold text-gray-900">Nenhum profissional</h3>
        <p className="mt-1 text-sm text-gray-500">
          Comece cadastrando o primeiro profissional da sua equipe.
        </p>
      </div>
    )
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
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {professionals.map((professional: any) => (
        <Card key={professional.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={professional.profile_photo_url} />
                <AvatarFallback>
                  {getInitials(professional.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-sm font-medium">
                  {professional.name}
                </CardTitle>
                <Badge variant={professional.is_active ? "default" : "secondary"}>
                  {professional.is_active ? 'Ativo' : 'Inativo'}
                </Badge>
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
                  <Link href={`/dashboard/profissionais/${professional.id}`}>
                    <Eye className="mr-2 h-4 w-4" />
                    Ver detalhes
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/dashboard/profissionais/${professional.id}/editar`}>
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
            {professional.specialties && (
              <div>
                <p className="text-sm font-medium mb-1">Especialidades:</p>
                <div className="flex flex-wrap gap-1">
                  {professional.specialties.split(',').map((specialty: string, index: number) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {specialty.trim()}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            <div className="space-y-1">
              {professional.email && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <Mail className="mr-2 h-4 w-4" />
                  {professional.email}
                </div>
              )}
              
              {professional.phone && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <Phone className="mr-2 h-4 w-4" />
                  {professional.phone}
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-between pt-2 border-t">
              <div className="flex items-center text-sm text-muted-foreground">
                <Star className="mr-1 h-4 w-4" />
                Comissão: {formatCommission(professional.commission_rate || 0)}
              </div>
              
              <Link href={`/dashboard/profissionais/${professional.id}`}>
                <Button variant="outline" size="sm">
                  Ver perfil
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
