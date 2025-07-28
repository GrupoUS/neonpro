'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Calendar, Clock, User, CreditCard, FileText } from 'lucide-react'
import { format, addDays, isToday, isTomorrow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { appointmentSchema, type AppointmentFormData } from '@/lib/healthcare/schemas'
import { formatCurrency } from '@/lib/utils'
import { toast } from 'sonner'

interface Patient {
  id: string
  name: string
  cpf: string
  phone: string
}

interface Professional {
  id: string
  name: string
  specialty: string
  available_times: string[]
}

interface Service {
  id: string
  name: string
  duration_minutes: number
  price: number
  description: string
}

interface AppointmentBookingFormProps {
  patients: Patient[]
  professionals: Professional[]
  services: Service[]
  onSubmit: (data: AppointmentFormData) => Promise<void>
  isLoading?: boolean
}

export function AppointmentBookingForm({
  patients,
  professionals,
  services,
  onSubmit,
  isLoading = false
}: AppointmentBookingFormProps) {
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null)
  const [availableSlots, setAvailableSlots] = useState<Date[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const form = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      patient_id: '',
      professional_id: '',
      service_id: '',
      duration_minutes: 60,
      notes: '',
      consent_procedure: false,
      payment_method: 'card',
      total_amount: 0,
      special_requirements: ''
    }
  })

  // Generate available time slots
  const generateTimeSlots = (professional: Professional, date: Date): Date[] => {
    const slots: Date[] = []
    const today = new Date()
    
    // Don't allow booking for past dates
    if (date < today) return slots

    // Generate slots based on professional availability
    professional.available_times.forEach(timeStr => {
      const [hours, minutes] = timeStr.split(':').map(Number)
      const slotTime = new Date(date)
      slotTime.setHours(hours, minutes, 0, 0)
      
      // Don't show past time slots for today
      if (isToday(date) && slotTime <= today) return
      
      slots.push(slotTime)
    })

    return slots
  }

  // Update available slots when professional or date changes
  useEffect(() => {
    if (selectedProfessional && selectedDate) {
      const slots = generateTimeSlots(selectedProfessional, selectedDate)
      setAvailableSlots(slots)
    }
  }, [selectedProfessional, selectedDate])

  const handleSubmitForm = async (data: AppointmentFormData) => {
    try {
      await onSubmit(data)
      toast.success('Agendamento realizado com sucesso!', {
        description: 'O paciente receberá uma confirmação em breve.'
      })
      form.reset()
      setSelectedService(null)
      setSelectedProfessional(null)
      setAvailableSlots([])
      setSelectedDate(null)
    } catch (error) {
      toast.error('Erro ao criar agendamento', {
        description: 'Verifique os dados e tente novamente.'
      })
    }
  }

  const formatDateLabel = (date: Date): string => {
    if (isToday(date)) return `Hoje - ${format(date, 'dd/MM', { locale: ptBR })}`
    if (isTomorrow(date)) return `Amanhã - ${format(date, 'dd/MM', { locale: ptBR })}`
    return format(date, "EEEE - dd/MM", { locale: ptBR })
  }

  return (
    <Card className="w-full max-w-4xl mx-auto medical-card">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Calendar className="w-5 h-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl">Novo Agendamento</CardTitle>
            <CardDescription>
              Agende consultas e procedimentos com confirmação automática
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmitForm)} className="space-y-8">
            
            {/* Patient Selection */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <User className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-lg">Paciente</h3>
              </div>

              <FormField
                control={form.control}
                name="patient_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Selecionar Paciente *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-background">
                          <SelectValue placeholder="Escolha o paciente" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {patients.map((patient) => (
                          <SelectItem key={patient.id} value={patient.id}>
                            <div className="flex flex-col">
                              <span className="font-medium">{patient.name}</span>
                              <span className="text-sm text-muted-foreground">
                                {patient.cpf} • {patient.phone}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex justify-end gap-3 pt-6 border-t">
              <Button type="button" variant="outline" onClick={() => onCancel?.()}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Calendar className="w-4 h-4 mr-2" />
                    Confirmar Agendamento
                  </>
                )}
              </Button>
            </div>

          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
