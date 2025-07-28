"use client"

import { useState, useEffect } from 'react'
import { format, addDays, isSameDay, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  User, 
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowLeft,
  ArrowRight,
  Heart,
  Sparkles
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar } from '@/components/ui/calendar'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

interface Service {
  id: string
  name: string
  description: string
  duration: number
  price: number
  category: 'consultation' | 'procedure' | 'follow_up'
  requires_evaluation: boolean
  icon: string
}

interface Professional {
  id: string
  name: string
  specialty: string
  avatar_url?: string
  rating: number
  reviews_count: number
  available_services: string[]
}

interface TimeSlot {
  time: string
  available: boolean
  professional_id: string
  service_id: string
}

interface BookingStep {
  step: number
  title: string
  description: string
}

const bookingSteps: BookingStep[] = [
  { step: 1, title: 'Serviço', description: 'Escolha o tratamento desejado' },
  { step: 2, title: 'Profissional', description: 'Selecione o especialista' },
  { step: 3, title: 'Data e Hora', description: 'Escolha quando prefere' },
  { step: 4, title: 'Confirmação', description: 'Revise e confirme' }
]

export function SelfBooking() {
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([])
  const [notes, setNotes] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isBooking, setIsBooking] = useState(false)

  // Sample data - in production, this would come from API
  const services: Service[] = [
    {
      id: '1',
      name: 'Consulta de Avaliação',
      description: 'Avaliação inicial para planejamento de tratamentos estéticos',
      duration: 60,
      price: 150,
      category: 'consultation',
      requires_evaluation: false,
      icon: '👩‍⚕️'
    },
    {
      id: '2',
      name: 'Harmonização Facial',
      description: 'Procedimento com ácido hialurônico para harmonização facial',
      duration: 90,
      price: 800,
      category: 'procedure',
      requires_evaluation: true,
      icon: '✨'
    },
    {
      id: '3',
      name: 'Botox Terapêutico',
      description: 'Aplicação de toxina botulínica para linhas de expressão',
      duration: 45,
      price: 600,
      category: 'procedure',
      requires_evaluation: true,
      icon: '💫'
    },
    {
      id: '4',
      name: 'Retorno Pós-Procedimento',
      description: 'Consulta de acompanhamento após procedimentos realizados',
      duration: 30,
      price: 0,
      category: 'follow_up',
      requires_evaluation: false,
      icon: '🔄'
    }
  ]

  const professionals: Professional[] = [
    {
      id: '1',
      name: 'Dra. Marina Silva',
      specialty: 'Dermatologia Estética',
      avatar_url: '',
      rating: 4.9,
      reviews_count: 127,
      available_services: ['1', '2', '3', '4']
    },
    {
      id: '2',
      name: 'Dr. Carlos Mendes',
      specialty: 'Cirurgia Plástica',
      avatar_url: '',
      rating: 4.8,
      reviews_count: 89,
      available_services: ['1', '2', '4']
    }
  ]

  // Generate available time slots (sample data)
  useEffect(() => {
    if (selectedDate && selectedProfessional && selectedService) {
      setIsLoading(true)
      // Simulate API call
      setTimeout(() => {
        const slots: TimeSlot[] = [
          { time: '09:00', available: true, professional_id: selectedProfessional.id, service_id: selectedService.id },
          { time: '10:30', available: false, professional_id: selectedProfessional.id, service_id: selectedService.id },
          { time: '14:00', available: true, professional_id: selectedProfessional.id, service_id: selectedService.id },
          { time: '15:30', available: true, professional_id: selectedProfessional.id, service_id: selectedService.id },
          { time: '17:00', available: false, professional_id: selectedProfessional.id, service_id: selectedService.id }
        ]
        setAvailableSlots(slots)
        setIsLoading(false)
      }, 1000)
    }
  }, [selectedDate, selectedProfessional, selectedService])

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service)
    setCurrentStep(2)
  }

  const handleProfessionalSelect = (professional: Professional) => {
    setSelectedProfessional(professional)
    setCurrentStep(3)
  }

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date)
    setSelectedTime('')
  }

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time)
    setCurrentStep(4)
  }

  const handleBookingConfirm = async () => {
    if (!selectedService || !selectedProfessional || !selectedDate || !selectedTime) {
      toast.error('Dados incompletos para agendamento')
      return
    }

    setIsBooking(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast.success('Agendamento realizado com sucesso!', {
        description: `${selectedService.name} em ${format(selectedDate, "d 'de' MMMM", { locale: ptBR })} às ${selectedTime}`
      })
      
      // Reset form
      setCurrentStep(1)
      setSelectedService(null)
      setSelectedProfessional(null)
      setSelectedDate(undefined)
      setSelectedTime('')
      setNotes('')
      
    } catch (error) {
      toast.error('Erro ao realizar agendamento', {
        description: 'Tente novamente ou entre em contato conosco'
      })
    } finally {
      setIsBooking(false)
    }
  }

  const canSelectDates = (date: Date) => {
    const today = new Date()
    const maxDate = addDays(today, 60) // 60 days ahead
    return date >= today && date <= maxDate
  }

  const getCategoryBadge = (category: Service['category']) => {
    const badges = {
      consultation: { label: 'Consulta', color: 'bg-blue-100 text-blue-800' },
      procedure: { label: 'Procedimento', color: 'bg-purple-100 text-purple-800' },
      follow_up: { label: 'Retorno', color: 'bg-green-100 text-green-800' }
    }
    return badges[category]
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Agendar Consulta
        </h1>
        <p className="text-muted-foreground mt-2">
          Escolha o melhor horário para cuidar da sua saúde e beleza
        </p>
      </div>

      {/* Progress Steps */}
      <Card className="medical-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            {bookingSteps.map((step, index) => (
              <div key={step.step} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    currentStep >= step.step 
                      ? 'bg-primary text-white' 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {currentStep > step.step ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      step.step
                    )}
                  </div>
                  <div className="mt-2 text-center">
                    <p className="text-sm font-medium">{step.title}</p>
                    <p className="text-xs text-muted-foreground hidden md:block">
                      {step.description}
                    </p>
                  </div>
                </div>
                {index < bookingSteps.length - 1 && (
                  <div className={`flex-1 h-px mx-4 transition-colors ${
                    currentStep > step.step ? 'bg-primary' : 'bg-muted'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Step 1: Service Selection */}
      {currentStep === 1 && (
        <div>
          <h2 className="text-xl font-semibold mb-6">Escolha o Serviço</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.map((service) => {
              const badge = getCategoryBadge(service.category)
              return (
                <Card 
                  key={service.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow medical-card"
                  onClick={() => handleServiceSelect(service)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="text-3xl">{service.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{service.name}</h3>
                          <Badge className={badge.color}>{badge.label}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {service.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>{service.duration}min</span>
                            </div>
                            <div className="font-semibold text-foreground">
                              {service.price > 0 ? (
                                `R$ ${service.price.toLocaleString('pt-BR')}`
                              ) : (
                                'Gratuito'
                              )}
                            </div>
                          </div>
                        </div>
                        {service.requires_evaluation && (
                          <div className="mt-3 flex items-center gap-2 text-xs text-amber-600">
                            <AlertCircle className="w-4 h-4" />
                            <span>Requer avaliação prévia</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* Step 2: Professional Selection */}
      {currentStep === 2 && selectedService && (
        <div>
          <div className="flex items-center gap-2 mb-6">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setCurrentStep(1)}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </div>
          
          <h2 className="text-xl font-semibold mb-2">Escolha o Profissional</h2>
          <p className="text-muted-foreground mb-6">
            Para: <strong>{selectedService.name}</strong>
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {professionals
              .filter(prof => prof.available_services.includes(selectedService.id))
              .map((professional) => (
                <Card 
                  key={professional.id}
                  className="cursor-pointer hover:shadow-md transition-shadow medical-card"
                  onClick={() => handleProfessionalSelect(professional)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={professional.avatar_url} />
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {professional.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{professional.name}</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          {professional.specialty}
                        </p>
                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Heart 
                                key={i} 
                                className={`w-4 h-4 ${
                                  i < Math.floor(professional.rating) 
                                    ? 'fill-yellow-400 text-yellow-400' 
                                    : 'text-gray-300'
                                }`} 
                              />
                            ))}
                          </div>
                          <span className="text-sm font-semibold">
                            {professional.rating}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            ({professional.reviews_count} avaliações)
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      )}

      {/* Step 3: Date & Time Selection */}
      {currentStep === 3 && selectedService && selectedProfessional && (
        <div>
          <div className="flex items-center gap-2 mb-6">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setCurrentStep(2)}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </div>
          
          <h2 className="text-xl font-semibold mb-2">Escolha Data e Horário</h2>
          <p className="text-muted-foreground mb-6">
            <strong>{selectedService.name}</strong> com <strong>{selectedProfessional.name}</strong>
          </p>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Calendar */}
            <Card className="medical-card">
              <CardHeader>
                <CardTitle className="text-lg">Selecione a Data</CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  disabled={(date) => !canSelectDates(date)}
                  locale={ptBR}
                  className="rounded-md border"
                />
              </CardContent>
            </Card>

            {/* Time Slots */}
            <Card className="medical-card">
              <CardHeader>
                <CardTitle className="text-lg">Horários Disponíveis</CardTitle>
                {selectedDate && (
                  <CardDescription>
                    {format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                {!selectedDate ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CalendarIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Selecione uma data para ver os horários</p>
                  </div>
                ) : isLoading ? (
                  <div className="text-center py-8">
                    <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin text-primary" />
                    <p className="text-muted-foreground">Carregando horários...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {availableSlots.map((slot) => (
                      <Button
                        key={slot.time}
                        variant={selectedTime === slot.time ? "default" : "outline"}
                        disabled={!slot.available}
                        onClick={() => handleTimeSelect(slot.time)}
                        className="h-12"
                      >
                        {slot.time}
                      </Button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Step 4: Confirmation */}
      {currentStep === 4 && selectedService && selectedProfessional && selectedDate && selectedTime && (
        <div>
          <div className="flex items-center gap-2 mb-6">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setCurrentStep(3)}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </div>
          
          <h2 className="text-xl font-semibold mb-6">Confirmar Agendamento</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Booking Summary */}
            <Card className="medical-card">
              <CardHeader>
                <CardTitle className="text-lg">Resumo do Agendamento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">{selectedService.icon}</div>
                  <div>
                    <h3 className="font-semibold">{selectedService.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedService.description}
                    </p>
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{selectedProfessional.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedProfessional.specialty}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <CalendarIcon className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">
                      {format(selectedDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </p>
                    <p className="text-sm text-muted-foreground">às {selectedTime}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Duração: {selectedService.duration} minutos</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Clínica NeonPro</p>
                    <p className="text-sm text-muted-foreground">
                      Rua das Flores, 123 - São Paulo, SP
                    </p>
                  </div>
                </div>
                
                {selectedService.price > 0 && (
                  <>
                    <Separator />
                    <div className="flex items-center justify-between text-lg font-semibold">
                      <span>Valor:</span>
                      <span>R$ {selectedService.price.toLocaleString('pt-BR')}</span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Additional Information */}
            <div className="space-y-6">
              <Card className="medical-card">
                <CardHeader>
                  <CardTitle className="text-lg">Observações (Opcional)</CardTitle>
                </CardHeader>
                <CardContent>
                  <Label htmlFor="notes" className="text-sm font-medium">
                    Alguma informação importante para a consulta?
                  </Label>
                  <Textarea
                    id="notes"
                    placeholder="Descreva sintomas, dúvidas ou informações relevantes..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="mt-2"
                    rows={4}
                  />
                </CardContent>
              </Card>

              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Importante:</strong> Você receberá uma confirmação por email 
                  e WhatsApp (se autorizado). Lembre-se de chegar 15 minutos antes 
                  do horário agendado.
                </AlertDescription>
              </Alert>

              <div className="flex gap-3">
                <Button 
                  onClick={handleBookingConfirm}
                  disabled={isBooking}
                  className="flex-1"
                  size="lg"
                >
                  {isBooking && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {isBooking ? 'Agendando...' : 'Confirmar Agendamento'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}