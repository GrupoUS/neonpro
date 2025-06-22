'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Save, Calendar, Clock, Settings } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

// Schema de validação para configurações de agendamento
const appointmentSettingsSchema = z.object({
  default_duration: z.number().min(15, 'Duração mínima de 15 minutos').max(480, 'Duração máxima de 8 horas'),
  interval_between_appointments: z.number().min(0, 'Intervalo deve ser maior ou igual a 0').max(120, 'Intervalo máximo de 2 horas'),
  advance_booking_days: z.number().min(0, 'Deve ser maior ou igual a 0').max(365, 'Máximo de 365 dias'),
  cancellation_hours: z.number().min(0, 'Deve ser maior ou igual a 0').max(168, 'Máximo de 7 dias'),
  allow_same_day_booking: z.boolean().default(true),
  require_confirmation: z.boolean().default(false),
  auto_confirm_returning_clients: z.boolean().default(false),
  working_days: z.array(z.string()).min(1, 'Selecione pelo menos um dia'),
  start_time: z.string().min(1, 'Horário de início é obrigatório'),
  end_time: z.string().min(1, 'Horário de fim é obrigatório'),
})

type AppointmentSettingsFormData = z.infer<typeof appointmentSettingsSchema>

export function AppointmentSettings() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AppointmentSettingsFormData>({
    resolver: zodResolver(appointmentSettingsSchema),
    defaultValues: {
      default_duration: 60,
      interval_between_appointments: 15,
      advance_booking_days: 30,
      cancellation_hours: 24,
      allow_same_day_booking: true,
      require_confirmation: false,
      auto_confirm_returning_clients: false,
      working_days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      start_time: '08:00',
      end_time: '18:00',
    }
  })

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('appointment_settings')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (data) {
        setValue('default_duration', data.default_duration || 60)
        setValue('interval_between_appointments', data.interval_between_appointments || 15)
        setValue('advance_booking_days', data.advance_booking_days || 30)
        setValue('cancellation_hours', data.cancellation_hours || 24)
        setValue('allow_same_day_booking', data.allow_same_day_booking ?? true)
        setValue('require_confirmation', data.require_confirmation ?? false)
        setValue('auto_confirm_returning_clients', data.auto_confirm_returning_clients ?? false)
        setValue('working_days', data.working_days || ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'])
        setValue('start_time', data.start_time || '08:00')
        setValue('end_time', data.end_time || '18:00')
      }
    } catch (err) {
      console.error('Erro ao carregar configurações:', err)
    }
  }

  const onSubmit = async (data: AppointmentSettingsFormData) => {
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('Usuário não autenticado')
      }

      const settingsData = {
        ...data,
        user_id: user.id,
        updated_at: new Date().toISOString(),
      }

      // Tentar atualizar primeiro
      const { error: updateError } = await supabase
        .from('appointment_settings')
        .update(settingsData)
        .eq('user_id', user.id)

      // Se não existir, criar novo
      if (updateError && updateError.code === 'PGRST116') {
        const { error: insertError } = await supabase
          .from('appointment_settings')
          .insert([{
            ...settingsData,
            created_at: new Date().toISOString(),
          }])

        if (insertError) throw insertError
      } else if (updateError) {
        throw updateError
      }

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar configurações')
    } finally {
      setIsLoading(false)
    }
  }

  const weekDays = [
    { value: 'monday', label: 'Segunda-feira' },
    { value: 'tuesday', label: 'Terça-feira' },
    { value: 'wednesday', label: 'Quarta-feira' },
    { value: 'thursday', label: 'Quinta-feira' },
    { value: 'friday', label: 'Sexta-feira' },
    { value: 'saturday', label: 'Sábado' },
    { value: 'sunday', label: 'Domingo' },
  ]

  const handleWorkingDayChange = (day: string, checked: boolean) => {
    const currentDays = watch('working_days')
    if (checked) {
      setValue('working_days', [...currentDays, day])
    } else {
      setValue('working_days', currentDays.filter(d => d !== day))
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <AlertDescription>Configurações salvas com sucesso!</AlertDescription>
        </Alert>
      )}

      {/* Configurações de Tempo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="mr-2 h-5 w-5" />
            Configurações de Tempo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="default_duration">Duração Padrão (minutos)</Label>
              <Input
                id="default_duration"
                type="number"
                min="15"
                max="480"
                {...register('default_duration', { valueAsNumber: true })}
              />
              {errors.default_duration && (
                <p className="text-sm text-red-600 mt-1">{errors.default_duration.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="interval_between_appointments">Intervalo Entre Agendamentos (minutos)</Label>
              <Input
                id="interval_between_appointments"
                type="number"
                min="0"
                max="120"
                {...register('interval_between_appointments', { valueAsNumber: true })}
              />
              {errors.interval_between_appointments && (
                <p className="text-sm text-red-600 mt-1">{errors.interval_between_appointments.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start_time">Horário de Início</Label>
              <Input
                id="start_time"
                type="time"
                {...register('start_time')}
              />
              {errors.start_time && (
                <p className="text-sm text-red-600 mt-1">{errors.start_time.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="end_time">Horário de Fim</Label>
              <Input
                id="end_time"
                type="time"
                {...register('end_time')}
              />
              {errors.end_time && (
                <p className="text-sm text-red-600 mt-1">{errors.end_time.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dias de Funcionamento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="mr-2 h-5 w-5" />
            Dias de Funcionamento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {weekDays.map((day) => (
              <div key={day.value} className="flex items-center space-x-2">
                <Checkbox
                  id={day.value}
                  checked={watch('working_days').includes(day.value)}
                  onCheckedChange={(checked) => handleWorkingDayChange(day.value, !!checked)}
                />
                <Label htmlFor={day.value} className="text-sm">
                  {day.label}
                </Label>
              </div>
            ))}
          </div>
          {errors.working_days && (
            <p className="text-sm text-red-600 mt-2">{errors.working_days.message}</p>
          )}
        </CardContent>
      </Card>

      {/* Políticas de Agendamento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="mr-2 h-5 w-5" />
            Políticas de Agendamento
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="advance_booking_days">Antecedência Máxima (dias)</Label>
              <Input
                id="advance_booking_days"
                type="number"
                min="0"
                max="365"
                {...register('advance_booking_days', { valueAsNumber: true })}
              />
              {errors.advance_booking_days && (
                <p className="text-sm text-red-600 mt-1">{errors.advance_booking_days.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="cancellation_hours">Prazo para Cancelamento (horas)</Label>
              <Input
                id="cancellation_hours"
                type="number"
                min="0"
                max="168"
                {...register('cancellation_hours', { valueAsNumber: true })}
              />
              {errors.cancellation_hours && (
                <p className="text-sm text-red-600 mt-1">{errors.cancellation_hours.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="allow_same_day_booking"
                checked={watch('allow_same_day_booking')}
                onCheckedChange={(checked) => setValue('allow_same_day_booking', !!checked)}
              />
              <Label htmlFor="allow_same_day_booking">
                Permitir agendamento no mesmo dia
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="require_confirmation"
                checked={watch('require_confirmation')}
                onCheckedChange={(checked) => setValue('require_confirmation', !!checked)}
              />
              <Label htmlFor="require_confirmation">
                Exigir confirmação para novos agendamentos
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="auto_confirm_returning_clients"
                checked={watch('auto_confirm_returning_clients')}
                onCheckedChange={(checked) => setValue('auto_confirm_returning_clients', !!checked)}
              />
              <Label htmlFor="auto_confirm_returning_clients">
                Confirmar automaticamente clientes recorrentes
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Botão de salvar */}
      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <Save className="mr-2 h-4 w-4" />
          Salvar Configurações
        </Button>
      </div>
    </form>
  )
}
