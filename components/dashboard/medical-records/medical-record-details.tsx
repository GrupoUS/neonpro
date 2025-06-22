'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  User,
  FileText,
  Heart,
  Calendar,
  Pill,
  AlertTriangle,
  Users,
  Activity
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import Link from 'next/link'

interface MedicalRecord {
  id: string
  chief_complaint: string
  history_present_illness: string | null
  past_medical_history: string | null
  medications: string | null
  allergies: string | null
  social_history: string | null
  family_history: string | null
  physical_examination: string | null
  assessment: string | null
  treatment_plan: string
  status: string
  notes: string | null
  created_at: string
  updated_at: string
  clients: {
    id: string
    full_name: string
    email: string | null
    phone: string | null
    birthdate: string | null
  } | null
}

interface MedicalRecordDetailsProps {
  medicalRecord: MedicalRecord
}

export function MedicalRecordDetails({ medicalRecord }: MedicalRecordDetailsProps) {
  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: any; label: string; color: string }> = {
      'active': { variant: 'default', label: 'Ativo', color: 'bg-green-100 text-green-800' },
      'completed': { variant: 'secondary', label: 'Concluído', color: 'bg-gray-100 text-gray-800' },
      'suspended': { variant: 'outline', label: 'Suspenso', color: 'bg-yellow-100 text-yellow-800' },
      'cancelled': { variant: 'destructive', label: 'Cancelado', color: 'bg-red-100 text-red-800' },
    }
    
    const statusInfo = statusMap[status] || { variant: 'outline', label: status, color: 'bg-gray-100 text-gray-800' }
    return (
      <Badge variant={statusInfo.variant} className={statusInfo.color}>
        {statusInfo.label}
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
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

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {/* Informações do Cliente */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="mr-2 h-5 w-5" />
            Informações do Cliente
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {medicalRecord.clients ? (
            <div className="space-y-3">
              <div>
                <Link 
                  href={`/dashboard/clientes/${medicalRecord.clients.id}`}
                  className="font-semibold text-lg hover:underline"
                >
                  {medicalRecord.clients.full_name}
                </Link>
                {medicalRecord.clients.birthdate && (
                  <Badge variant="secondary" className="ml-2">
                    {calculateAge(medicalRecord.clients.birthdate)} anos
                  </Badge>
                )}
              </div>

              <div className="space-y-1">
                {medicalRecord.clients.email && (
                  <p className="text-sm text-muted-foreground">
                    📧 {medicalRecord.clients.email}
                  </p>
                )}
                
                {medicalRecord.clients.phone && (
                  <p className="text-sm text-muted-foreground">
                    📞 {medicalRecord.clients.phone}
                  </p>
                )}
              </div>

              <div className="pt-2">
                {getStatusBadge(medicalRecord.status)}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Cliente não especificado
            </p>
          )}
        </CardContent>
      </Card>

      {/* Queixa Principal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="mr-2 h-5 w-5" />
            Queixa Principal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm whitespace-pre-wrap">
            {medicalRecord.chief_complaint}
          </p>
        </CardContent>
      </Card>

      {/* Plano de Tratamento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Heart className="mr-2 h-5 w-5" />
            Plano de Tratamento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm whitespace-pre-wrap">
            {medicalRecord.treatment_plan}
          </p>
        </CardContent>
      </Card>

      {/* História da Doença Atual */}
      {medicalRecord.history_present_illness && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="mr-2 h-5 w-5" />
              História da Doença Atual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">
              {medicalRecord.history_present_illness}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Antecedentes Médicos */}
      {medicalRecord.past_medical_history && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5" />
              Antecedentes Médicos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">
              {medicalRecord.past_medical_history}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Medicamentos */}
      {medicalRecord.medications && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Pill className="mr-2 h-5 w-5" />
              Medicamentos em Uso
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">
              {medicalRecord.medications}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Alergias */}
      {medicalRecord.allergies && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5 text-orange-500" />
              Alergias
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">
              {medicalRecord.allergies}
            </p>
          </CardContent>
        </Card>
      )}

      {/* História Social */}
      {medicalRecord.social_history && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="mr-2 h-5 w-5" />
              História Social
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">
              {medicalRecord.social_history}
            </p>
          </CardContent>
        </Card>
      )}

      {/* História Familiar */}
      {medicalRecord.family_history && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5" />
              História Familiar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">
              {medicalRecord.family_history}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Exame Físico */}
      {medicalRecord.physical_examination && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Heart className="mr-2 h-5 w-5" />
              Exame Físico
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">
              {medicalRecord.physical_examination}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Avaliação/Diagnóstico */}
      {medicalRecord.assessment && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              Avaliação/Diagnóstico
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">
              {medicalRecord.assessment}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Observações */}
      {medicalRecord.notes && (
        <Card className="md:col-span-2 lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              Observações Gerais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">
              {medicalRecord.notes}
            </p>
          </CardContent>
        </Card>
      )}

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
              {formatDate(medicalRecord.created_at)}
            </div>
            <div>
              <span className="font-medium">Última atualização:</span>{' '}
              {formatDate(medicalRecord.updated_at)}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
