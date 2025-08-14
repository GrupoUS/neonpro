'use client'

import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription, 
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  User,
  Clock,
  Calendar,
  Settings,
  Coffee,
  Briefcase,
  AlertCircle,
  Plus,
  Trash2,
  Edit3
} from 'lucide-react'
import { Professional } from '@/app/appointments/page'
import { cn } from '@/lib/utils'
import moment from 'moment'
import 'moment/locale/pt-br'

moment.locale('pt-br')

interface ProfessionalScheduleProps {
  isOpen: boolean
  onClose: () => void
  professionals: Professional[]
  onProfessionalsUpdate: (professionals: Professional[]) => void
}

interface WorkingDay {
  day: number
  dayName: string
  enabled: boolean
  startTime: string
  endTime: string
  lunchStart?: string
  lunchEnd?: string
}

interface AbsencePeriod {
  id: string
  startDate: string
  endDate: string
  reason: string
  type: 'vacation' | 'sick' | 'personal' | 'training'
}

const weekDays: Omit<WorkingDay, 'enabled' | 'startTime' | 'endTime'>[] = [
  { day: 1, dayName: 'Segunda-feira' },
  { day: 2, dayName: 'Terça-feira' },
  { day: 3, dayName: 'Quarta-feira' },
  { day: 4, dayName: 'Quinta-feira' },
  { day: 5, dayName: 'Sexta-feira' },
  { day: 6, dayName: 'Sábado' },
  { day: 0, dayName: 'Domingo' }
]

const absenceTypes = [
  { value: 'vacation', label: 'Férias', color: 'bg-blue-500' },
  { value: 'sick', label: 'Atestado Médico', color: 'bg-red-500' },
  { value: 'personal', label: 'Pessoal', color: 'bg-amber-500' },
  { value: 'training', label: 'Treinamento', color: 'bg-green-500' }
]

