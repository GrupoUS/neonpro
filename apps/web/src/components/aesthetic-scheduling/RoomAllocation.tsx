'use client'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { apiClient as api } from '@/lib/api'
import {
  // Room,
  RoomAllocation,
  // RoomSchedule,
  // OptimizationResult,
  // AestheticAppointment
} from '@/types/aesthetic-scheduling'
import { useMutation, useQuery } from '@tanstack/react-query'
import React, { useState } from 'react'
// import { Label } from '@/components/ui/label';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Separator } from '@/components/ui/separator';
import { addDays, addHours, format, isAfter, isBefore, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  // Zap,
  // Wifi,
  // Shield,
  Activity,
  Calendar,
  Clock,
  DoorOpen,
  // MapPin,
  // Phone,
  // Monitor,
  // Heart,
  // Thermometer,
  Lightbulb,
  CheckCircle,
  Settings,
  Users,
  TrendingUp,
  // RefreshCw,
  // Plus,
  // Edit,
  // Save,
  X,
  // Coffee,
  // Car,
  // Accessibility,
  // Volume2
} from 'lucide-react'

interface RoomAllocationProps {
  appointmentId?: string
  treatmentPlanId?: string
  date?: Date
  onRoomAllocation?: (allocation: RoomAllocation) => void
}

