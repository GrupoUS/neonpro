'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  User, 
  Mail, 
  Phone, 
  Calendar,
  Heart,
  AlertTriangle,
  Users,
  MessageSquare,
  Globe
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Client {
  id: string
  full_name: string
  email: string | null
  phone: string | null
  birthdate: string | null
  allergies: string | null
  medical_conditions: string | null
  emergency_contact_name: string | null
  emergency_contact_phone: string | null
  notes: string | null
  consent_marketing: boolean | null
  preferred_language: string | null
  profile_photo_url: string | null
  created_at: string
  updated_at: string
}

interface ClientDetailsProps {
  client: Client
}

export function ClientDetails({ client }: ClientDetailsProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const calculateAge = (birthdate: string) => {
    const today = new Date()
    const birth = new Date(birthdate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    
    return age
  }

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
  }

  const getLanguageName = (code: string) => {
    const languages: Record<string, string> = {
      'pt-BR': 'Português (Brasil)',
      'en': 'English',
      'es': 'Español'
    }
    return languages[code] || code
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {/* Informações Básicas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="mr-2 h-5 w-5" />
            Informações Básicas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={client.profile_photo_url || ''} />
              <AvatarFallback className="text-lg">
                {getInitials(client.full_name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-lg">{client.full_name}</h3>
              {client.birthdate && (
                <Badge variant="secondary">
                  {calculateAge(client.birthdate)} anos
                </Badge>
              )}
            </div>
          </div>

          <div className="space-y-2">
            {client.email && (
              <div className="flex items-center text-sm">
                <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                {client.email}
              </div>
            )}
            
            {client.phone && (
              <div className="flex items-center text-sm">
                <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                {client.phone}
              </div>
            )}
            
            {client.birthdate && (
              <div className="flex items-center text-sm">
                <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                {formatDate(client.birthdate)}
              </div>
            )}

            {client.preferred_language && (
              <div className="flex items-center text-sm">
                <Globe className="mr-2 h-4 w-4 text-muted-foreground" />
                {getLanguageName(client.preferred_language)}
              </div>
            )}
          </div>

          <div className="pt-2">
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="mr-2 h-4 w-4" />
              Cadastrado em {formatDate(client.created_at)}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informações Médicas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Heart className="mr-2 h-5 w-5" />
            Informações Médicas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {client.allergies && (
            <div>
              <div className="flex items-center mb-2">
                <AlertTriangle className="mr-2 h-4 w-4 text-orange-500" />
                <span className="font-medium text-sm">Alergias</span>
              </div>
              <p className="text-sm text-muted-foreground pl-6">
                {client.allergies}
              </p>
            </div>
          )}

          {client.medical_conditions && (
            <div>
              <div className="flex items-center mb-2">
                <Heart className="mr-2 h-4 w-4 text-red-500" />
                <span className="font-medium text-sm">Condições Médicas</span>
              </div>
              <p className="text-sm text-muted-foreground pl-6">
                {client.medical_conditions}
              </p>
            </div>
          )}

          {!client.allergies && !client.medical_conditions && (
            <p className="text-sm text-muted-foreground">
              Nenhuma informação médica registrada.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Contato de Emergência */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="mr-2 h-5 w-5" />
            Contato de Emergência
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {client.emergency_contact_name || client.emergency_contact_phone ? (
            <div className="space-y-2">
              {client.emergency_contact_name && (
                <div className="flex items-center text-sm">
                  <User className="mr-2 h-4 w-4 text-muted-foreground" />
                  {client.emergency_contact_name}
                </div>
              )}
              
              {client.emergency_contact_phone && (
                <div className="flex items-center text-sm">
                  <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                  {client.emergency_contact_phone}
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Nenhum contato de emergência registrado.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Observações e Preferências */}
      {(client.notes || client.consent_marketing !== null) && (
        <Card className="md:col-span-2 lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageSquare className="mr-2 h-5 w-5" />
              Observações e Preferências
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {client.notes && (
              <div>
                <h4 className="font-medium text-sm mb-2">Observações</h4>
                <p className="text-sm text-muted-foreground">
                  {client.notes}
                </p>
              </div>
            )}

            {client.consent_marketing !== null && (
              <div>
                <h4 className="font-medium text-sm mb-2">Preferências de Marketing</h4>
                <Badge variant={client.consent_marketing ? "default" : "secondary"}>
                  {client.consent_marketing 
                    ? "Aceita comunicações de marketing" 
                    : "Não aceita comunicações de marketing"
                  }
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
