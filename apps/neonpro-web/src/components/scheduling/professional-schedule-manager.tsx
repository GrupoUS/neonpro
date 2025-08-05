/**
 * Professional Schedule Manager Component
 * NeonPro Scheduling System
 * 
 * Comprehensive tool for managing professional availability,
 * including recurring schedules, exceptions, and breaks
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from "@/components/ui/calendar";
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Clock, 
  User, 
  Calendar as CalendarIcon, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X,
  AlertTriangle,
  CheckCircle,
  Coffee,
  Settings,
  CalendarDays,
  UserCheck,
  Moon,
  Sun
} from 'lucide-react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addDays, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Types
interface Professional {
  id: string;
  full_name: string;
  specialization?: string;
  color: string;
  is_active: boolean;
  can_work_weekends: boolean;
  default_start_time: string;
  default_end_time: string;
  default_break_start: string;
  default_break_end: string;
  service_type_ids?: string[];
}

interface ProfessionalAvailability {
  id: string;
  professional_id: string;
  day_of_week: number; // 0=Sunday, 6=Saturday
  start_time: string;
  end_time: string;
  break_start_time?: string;
  break_end_time?: string;
  is_available: boolean;
  effective_from?: string;
  effective_until?: string;
}

interface ScheduleException {
  id: string;
  professional_id: string;
  date: string;
  is_available: boolean;
  start_time?: string;
  end_time?: string;
  reason?: string;
}

interface ProfessionalScheduleManagerProps {
  professionalId?: string;
  onScheduleUpdate?: () => void;
}

const ProfessionalScheduleManager: React.FC<ProfessionalScheduleManagerProps> = ({
  professionalId,
  onScheduleUpdate
}) => {
  const [selectedProfessional, setSelectedProfessional] = useState<string>(professionalId || '');
  const [selectedWeek, setSelectedWeek] = useState<Date>(new Date());
  const [editingAvailability, setEditingAvailability] = useState<ProfessionalAvailability | null>(null);
  const [showExceptionDialog, setShowExceptionDialog] = useState(false);
  const [selectedExceptionDate, setSelectedExceptionDate] = useState<Date | null>(null);
  const [bulkUpdateMode, setBulkUpdateMode] = useState(false);

  const supabase = createClientComponentClient();
  const queryClient = useQueryClient();

  // Days of the week
  const daysOfWeek = [
    { value: 1, label: 'Segunda-feira', short: 'Seg' },
    { value: 2, label: 'Terça-feira', short: 'Ter' },
    { value: 3, label: 'Quarta-feira', short: 'Qua' },
    { value: 4, label: 'Quinta-feira', short: 'Qui' },
    { value: 5, label: 'Sexta-feira', short: 'Sex' },
    { value: 6, label: 'Sábado', short: 'Sáb' },
    { value: 0, label: 'Domingo', short: 'Dom' },
  ];

  // Fetch professionals
  const { data: professionals = [] } = useQuery({
    queryKey: ['professionals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('professionals')
        .select('*')
        .eq('is_active', true)
        .order('full_name');
      
      if (error) throw error;
      return data as Professional[];
    },
  });

  // Fetch professional availability
  const { data: availability = [], isLoading: availabilityLoading, refetch: refetchAvailability } = useQuery({
    queryKey: ['professional_availability', selectedProfessional],
    queryFn: async () => {
      if (!selectedProfessional) return [];
      
      const { data, error } = await supabase
        .from('professional_availability')
        .select('*')
        .eq('professional_id', selectedProfessional)
        .order('day_of_week');
      
      if (error) throw error;
      return data as ProfessionalAvailability[];
    },
    enabled: !!selectedProfessional,
  });

  // Get current professional data
  const currentProfessional = professionals.find(p => p.id === selectedProfessional);

  // Generate week days for display
  const weekDays = eachDayOfInterval({
    start: startOfWeek(selectedWeek, { weekStartsOn: 1 }),
    end: endOfWeek(selectedWeek, { weekStartsOn: 1 })
  });

  // Time slot options
  const timeOptions = Array.from({ length: 24 * 2 }, (_, i) => {
    const hour = Math.floor(i / 2);
    const minute = (i % 2) * 30;
    const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    return { value: time, label: time };
  });

  // Update availability mutation
  const updateAvailabilityMutation = useMutation({
    mutationFn: async (availabilityData: Partial<ProfessionalAvailability>) => {
      if (availabilityData.id) {
        // Update existing
        const { data, error } = await supabase
          .from('professional_availability')
          .update(availabilityData)
          .eq('id', availabilityData.id)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } else {
        // Create new
        const { data, error } = await supabase
          .from('professional_availability')
          .insert([availabilityData])
          .select()
          .single();
        
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professional_availability'] });
      onScheduleUpdate?.();
      setEditingAvailability(null);
    },
  });

  // Delete availability mutation
  const deleteAvailabilityMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('professional_availability')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professional_availability'] });
      onScheduleUpdate?.();
    },
  });

  // Create default schedule
  const createDefaultSchedule = async () => {
    if (!selectedProfessional) return;

    const defaultSchedule = daysOfWeek
      .filter(day => currentProfessional?.can_work_weekends || day.value !== 0 && day.value !== 6)
      .map(day => ({
        professional_id: selectedProfessional,
        day_of_week: day.value,
        start_time: currentProfessional?.default_start_time || '08:00',
        end_time: currentProfessional?.default_end_time || '18:00',
        break_start_time: currentProfessional?.default_break_start || '12:00',
        break_end_time: currentProfessional?.default_break_end || '13:00',
        is_available: true,
      }));

    try {
      const { error } = await supabase
        .from('professional_availability')
        .insert(defaultSchedule);
      
      if (error) throw error;
      refetchAvailability();
    } catch (error) {
      console.error('Error creating default schedule:', error);
    }
  };

  // Get availability for a specific day
  const getAvailabilityForDay = (dayOfWeek: number) => {
    return availability.find(a => a.day_of_week === dayOfWeek);
  };

  // Handle edit availability
  const handleEditAvailability = (dayOfWeek: number) => {
    const existingAvailability = getAvailabilityForDay(dayOfWeek);
    
    if (existingAvailability) {
      setEditingAvailability(existingAvailability);
    } else {
      setEditingAvailability({
        id: '',
        professional_id: selectedProfessional,
        day_of_week: dayOfWeek,
        start_time: '08:00',
        end_time: '18:00',
        break_start_time: '12:00',
        break_end_time: '13:00',
        is_available: true,
      });
    }
  };

  // Save availability
  const handleSaveAvailability = () => {
    if (!editingAvailability) return;
    updateAvailabilityMutation.mutate(editingAvailability);
  };

  // Bulk update all days
  const handleBulkUpdate = async (template: Partial<ProfessionalAvailability>) => {
    if (!selectedProfessional) return;

    const updates = daysOfWeek.map(day => {
      const existing = getAvailabilityForDay(day.value);
      return {
        ...(existing || { professional_id: selectedProfessional, day_of_week: day.value }),
        ...template,
      };
    });

    try {
      for (const update of updates) {
        await updateAvailabilityMutation.mutateAsync(update);
      }
    } catch (error) {
      console.error('Error bulk updating:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="w-5 h-5" />
                Gestão de Disponibilidade
              </CardTitle>
              <CardDescription>
                Configure os horários de trabalho e disponibilidade dos profissionais
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setBulkUpdateMode(!bulkUpdateMode)}
              >
                <Settings className="w-4 h-4 mr-2" />
                Edição em Lote
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Label htmlFor="professional-select">Profissional</Label>
              <Select value={selectedProfessional} onValueChange={setSelectedProfessional}>
                <SelectTrigger id="professional-select">
                  <SelectValue placeholder="Selecione um profissional" />
                </SelectTrigger>
                <SelectContent>
                  {professionals.map(professional => (
                    <SelectItem key={professional.id} value={professional.id}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: professional.color }}
                        />
                        <span>{professional.full_name}</span>
                        {professional.specialization && (
                          <span className="text-gray-500 text-sm">
                            - {professional.specialization}
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedProfessional && availability.length === 0 && (
              <Button onClick={createDefaultSchedule} variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Criar Agenda Padrão
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedProfessional && (
        <>
          {/* Bulk Update Controls */}
          {bulkUpdateMode && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Edição em Lote</CardTitle>
                <CardDescription>
                  Aplique as mesmas configurações para todos os dias da semana
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <Label>Horário de Início</Label>
                    <Select onValueChange={(value) => 
                      handleBulkUpdate({ start_time: value })
                    }>
                      <SelectTrigger>
                        <SelectValue placeholder="Início" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeOptions.slice(16, 40).map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Horário de Fim</Label>
                    <Select onValueChange={(value) => 
                      handleBulkUpdate({ end_time: value })
                    }>
                      <SelectTrigger>
                        <SelectValue placeholder="Fim" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeOptions.slice(32, 48).map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Início do Intervalo</Label>
                    <Select onValueChange={(value) => 
                      handleBulkUpdate({ break_start_time: value })
                    }>
                      <SelectTrigger>
                        <SelectValue placeholder="Intervalo" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeOptions.slice(22, 32).map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Fim do Intervalo</Label>
                    <Select onValueChange={(value) => 
                      handleBulkUpdate({ break_end_time: value })
                    }>
                      <SelectTrigger>
                        <SelectValue placeholder="Fim Intervalo" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeOptions.slice(24, 34).map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center gap-4 mt-4">
                  <Button 
                    onClick={() => handleBulkUpdate({ is_available: true })}
                    size="sm"
                    variant="outline"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Habilitar Todos os Dias
                  </Button>
                  
                  <Button 
                    onClick={() => handleBulkUpdate({ is_available: false })}
                    size="sm"
                    variant="outline"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Desabilitar Todos os Dias
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Weekly Schedule */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5" />
                Agenda Semanal
              </CardTitle>
              <CardDescription>
                Configure os horários de disponibilidade para cada dia da semana
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {availabilityLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {daysOfWeek.map(day => {
                    const dayAvailability = getAvailabilityForDay(day.value);
                    const isWeekend = day.value === 0 || day.value === 6;
                    
                    return (
                      <div 
                        key={day.value} 
                        className={`p-4 border rounded-lg ${
                          dayAvailability?.is_available ? 'bg-green-50 border-green-200' : 
                          isWeekend ? 'bg-gray-50 border-gray-200' : 'bg-red-50 border-red-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              {isWeekend ? (
                                <Moon className="w-4 h-4 text-gray-500" />
                              ) : (
                                <Sun className="w-4 h-4 text-yellow-500" />
                              )}
                              <span className="font-medium min-w-[120px]">
                                {day.label}
                              </span>
                            </div>

                            {dayAvailability ? (
                              <div className="flex items-center gap-4">
                                <Badge variant={dayAvailability.is_available ? "default" : "secondary"}>
                                  {dayAvailability.is_available ? "Disponível" : "Indisponível"}
                                </Badge>
                                
                                {dayAvailability.is_available && (
                                  <>
                                    <div className="flex items-center gap-1 text-sm">
                                      <Clock className="w-3 h-3" />
                                      {dayAvailability.start_time} - {dayAvailability.end_time}
                                    </div>
                                    
                                    {dayAvailability.break_start_time && dayAvailability.break_end_time && (
                                      <div className="flex items-center gap-1 text-sm text-gray-600">
                                        <Coffee className="w-3 h-3" />
                                        Intervalo: {dayAvailability.break_start_time} - {dayAvailability.break_end_time}
                                      </div>
                                    )}
                                  </>
                                )}
                              </div>
                            ) : (
                              <Badge variant="outline">Não configurado</Badge>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditAvailability(day.value)}
                            >
                              <Edit className="w-3 h-3 mr-1" />
                              {dayAvailability ? 'Editar' : 'Configurar'}
                            </Button>
                            
                            {dayAvailability && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => deleteAvailabilityMutation.mutate(dayAvailability.id)}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Edit Availability Dialog */}
          {editingAvailability && (
            <Dialog open={!!editingAvailability} onOpenChange={() => setEditingAvailability(null)}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    Configurar Disponibilidade - {
                      daysOfWeek.find(d => d.value === editingAvailability.day_of_week)?.label
                    }
                  </DialogTitle>
                  <DialogDescription>
                    Configure os horários de trabalho para este dia da semana
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="available"
                      checked={editingAvailability.is_available}
                      onCheckedChange={(checked) =>
                        setEditingAvailability({ ...editingAvailability, is_available: checked })
                      }
                    />
                    <Label htmlFor="available">Disponível neste dia</Label>
                  </div>

                  {editingAvailability.is_available && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Horário de Início</Label>
                          <Select
                            value={editingAvailability.start_time}
                            onValueChange={(value) =>
                              setEditingAvailability({ ...editingAvailability, start_time: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {timeOptions.slice(16, 40).map(option => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label>Horário de Fim</Label>
                          <Select
                            value={editingAvailability.end_time}
                            onValueChange={(value) =>
                              setEditingAvailability({ ...editingAvailability, end_time: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {timeOptions.slice(32, 48).map(option => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <Separator />

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Início do Intervalo</Label>
                          <Select
                            value={editingAvailability.break_start_time || ''}
                            onValueChange={(value) =>
                              setEditingAvailability({ 
                                ...editingAvailability, 
                                break_start_time: value || undefined 
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Sem intervalo" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">Sem intervalo</SelectItem>
                              {timeOptions.slice(22, 32).map(option => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label>Fim do Intervalo</Label>
                          <Select
                            value={editingAvailability.break_end_time || ''}
                            onValueChange={(value) =>
                              setEditingAvailability({ 
                                ...editingAvailability, 
                                break_end_time: value || undefined 
                              })
                            }
                            disabled={!editingAvailability.break_start_time}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Fim do intervalo" />
                            </SelectTrigger>
                            <SelectContent>
                              {timeOptions.slice(24, 34).map(option => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setEditingAvailability(null)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSaveAvailability} disabled={updateAvailabilityMutation.isPending}>
                    {updateAvailabilityMutation.isPending && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    )}
                    <Save className="w-4 h-4 mr-2" />
                    Salvar
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </>
      )}

      {!selectedProfessional && (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Selecione um Profissional
              </h3>
              <p className="text-gray-500">
                Escolha um profissional para configurar sua disponibilidade
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProfessionalScheduleManager;
