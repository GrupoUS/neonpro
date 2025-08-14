'use client'

import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { CalendarDays, Clock, User, Phone, MessageCircle, AlertTriangle } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import moment from 'moment'
import 'moment/locale/pt-br'
import { AppointmentEvent, Professional } from '@/app/appointments/page'
import { cn } from '@/lib/utils'

moment.locale('pt-br')

// Form validation schema
const quickBookingSchema = z.object({
  patientName: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  phoneNumber: z.string().regex(/^\(\d{2}\)\s\d{4,5}-\d{4}$/, 'Formato: (11) 99999-9999'),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
  serviceType: z.enum(['consultation', 'botox', 'fillers', 'procedure'], {
    required_error: 'Selecione o tipo de serviço'
  }),
  professionalId: z.string().min(1, 'Selecione um profissional'),
  date: z.string().min(1, 'Selecione uma data'),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Formato: HH:MM'),
  duration: z.number().min(15).max(240),
  notes: z.string().optional(),
  whatsappReminder: z.boolean().default(true),
  equipmentNeeded: z.array(z.string()).optional()
})

type QuickBookingForm = z.infer<typeof quickBookingSchema>

interface QuickBookingModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (appointmentData: Partial<AppointmentEvent>) => void
  professionals: Professional[]
  selectedDate?: Date
  selectedSlot?: {
    start: Date
    end: Date
    resourceId?: string
  }
}

// Service type options
const serviceOptions = [
  { value: 'consultation', label: 'Consulta', duration: 60, color: 'bg-blue-500' },
  { value: 'botox', label: 'Aplicação de Botox', duration: 90, color: 'bg-violet-500' },
  { value: 'fillers', label: 'Preenchimento', duration: 120, color: 'bg-emerald-500' },
  { value: 'procedure', label: 'Procedimento', duration: 180, color: 'bg-amber-500' }
]

// Duration options in minutes
const durationOptions = [
  { value: 15, label: '15 min' },
  { value: 30, label: '30 min' },
  { value: 45, label: '45 min' },
  { value: 60, label: '1 hora' },
  { value: 90, label: '1h 30min' },
  { value: 120, label: '2 horas' },
  { value: 180, label: '3 horas' },
  { value: 240, label: '4 horas' }
]

// Equipment options
const equipmentOptions = [
  'Laser CO2',
  'Ultrassom',
  'Radiofrequência',
  'Criobiótica',
  'Microagulhamento',
  'Peeling químico',
  'Fotobiomodulação'
]