export function ProfessionalSchedule({
  isOpen,
  onClose,
  professionals,
  onProfessionalsUpdate
}: ProfessionalScheduleProps) {
  const [selectedProfessionalId, setSelectedProfessionalId] = useState<string>(
    professionals[0]?.id || ''
  )
  const [workingDays, setWorkingDays] = useState<WorkingDay[]>([])
  const [absences, setAbsences] = useState<AbsencePeriod[]>([])
  const [newAbsence, setNewAbsence] = useState<Partial<AbsencePeriod>>({
    startDate: moment().format('YYYY-MM-DD'),
    endDate: moment().add(1, 'day').format('YYYY-MM-DD'),
    reason: '',
    type: 'vacation'
  })

  const selectedProfessional = professionals.find(p => p.id === selectedProfessionalId)

  // Initialize working days when professional changes
  React.useEffect(() => {
    if (selectedProfessional) {
      const initialDays = weekDays.map(day => ({
        ...day,
        enabled: selectedProfessional.workingHours.days.includes(day.day),
        startTime: selectedProfessional.workingHours.start,
        endTime: selectedProfessional.workingHours.end,
        lunchStart: '12:00',
        lunchEnd: '13:00'
      }))
      setWorkingDays(initialDays)
      
      // Mock absence data - in production, this would come from API
      setAbsences([
        {
          id: '1',
          startDate: moment().add(7, 'days').format('YYYY-MM-DD'),
          endDate: moment().add(10, 'days').format('YYYY-MM-DD'),
          reason: 'Férias programadas',
          type: 'vacation'
        }
      ])
    }
  }, [selectedProfessional])

  // Update working day
  const updateWorkingDay = (dayIndex: number, updates: Partial<WorkingDay>) => {
    setWorkingDays(prev => prev.map((day, index) => 
      index === dayIndex ? { ...day, ...updates } : day
    ))
  }

  // Toggle professional availability
  const toggleAvailability = (professionalId: string) => {
    onProfessionalsUpdate(
      professionals.map(p => 
        p.id === professionalId 
          ? { ...p, availability: !p.availability }
          : p
      )
    )
  }

  // Save schedule changes
  const saveSchedule = () => {
    if (!selectedProfessional) return

    const enabledDays = workingDays.filter(day => day.enabled).map(day => day.day)
    const startTime = workingDays.find(day => day.enabled)?.startTime || '08:00'
    const endTime = workingDays.find(day => day.enabled)?.endTime || '18:00'

    onProfessionalsUpdate(
      professionals.map(p => 
        p.id === selectedProfessionalId
          ? {
              ...p,
              workingHours: {
                start: startTime,
                end: endTime,
                days: enabledDays
              }
            }
          : p
      )
    )
  }

  // Add new absence
  const addAbsence = () => {
    if (!newAbsence.reason || !newAbsence.startDate || !newAbsence.endDate) return

    const absence: AbsencePeriod = {
      id: Date.now().toString(),
      startDate: newAbsence.startDate!,
      endDate: newAbsence.endDate!,
      reason: newAbsence.reason!,
      type: newAbsence.type as any
    }

    setAbsences(prev => [...prev, absence])
    setNewAbsence({
      startDate: moment().format('YYYY-MM-DD'),
      endDate: moment().add(1, 'day').format('YYYY-MM-DD'),
      reason: '',
      type: 'vacation'
    })
  }

  // Remove absence
  const removeAbsence = (absenceId: string) => {
    setAbsences(prev => prev.filter(a => a.id !== absenceId))
  }

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Gerenciar Agenda Profissional</span>
          </DialogTitle>
          <DialogDescription>
            Configure horários de trabalho, pausas e períodos de ausência
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Professional Selector */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {professionals.map((professional) => (
              <Card
                key={professional.id}
                className={cn(
                  'cursor-pointer transition-colors',
                  selectedProfessionalId === professional.id
                    ? 'ring-2 ring-primary'
                    : 'hover:bg-muted/50'
                )}
                onClick={() => setSelectedProfessionalId(professional.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: professional.color }}
                    />
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">
                        {professional.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {professional.specialization}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <Badge 
                      variant={professional.availability ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {professional.availability ? 'Ativo' : 'Inativo'}
                    </Badge>
                    <Switch
                      checked={professional.availability}
                      onCheckedChange={() => toggleAvailability(professional.id)}
                      size="sm"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {selectedProfessional && (
            <Tabs defaultValue="schedule" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="schedule">
                  <Clock className="h-4 w-4 mr-2" />
                  Horários
                </TabsTrigger>
                <TabsTrigger value="breaks">
                  <Coffee className="h-4 w-4 mr-2" />
                  Pausas
                </TabsTrigger>
                <TabsTrigger value="absences">
                  <Calendar className="h-4 w-4 mr-2" />
                  Ausências
                </TabsTrigger>
              </TabsList>

              {/* Working Schedule Tab */}
              <TabsContent value="schedule" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Horários de Trabalho</span>
                      <Badge variant="outline">
                        {selectedProfessional.name}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {workingDays.map((day, index) => (
                      <div key={day.day} className="flex items-center space-x-4 p-3 rounded-lg border">
                        <Switch
                          checked={day.enabled}
                          onCheckedChange={(checked) => 
                            updateWorkingDay(index, { enabled: checked })
                          }
                        />
                        
                        <div className="flex-1 min-w-0">
                          <Label className={cn(
                            'font-medium',
                            !day.enabled && 'text-muted-foreground'
                          )}>
                            {day.dayName}
                          </Label>
                        </div>

                        {day.enabled && (
                          <div className="flex items-center space-x-2">
                            <Input
                              type="time"
                              value={day.startTime}
                              onChange={(e) => 
                                updateWorkingDay(index, { startTime: e.target.value })
                              }
                              className="w-24"
                            />
                            <span className="text-muted-foreground">às</span>
                            <Input
                              type="time"
                              value={day.endTime}
                              onChange={(e) => 
                                updateWorkingDay(index, { endTime: e.target.value })
                              }
                              className="w-24"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Breaks Tab */}
              <TabsContent value="breaks" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Intervalos e Pausas</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {workingDays.filter(day => day.enabled).map((day, index) => (
                      <div key={day.day} className="space-y-3">
                        <Label className="font-medium">{day.dayName}</Label>
                        <div className="grid grid-cols-2 gap-4 pl-4">
                          <div className="space-y-2">
                            <Label className="text-sm text-muted-foreground">
                              Início do Almoço
                            </Label>
                            <Input
                              type="time"
                              value={day.lunchStart || '12:00'}
                              onChange={(e) => 
                                updateWorkingDay(index, { lunchStart: e.target.value })
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm text-muted-foreground">
                              Fim do Almoço
                            </Label>
                            <Input
                              type="time"
                              value={day.lunchEnd || '13:00'}
                              onChange={(e) => 
                                updateWorkingDay(index, { lunchEnd: e.target.value })
                              }
                            />
                          </div>
                        </div>
                        {index < workingDays.filter(d => d.enabled).length - 1 && (
                          <Separator />
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Absences Tab */}
              <TabsContent value="absences" className="space-y-4">
                {/* Add New Absence */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Plus className="h-4 w-4" />
                      <span>Nova Ausência</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label>Data Início</Label>
                        <Input
                          type="date"
                          value={newAbsence.startDate}
                          onChange={(e) => 
                            setNewAbsence(prev => ({ ...prev, startDate: e.target.value }))
                          }
                          min={moment().format('YYYY-MM-DD')}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Data Fim</Label>
                        <Input
                          type="date"
                          value={newAbsence.endDate}
                          onChange={(e) => 
                            setNewAbsence(prev => ({ ...prev, endDate: e.target.value }))
                          }
                          min={newAbsence.startDate}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Tipo</Label>
                        <select
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          value={newAbsence.type}
                          onChange={(e) => 
                            setNewAbsence(prev => ({ ...prev, type: e.target.value as any }))
                          }
                        >
                          {absenceTypes.map(type => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label>Motivo</Label>
                        <Input
                          placeholder="Descreva o motivo"
                          value={newAbsence.reason}
                          onChange={(e) => 
                            setNewAbsence(prev => ({ ...prev, reason: e.target.value }))
                          }
                        />
                      </div>
                    </div>
                    <Button onClick={addAbsence} size="sm">
                      <Plus className="h-3 w-3 mr-2" />
                      Adicionar Ausência
                    </Button>
                  </CardContent>
                </Card>

                {/* Existing Absences */}
                <Card>
                  <CardHeader>
                    <CardTitle>Ausências Programadas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {absences.length === 0 ? (
                      <div className="text-center text-muted-foreground py-8">
                        <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Nenhuma ausência programada</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {absences.map((absence) => {
                          const typeConfig = absenceTypes.find(t => t.value === absence.type)
                          const duration = moment(absence.endDate).diff(moment(absence.startDate), 'days') + 1
                          
                          return (
                            <div 
                              key={absence.id}
                              className="flex items-center justify-between p-4 border rounded-lg"
                            >
                              <div className="flex items-center space-x-3">
                                <div 
                                  className={cn('w-3 h-3 rounded-full', typeConfig?.color)}
                                />
                                <div>
                                  <h4 className="font-medium">{absence.reason}</h4>
                                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                    <span>
                                      {moment(absence.startDate).format('DD/MM/YYYY')} - {moment(absence.endDate).format('DD/MM/YYYY')}
                                    </span>
                                    <Badge variant="secondary" className="text-xs">
                                      {duration} dia{duration > 1 ? 's' : ''}
                                    </Badge>
                                    <Badge variant="outline" className="text-xs">
                                      {typeConfig?.label}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeAbsence(absence.id)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={() => { saveSchedule(); onClose(); }}>
            Salvar Alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}