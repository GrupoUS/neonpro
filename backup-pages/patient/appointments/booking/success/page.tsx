'use client'

import { createClient } from '@/app/utils/supabase/client'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Separator } from '@/components/ui/separator'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
    ArrowLeft,
    Calendar,
    CheckCircle2,
    Clock,
    Download,
    FileText,
    Share2,
    Smartphone,
    User
} from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

interface AppointmentDetails {
  id: string
  service_name: string
  service_category: string
  service_price: number
  professional_name: string | null
  datetime: string
  duration_minutes: number
  notes: string | null
  special_requests: string[] | null
  status: string
  created_at: string
}

export default function BookingSuccessPage() {
  const [appointment, setAppointment] = useState<AppointmentDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')
  
  const searchParams = useSearchParams()
  const router = useRouter()
  const appointmentId = searchParams.get('appointment_id')

  useEffect(() => {
    if (appointmentId) {
      fetchAppointmentDetails()
    } else {
      setError('ID do agendamento não encontrado.')
      setLoading(false)
    }
  }, [appointmentId])

  const fetchAppointmentDetails = async () => {
    try {
      const supabase = createClient()
      
      const { data, error: fetchError } = await supabase
        .from('patient_appointments')
        .select(`
          id,
          datetime,
          duration_minutes,
          notes,
          special_requests,
          status,
          created_at,
          services (
            name,
            category,
            price
          ),
          professionals (
            name
          )
        `)
        .eq('id', appointmentId)
        .single()

      if (fetchError) throw fetchError

      const service = Array.isArray(data.services) ? data.services[0] : data.services
      const professional = Array.isArray(data.professionals) ? data.professionals[0] : data.professionals
      
      const appointmentDetails: AppointmentDetails = {
        id: data.id,
        service_name: service?.name || 'Serviço não encontrado',
        service_category: service?.category || '',
        service_price: service?.price || 0,
        professional_name: professional?.name || null,
        datetime: data.datetime,
        duration_minutes: data.duration_minutes,
        notes: data.notes,
        special_requests: data.special_requests,
        status: data.status,
        created_at: data.created_at
      }

      setAppointment(appointmentDetails)
    } catch (err) {
      console.error('Error fetching appointment:', err)
      setError('Erro ao carregar detalhes do agendamento.')
    } finally {
      setLoading(false)
    }
  }

  const formatAppointmentDate = () => {
    if (!appointment) return ''
    const date = new Date(appointment.datetime)
    return format(date, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })
  }

  const formatAppointmentTime = () => {
    if (!appointment) return ''
    const date = new Date(appointment.datetime)
    return format(date, 'HH:mm', { locale: ptBR })
  }

  const formatCreatedAt = () => {
    if (!appointment) return ''
    const date = new Date(appointment.created_at)
    return format(date, "d/MM/yyyy 'às' HH:mm", { locale: ptBR })
  }

  const handleDownloadConfirmation = () => {
    if (!appointment) return

    const confirmationText = `
CONFIRMAÇÃO DE AGENDAMENTO

Número do Agendamento: ${appointment.id}
Data de Agendamento: ${formatCreatedAt()}

DETALHES DA CONSULTA:
Serviço: ${appointment.service_name}
Data: ${formatAppointmentDate()}
Horário: ${formatAppointmentTime()}
Duração: ${appointment.duration_minutes} minutos
Profissional: ${appointment.professional_name || 'A definir'}
Valor: R$ ${appointment.service_price.toFixed(2)}

${appointment.notes ? `OBSERVAÇÕES:\n${appointment.notes}\n` : ''}
${appointment.special_requests && appointment.special_requests.length > 0 ? `SOLICITAÇÕES ESPECIAIS:\n${appointment.special_requests.map(r => `• ${r}`).join('\n')}\n` : ''}

IMPORTANTE:
- Chegue 15 minutos antes do horário agendado
- Traga um documento com foto
- Para cancelar, entre em contato com 24h de antecedência

Obrigado por escolher nossa clínica!
    `.trim()

    const blob = new Blob([confirmationText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `confirmacao-agendamento-${appointment.id.slice(0, 8)}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleShareAppointment = async () => {
    if (!appointment) return

    const shareText = `Agendamento confirmado!\n\nServiço: ${appointment.service_name}\nData: ${formatAppointmentDate()}\nHorário: ${formatAppointmentTime()}`

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Confirmação de Agendamento',
          text: shareText,
          url: window.location.href
        })
      } catch (err) {
        console.log('Compartilhamento cancelado')
      }
    } else {
      navigator.clipboard.writeText(shareText)
      // Could show a toast here
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error || !appointment) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          <Card className="border-red-200">
            <CardContent className="p-8 text-center">
              <div className="text-red-500 mb-4">
                <CheckCircle2 className="mx-auto h-16 w-16" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Erro ao Carregar Agendamento
              </h1>
              <p className="text-gray-600 mb-6">
                {error || 'Não foi possível encontrar os detalhes do seu agendamento.'}
              </p>
              <Button onClick={() => router.push('/patient/appointments')}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar aos Agendamentos
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Success Header */}
        <Card className="border-green-200 mb-8">
          <CardContent className="p-8 text-center">
            <div className="text-green-500 mb-4">
              <CheckCircle2 className="mx-auto h-16 w-16" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Agendamento Confirmado!
            </h1>
            <p className="text-gray-600 mb-4">
              Seu agendamento foi realizado com sucesso. 
              Você receberá uma confirmação por email e/ou SMS.
            </p>
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              Agendamento #{appointment.id.slice(0, 8)}
            </Badge>
          </CardContent>
        </Card>

        {/* Appointment Details */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl">Detalhes da Consulta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Service */}
            <div className="flex items-start space-x-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-600">
                <FileText className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{appointment.service_name}</h3>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                  <Badge variant="outline" className="capitalize">
                    {appointment.service_category}
                  </Badge>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {appointment.duration_minutes} min
                  </span>
                  <span className="flex items-center gap-1 font-medium text-green-600">
                    R$ {appointment.service_price.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Professional */}
            <div className="flex items-start space-x-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 text-purple-600">
                <User className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">
                  {appointment.professional_name || 'Profissional será definido'}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {appointment.professional_name 
                    ? 'Profissional selecionado para sua consulta'
                    : 'Nosso sistema escolherá o melhor profissional disponível'
                  }
                </p>
              </div>
            </div>

            <Separator />

            {/* Date & Time */}
            <div className="flex items-start space-x-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-600">
                <Calendar className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 capitalize">
                  {formatAppointmentDate()}
                </h3>
                <div className="flex items-center gap-1 mt-1 text-lg font-medium text-green-600">
                  <Clock className="h-5 w-5" />
                  {formatAppointmentTime()}
                </div>
              </div>
            </div>

            {/* Notes and Special Requests */}
            {(appointment.notes || (appointment.special_requests && appointment.special_requests.length > 0)) && (
              <>
                <Separator />
                <div className="flex items-start space-x-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-orange-100 text-orange-600">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div className="flex-1 space-y-3">
                    <h3 className="font-semibold text-gray-900">
                      Observações e Solicitações
                    </h3>
                    
                    {appointment.special_requests && appointment.special_requests.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Solicitações:</h4>
                        <ul className="space-y-1">
                          {appointment.special_requests.map((request, index) => (
                            <li key={index} className="text-sm text-gray-600">
                              • {request}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {appointment.notes && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Observações:</h4>
                        <div className="bg-gray-50 p-3 rounded-md text-sm text-gray-700">
                          {appointment.notes.split('\n').map((line, index) => (
                            <div key={index}>{line || <br />}</div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Button 
            variant="outline" 
            onClick={() => router.push('/patient/appointments')}
            className="w-full"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Meus Agendamentos
          </Button>
          <Button 
            variant="outline" 
            onClick={handleDownloadConfirmation}
            className="w-full"
          >
            <Download className="mr-2 h-4 w-4" />
            Baixar Confirmação
          </Button>
          <Button 
            variant="outline" 
            onClick={handleShareAppointment}
            className="w-full"
          >
            <Share2 className="mr-2 h-4 w-4" />
            Compartilhar
          </Button>
          <Button 
            onClick={() => router.push('/patient/appointments/booking')}
            className="w-full"
          >
            Agendar Novamente
          </Button>
        </div>

        {/* Important Information */}
        <div className="space-y-4">
          <Alert className="border-blue-200 bg-blue-50">
            <Smartphone className="h-4 w-4" />
            <AlertDescription className="text-blue-700">
              <strong>Confirmações:</strong> Você receberá uma confirmação por email e/ou SMS 
              com os detalhes do seu agendamento nos próximos minutos.
            </AlertDescription>
          </Alert>

          <Alert className="border-green-200 bg-green-50">
            <Clock className="h-4 w-4" />
            <AlertDescription className="text-green-700">
              <strong>Lembretes:</strong> Enviaremos lembretes 24 horas antes por email e 
              2 horas antes por SMS (se habilitado).
            </AlertDescription>
          </Alert>

          <Alert className="border-orange-200 bg-orange-50">
            <AlertDescription className="text-orange-700">
              <strong>Importante:</strong> Para cancelar ou reagendar, entre em contato 
              conosco com pelo menos 24 horas de antecedência. Chegue 15 minutos antes 
              do horário agendado com um documento com foto.
            </AlertDescription>
          </Alert>
        </div>

        {/* Booking Time Achievement */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Agendamento realizado em {formatCreatedAt()}</p>
          <p className="mt-1">
            ✅ Processo concluído rapidamente - nossa meta é ≤ 2 minutos
          </p>
        </div>
      </div>
    </div>
  )
}