export function QuickBookingModal({
  isOpen,
  onClose,
  onSubmit,
  professionals,
  selectedDate,
  selectedSlot
}: QuickBookingModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [conflicts, setConflicts] = useState<string[]>([])

  const form = useForm<QuickBookingForm>({
    resolver: zodResolver(quickBookingSchema),
    defaultValues: {
      patientName: '',
      phoneNumber: '',
      email: '',
      serviceType: 'consultation',
      professionalId: '',
      date: selectedDate ? moment(selectedDate).format('YYYY-MM-DD') : moment().format('YYYY-MM-DD'),
      startTime: selectedSlot ? moment(selectedSlot.start).format('HH:mm') : '09:00',
      duration: 60,
      notes: '',
      whatsappReminder: true,
      equipmentNeeded: []
    }
  })

  // Auto-fill form when slot is selected
  useEffect(() => {
    if (selectedSlot) {
      form.setValue('date', moment(selectedSlot.start).format('YYYY-MM-DD'))
      form.setValue('startTime', moment(selectedSlot.start).format('HH:mm'))
      
      const suggestedDuration = moment(selectedSlot.end).diff(moment(selectedSlot.start), 'minutes')
      if (suggestedDuration >= 15 && suggestedDuration <= 240) {
        form.setValue('duration', suggestedDuration)
      }
      
      if (selectedSlot.resourceId) {
        form.setValue('professionalId', selectedSlot.resourceId)
      }
    }
  }, [selectedSlot, form])

  // Watch service type to auto-adjust duration
  const watchedServiceType = form.watch('serviceType')
  useEffect(() => {
    const serviceOption = serviceOptions.find(s => s.value === watchedServiceType)
    if (serviceOption) {
      form.setValue('duration', serviceOption.duration)
    }
  }, [watchedServiceType, form])

  // Phone number formatting
  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    
    if (numbers.length <= 2) return `(${numbers}`
    if (numbers.length <= 6) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`
    if (numbers.length <= 10) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`
  }

  // Validate appointment slot
  const validateSlot = (data: QuickBookingForm) => {
    const startDateTime = moment(`${data.date} ${data.startTime}`)
    const endDateTime = moment(startDateTime).add(data.duration, 'minutes')
    
    const conflicts: string[] = []
    
    // Check business hours
    const hour = startDateTime.hour()
    if (hour < 8 || hour >= 18) {
      conflicts.push('Horário fora do funcionamento (08:00 - 18:00)')
    }
    
    // Check if appointment ends after business hours
    if (endDateTime.hour() > 18) {
      conflicts.push('Consulta termina após horário de funcionamento')
    }
    
    // Check if it's in the past
    if (startDateTime.isBefore(moment())) {
      conflicts.push('Não é possível agendar no passado')
    }
    
    // Check weekend
    if (startDateTime.day() === 0 || startDateTime.day() === 6) {
      conflicts.push('Não atendemos aos finais de semana')
    }
    
    // Check professional availability
    const professional = professionals.find(p => p.id === data.professionalId)
    if (professional && !professional.availability) {
      conflicts.push(`${professional.name} não está disponível`)
    }
    
    return conflicts
  }

  const onFormSubmit = async (data: QuickBookingForm) => {
    setIsSubmitting(true)
    
    // Validate slot
    const validationErrors = validateSlot(data)
    if (validationErrors.length > 0) {
      setConflicts(validationErrors)
      setIsSubmitting(false)
      return
    }
    
    // Clear conflicts
    setConflicts([])
    
    // Create appointment data
    const startDateTime = moment(`${data.date} ${data.startTime}`)
    const endDateTime = moment(startDateTime).add(data.duration, 'minutes')
    
    const appointmentData: Partial<AppointmentEvent> = {
      patientName: data.patientName,
      phoneNumber: data.phoneNumber,
      email: data.email || undefined,
      serviceType: data.serviceType,
      professionalId: data.professionalId,
      start: startDateTime.toDate(),
      end: endDateTime.toDate(),
      notes: data.notes || undefined,
      whatsappReminder: data.whatsappReminder,
      equipmentNeeded: data.equipmentNeeded?.length ? data.equipmentNeeded : undefined,
      patientId: `patient_${Date.now()}`, // In production, this would come from patient database
      status: 'scheduled'
    }
    
    try {
      await onSubmit(appointmentData)
      form.reset()
      onClose()
    } catch (error) {
      console.error('Error creating appointment:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <CalendarDays className="h-5 w-5" />
            <span>Nova Consulta</span>
          </DialogTitle>
          <DialogDescription>
            Preencha os dados para agendar uma nova consulta
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-6">
            {/* Conflicts alert */}
            {conflicts.length > 0 && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-red-800">Conflitos encontrados:</h4>
                    <ul className="mt-1 text-sm text-red-700 list-disc list-inside">
                      {conflicts.map((conflict, index) => (
                        <li key={index}>{conflict}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Patient Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="patientName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Paciente</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Nome completo" 
                        {...field}
                        className="flex items-center"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="(11) 99999-9999"
                        {...field}
                        onChange={(e) => {
                          const formatted = formatPhoneNumber(e.target.value)
                          field.onChange(formatted)
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-mail (opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="email@exemplo.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Service and Professional */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="serviceType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Serviço</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o serviço" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {serviceOptions.map((service) => (
                          <SelectItem key={service.value} value={service.value}>
                            <div className="flex items-center space-x-2">
                              <div className={cn('w-3 h-3 rounded-full', service.color)} />
                              <span>{service.label}</span>
                              <Badge variant="secondary" className="ml-2">
                                {service.duration}min
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="professionalId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Profissional</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o profissional" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {professionals.map((professional) => (
                          <SelectItem 
                            key={professional.id} 
                            value={professional.id}
                            disabled={!professional.availability}
                          >
                            <div className="flex items-center justify-between w-full">
                              <div>
                                <div className="font-medium">{professional.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  {professional.specialization}
                                </div>
                              </div>
                              {!professional.availability && (
                                <Badge variant="secondary">Indisponível</Badge>
                              )}
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

            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} min={moment().format('YYYY-MM-DD')} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Horário</FormLabel>
                    <FormControl>
                      <Input 
                        type="time" 
                        {...field}
                        min="08:00"
                        max="17:30"
                        step="900" // 15-minute steps
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duração</FormLabel>
                    <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {durationOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value.toString()}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Observações sobre a consulta..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Informações adicionais sobre a consulta ou necessidades especiais
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* WhatsApp Reminder */}
            <FormField
              control={form.control}
              name="whatsappReminder"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base flex items-center space-x-2">
                      <MessageCircle className="h-4 w-4 text-green-600" />
                      <span>Lembrete via WhatsApp</span>
                    </FormLabel>
                    <FormDescription>
                      Enviar lembrete 24h antes da consulta
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Agendando...' : 'Agendar Consulta'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}