export function RoomAllocation({
  appointmentId,
  treatmentPlanId,
  date = new Date(),
  onRoomAllocation,
}: RoomAllocationProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(date)
  const [selectedRoom, setSelectedRoom] = useState<string>('')
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('')
  const [activeTab, setActiveTab] = useState('overview')
  const [isManualMode, setIsManualMode] = useState(false)

  // Fetch available rooms
  const { data: rooms, isLoading: roomsLoading } = useQuery({
    queryKey: ['rooms'],
    queryFn: async () => {
      return await api.aestheticScheduling.getRooms()
    },
  })

  // Fetch room schedules
  const { data: schedules, isLoading: schedulesLoading } = useQuery({
    queryKey: ['room-schedules', selectedDate],
    queryFn: async () => {
      return await api.aestheticScheduling.getRoomSchedules({
        date: selectedDate.toISOString(),
        includeAvailability: true,
      })
    },
    enabled: !!selectedDate,
  })

  // Fetch optimization suggestions
  const { data: optimization, isLoading: optimizationLoading } = useQuery({
    queryKey: ['room-optimization', appointmentId, treatmentPlanId, selectedDate],
    queryFn: async () => {
      if (appointmentId || treatmentPlanId) {
        return await api.aestheticScheduling.optimizeRoomAllocation({
          appointmentId,
          treatmentPlanId,
          date: selectedDate.toISOString(),
          considerPatientPreferences: true,
          considerEquipmentRequirements: true,
        })
      }
      return null
    },
    enabled: !!(appointmentId || treatmentPlanId) && !!selectedDate,
  })

  // Create allocation mutation
  const createAllocation = useMutation({
    mutationFn: async (allocation: Partial<RoomAllocation>) => {
      return await api.aestheticScheduling.createRoomAllocation(allocation)
    },
    onSuccess: () => {
      // Refresh schedules
      // queryClient.invalidateQueries(['room-schedules', selectedDate]);
    },
  })

  const getRoomStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800'
      case 'occupied':
        return 'bg-red-100 text-red-800'
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800'
      case 'cleaning':
        return 'bg-blue-100 text-blue-800'
      case 'reserved':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getEfficiencyColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600'
    if (score >= 0.6) return 'text-yellow-600'
    return 'text-red-600'
  }

  const formatDate = (date: Date) => {
    return format(date, 'dd/MM/yyyy', { locale: ptBR })
  }

  const formatTime = (date: Date) => {
    return format(date, 'HH:mm', { locale: ptBR })
  }

  const generateTimeSlots = () => {
    const slots = []
    let start = new Date(selectedDate)
    start.setHours(8, 0, 0, 0)
    const end = new Date(selectedDate)
    end.setHours(20, 0, 0, 0)

    while (start < end) {
      const slotEnd = addHours(start, 1)
      slots.push({
        start: new Date(start),
        end: slotEnd,
        id: `${formatTime(start)}-${formatTime(slotEnd)}`,
      })
      start = slotEnd
    }

    return slots
  }

  const isTimeSlotAvailable = (roomId: string, timeSlot: { start: Date; end: Date }) => {
    const roomSchedule = schedules?.find(s => s.roomId === roomId)
    if (!roomSchedule) return true

    return !roomSchedule.appointments.some(appointment => {
      const appointmentStart = parseISO(appointment.startTime)
      const appointmentEnd = parseISO(appointment.endTime)

      return (
        (timeSlot.start >= appointmentStart && timeSlot.start < appointmentEnd) ||
        (timeSlot.end > appointmentStart && timeSlot.end <= appointmentEnd) ||
        (timeSlot.start <= appointmentStart && timeSlot.end >= appointmentEnd)
      )
    })
  }

  const timeSlots = generateTimeSlots()

  if (roomsLoading || schedulesLoading) {
    return (
      <div className='space-y-6'>
        <div className='animate-pulse'>
          <div className='h-8 bg-gray-200 rounded mb-4'></div>
          <div className='h-32 bg-gray-200 rounded'></div>
        </div>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
        <div>
          <h2 className='text-2xl font-bold text-gray-900'>
            Alocação de Salas
          </h2>
          <p className='text-gray-600 mt-1'>
            Gerenciamento otimizado de espaços e recursos
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <Input
            type='date'
            value={format(selectedDate, 'yyyy-MM-dd')}
            onChange={e => setSelectedDate(new Date(e.target.value))}
            className='w-auto'
          />
          <Button
            variant='outline'
            onClick={() => setIsManualMode(!isManualMode)}
            className='flex items-center gap-2'
          >
            <Settings className='h-4 w-4' />
            {isManualMode ? 'Modo Automático' : 'Modo Manual'}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center gap-2'>
              <DoorOpen className='h-4 w-4 text-blue-500' />
              <div>
                <div className='text-sm text-gray-500'>Total de Salas</div>
                <div className='text-lg font-bold'>{rooms?.length || 0}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center gap-2'>
              <CheckCircle className='h-4 w-4 text-green-500' />
              <div>
                <div className='text-sm text-gray-500'>Disponíveis</div>
                <div className='text-lg font-bold'>
                  {rooms?.filter(r => r.status === 'available').length || 0}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center gap-2'>
              <Users className='h-4 w-4 text-purple-500' />
              <div>
                <div className='text-sm text-gray-500'>Ocupação</div>
                <div className='text-lg font-bold'>
                  {schedules
                    ? Math.round(
                      (schedules.filter(s => s.appointments.length > 0).length / schedules.length) *
                        100,
                    )
                    : 0}%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center gap-2'>
              <TrendingUp className='h-4 w-4 text-orange-500' />
              <div>
                <div className='text-sm text-gray-500'>Eficiência</div>
                <div
                  className={`text-lg font-bold ${
                    getEfficiencyColor(optimization?.efficiencyScore || 0)
                  }`}
                >
                  {Math.round((optimization?.efficiencyScore || 0) * 100)}%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Optimization Alert */}
      {optimization && optimization.suggestions.length > 0 && (
        <Alert>
          <Lightbulb className='h-4 w-4' />
          <AlertTitle>Sugestões de Otimização</AlertTitle>
          <AlertDescription>
            <ul className='list-disc list-inside'>
              {optimization.suggestions.slice(0, 3).map(suggestion => (
                <li key={suggestion}>{suggestion}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className='grid w-full grid-cols-3'>
          <TabsTrigger value='overview'>Visão Geral</TabsTrigger>
          <TabsTrigger value='schedule'>Agenda</TabsTrigger>
          <TabsTrigger value='allocation'>Alocação</TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value='overview' className='space-y-4'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
            {/* Room Status Overview */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <DoorOpen className='h-5 w-5' />
                  Status das Salas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-3'>
                  {rooms?.map(room => (
                    <div
                      key={room.id}
                      className='flex items-center justify-between p-3 border rounded-lg'
                    >
                      <div className='flex items-center gap-3'>
                        <div className='flex-shrink-0'>
                          <div
                            className={`w-3 h-3 rounded-full ${
                              room.status === 'available'
                                ? 'bg-green-500'
                                : room.status === 'occupied'
                                ? 'bg-red-500'
                                : room.status === 'maintenance'
                                ? 'bg-yellow-500'
                                : room.status === 'cleaning'
                                ? 'bg-blue-500'
                                : 'bg-purple-500'
                            }`}
                          />
                        </div>
                        <div>
                          <div className='font-medium'>{room.name}</div>
                          <div className='text-sm text-gray-500'>
                            {room.type} • Capacidade: {room.capacity}
                          </div>
                        </div>
                      </div>
                      <Badge className={getRoomStatusColor(room.status)}>
                        {room.status === 'available'
                          ? 'Disponível'
                          : room.status === 'occupied'
                          ? 'Ocupada'
                          : room.status === 'maintenance'
                          ? 'Manutenção'
                          : room.status === 'cleaning'
                          ? 'Limpeza'
                          : room.status === 'reserved'
                          ? 'Reservada'
                          : room.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Usage Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Activity className='h-5 w-5' />
                  Estatísticas de Uso
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  {schedules?.map(schedule => {
                    const utilizationRate = (schedule.appointments.length / 12) * 100 // 12 hours business day
                    return (
                      <div key={schedule.roomId} className='space-y-2'>
                        <div className='flex items-center justify-between'>
                          <span className='text-sm font-medium'>
                            {rooms?.find(r => r.id === schedule.roomId)?.name}
                          </span>
                          <span className='text-sm text-gray-600'>
                            {Math.round(utilizationRate)}% utilizado
                          </span>
                        </div>
                        <Progress value={utilizationRate} className='h-2' />
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Schedule */}
        <TabsContent value='schedule' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Calendar className='h-5 w-5' />
                Agenda do Dia - {formatDate(selectedDate)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {timeSlots.map(timeSlot => (
                  <div key={timeSlot.id} className='border rounded-lg p-4'>
                    <div className='flex items-center justify-between mb-3'>
                      <h4 className='font-medium'>{timeSlot.id}</h4>
                      <div className='flex items-center gap-2'>
                        <span className='text-sm text-gray-500'>
                          {rooms?.filter(r => isTimeSlotAvailable(r.id, timeSlot)).length}{' '}
                          salas disponíveis
                        </span>
                      </div>
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3'>
                      {rooms?.map(room => {
                        const isAvailable = isTimeSlotAvailable(room.id, timeSlot)
                        const appointment = schedules?.find(s => s.roomId === room.id)?.appointments
                          .find(a => {
                            const start = parseISO(a.startTime)
                            const end = parseISO(a.endTime)
                            return timeSlot.start >= start && timeSlot.start < end
                          })

                        return (
                          <div
                            key={room.id}
                            className={`p-3 rounded-lg border ${
                              isAvailable
                                ? 'border-green-200 bg-green-50'
                                : 'border-red-200 bg-red-50'
                            }`}
                          >
                            <div className='flex items-center justify-between mb-1'>
                              <span className='text-sm font-medium'>{room.name}</span>
                              {isAvailable
                                ? <CheckCircle className='h-4 w-4 text-green-500' />
                                : <X className='h-4 w-4 text-red-500' />}
                            </div>
                            {appointment && (
                              <div className='text-xs text-gray-600'>
                                {appointment.patientName} - {appointment.procedureName}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Allocation */}
        <TabsContent value='allocation' className='space-y-4'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
            {/* Room Selection */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <DoorOpen className='h-5 w-5' />
                  Selecionar Sala
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-3'>
                  {rooms?.filter(r => r.status === 'available').map(room => (
                    <div
                      key={room.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedRoom === room.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedRoom(room.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setSelectedRoom(room.id);
                        }
                      }}
                      role="button"
                      tabIndex={0}
                    >
                      <div className='flex items-center justify-between mb-2'>
                        <h4 className='font-medium'>{room.name}</h4>
                        <Badge variant='outline'>Capacidade: {room.capacity}</Badge>
                      </div>

                      <div className='text-sm text-gray-600 mb-3'>{room.description}</div>

                      <div className='grid grid-cols-2 gap-4 text-sm'>
                        <div>
                          <span className='text-gray-500'>Tipo:</span>
                          <div className='font-medium'>{room.type}</div>
                        </div>
                        <div>
                          <span className='text-gray-500'>Andar:</span>
                          <div className='font-medium'>{room.floor}</div>
                        </div>
                      </div>

                      {room.equipment.length > 0 && (
                        <div className='mt-3'>
                          <span className='text-sm text-gray-500'>Equipamentos:</span>
                          <div className='flex flex-wrap gap-1 mt-1'>
                            {room.equipment.slice(0, 3).map((equipment) => (
                              <span
                                key={equipment}
                                className='text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded'
                              >
                                {equipment}
                              </span>
                            ))}
                            {room.equipment.length > 3 && (
                              <span className='text-xs text-gray-500'>
                                +{room.equipment.length - 3}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Time Slot Selection */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Clock className='h-5 w-5' />
                  Selecionar Horário
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedRoom
                  ? (
                    <div className='space-y-3'>
                      {timeSlots.map(timeSlot => {
                        const isAvailable = isTimeSlotAvailable(selectedRoom, timeSlot)
                        return (
                          <div
                            key={timeSlot.id}
                            className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                              selectedTimeSlot === timeSlot.id
                                ? 'border-blue-500 bg-blue-50'
                                : isAvailable
                                ? 'border-green-200 bg-green-50 hover:border-green-300'
                                : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                            }`}
                            onClick={() => isAvailable && setSelectedTimeSlot(timeSlot.id)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                if (isAvailable) setSelectedTimeSlot(timeSlot.id);
                              }
                            }}
                            role="button"
                            tabIndex={0}
                          >
                            <div className='flex items-center justify-between'>
                              <span className='font-medium'>{timeSlot.id}</span>
                              {isAvailable
                                ? <CheckCircle className='h-4 w-4 text-green-500' />
                                : <X className='h-4 w-4 text-gray-400' />}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )
                  : (
                    <div className='text-center text-gray-500'>
                      Selecione uma sala para ver os horários disponíveis
                    </div>
                  )}
              </CardContent>
            </Card>
          </div>

          {/* Allocation Summary */}
          {selectedRoom && selectedTimeSlot && (
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <CheckCircle className='h-5 w-5' />
                  Resumo da Alocação
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-4'>
                  <div>
                    <span className='text-sm text-gray-500'>Sala:</span>
                    <div className='font-medium'>
                      {rooms?.find(r => r.id === selectedRoom)?.name}
                    </div>
                  </div>
                  <div>
                    <span className='text-sm text-gray-500'>Data:</span>
                    <div className='font-medium'>{formatDate(selectedDate)}</div>
                  </div>
                  <div>
                    <span className='text-sm text-gray-500'>Horário:</span>
                    <div className='font-medium'>{selectedTimeSlot}</div>
                  </div>
                </div>

                <div className='flex justify-end gap-2'>
                  <Button variant='outline'>Cancelar</Button>
                  <Button>Confirmar Alocação</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
