'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Save, Calendar, Clock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { format, addMinutes } from 'date-fns'

// Schema de validação conforme PRD
const appointmentSchema = z.object({
  client_id: z.string().min(1, 'Cliente é obrigatório'),
  service_id: z.string().min(1, 'Serviço é obrigatório'),
  professional_id: z.string().min(1, 'Profissional é obrigatório'),
  start_time: z.string().min(1, 'Data e hora são obrigatórias'),
  notes: z.string().optional(),
  price_at_booking: z.number().min(0, 'Preço deve ser maior que zero'),
})

type AppointmentFormData = z.infer<typeof appointmentSchema>

interface Client {
  id: string
  full_name: string
  email: string | null
  phone: string | null
}

interface Service {
  id: string
  name: string
  duration_minutes: number
  price: number
}

interface Professional {
  id: string
  name: string
  email: string | null
}

interface AppointmentFormProps {
  mode: 'create' | 'edit'
  clients: Client[]
  services: Service[]
  professionals: Professional[]
  preselectedClient?: Client | null
  appointment?: any
}

export function AppointmentForm({ 
  mode, 
  clients, 
  services, 
  professionals, 
  preselectedClient,
  appointment 
}: AppointmentFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: appointment ? {
      client_id: appointment.client_id || '',
      service_id: appointment.service_id || '',
      professional_id: appointment.professional_id || '',
      start_time: appointment.start_time ? format(new Date(appointment.start_time), "yyyy-MM-dd'T'HH:mm") : '',
      notes: appointment.notes || '',
      price_at_booking: appointment.price_at_booking || 0,
    } : {
      client_id: preselectedClient?.id || '',
      service_id: '',
      professional_id: '',
      start_time: '',
      notes: '',
      price_at_booking: 0,
    }
  })

  const watchedServiceId = watch('service_id')
  const watchedStartTime = watch('start_time')

  // Atualizar preço quando serviço mudar
  const handleServiceChange = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId)
    if (service) {
      setSelectedService(service)
      setValue('price_at_booking', service.price)
      
      // Calcular end_time baseado na duração do serviço
      if (watchedStartTime) {
        const startTime = new Date(watchedStartTime)
        const endTime = addMinutes(startTime, service.duration_minutes)
        // Note: end_time seria calculado no backend
      }
    }
  }

  const onSubmit = async (data: AppointmentFormData) => {
    setIsLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('Usuário não autenticado')
      }

      // Calcular end_time baseado na duração do serviço
      const service = services.find(s => s.id === data.service_id)
      if (!service) {
        throw new Error('Serviço não encontrado')
      }

      const startTime = new Date(data.start_time)
      const endTime = addMinutes(startTime, service.duration_minutes)

      const appointmentData = {
        ...data,
        user_id: user.id,
        end_time: endTime.toISOString(),
        status: 'scheduled',
        updated_at: new Date().toISOString(),
      }

      if (mode === 'create') {
        const { error } = await supabase
          .from('appointments')
          .insert([{
            ...appointmentData,
            created_at: new Date().toISOString(),
          }])

        if (error) throw error

        router.push('/dashboard/agendamentos')
        router.refresh()
      } else {
        const { error } = await supabase
          .from('appointments')
          .update(appointmentData)
          .eq('id', appointment.id)
          .eq('user_id', user.id)

        if (error) throw error

        router.push('/dashboard/agendamentos')
        router.refresh()
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar agendamento')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Informações do Agendamento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="mr-2 h-5 w-5" />
            Informações do Agendamento
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="client_id">Cliente *</Label>
              <Select
                value={watch('client_id')}
                onValueChange={(value) => setValue('client_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.client_id && (
                <p className="text-sm text-red-600 mt-1">{errors.client_id.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="service_id">Serviço *</Label>
              <Select
                value={watchedServiceId}
                onValueChange={handleServiceChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um serviço" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name} - {service.duration_minutes}min
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.service_id && (
                <p className="text-sm text-red-600 mt-1">{errors.service_id.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="professional_id">Profissional *</Label>
              <Select
                value={watch('professional_id')}
                onValueChange={(value) => setValue('professional_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um profissional" />
                </SelectTrigger>
                <SelectContent>
                  {professionals.map((professional) => (
                    <SelectItem key={professional.id} value={professional.id}>
                      {professional.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.professional_id && (
                <p className="text-sm text-red-600 mt-1">{errors.professional_id.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="start_time">Data e Hora *</Label>
              <Input
                id="start_time"
                type="datetime-local"
                {...register('start_time')}
              />
              {errors.start_time && (
                <p className="text-sm text-red-600 mt-1">{errors.start_time.message}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="price_at_booking">Preço (R$) *</Label>
            <Input
              id="price_at_booking"
              type="number"
              step="0.01"
              min="0"
              {...register('price_at_booking', { valueAsNumber: true })}
              placeholder="0,00"
            />
            {errors.price_at_booking && (
              <p className="text-sm text-red-600 mt-1">{errors.price_at_booking.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              {...register('notes')}
              placeholder="Observações sobre o agendamento..."
              rows={3}
            />
          </div>

          {selectedService && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center text-sm text-blue-800">
                <Clock className="mr-2 h-4 w-4" />
                <span>
                  Duração: {selectedService.duration_minutes} minutos | 
                  Preço: R$ {selectedService.price.toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Botões de ação */}
      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isLoading}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <Save className="mr-2 h-4 w-4" />
          {mode === 'create' ? 'Criar Agendamento' : 'Salvar Alterações'}
        </Button>
      </div>
    </form>
  )
}
