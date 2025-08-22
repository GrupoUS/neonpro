'use client';

import {
  AlertTriangle,
  Calendar,
  Clock,
  Copy,
  Edit,
  MoreVertical,
  Plus,
  RefreshCw,
  Save,
  Shield,
  Users,
  X,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import type {
  HealthcareProfessional,
  Schedule,
  ScheduleConflict,
  ShiftType,
} from '@/types/team-coordination'; // Mock schedule data for the current week

const mockScheduleData: Schedule[] = [
  {
    id: 'sched-001',
    professionalId: 'prof-001', // Dr. Maria Silva
    startTime: new Date('2024-08-21T07:00:00'),
    endTime: new Date('2024-08-21T19:00:00'),
    shiftType: 'regular',
    department: 'Cardiologia',
    location: 'Consultório 301',
    breakScheduled: true,
    shortBreaksCount: 2,
    isOvertimeShift: false,
    overtimeApprovalId: null,
    assignedPatients: ['patient-001', 'patient-002'],
    assignedEquipment: ['equip-001'],
    assignedRooms: ['room-301'],
    isEmergencyShift: false,
    isHolidayShift: false,
    isNightShift: false,
    status: 'active',
    actualStartTime: new Date('2024-08-21T07:00:00'),
    actualEndTime: null,
    noShowReason: null,
    notes: 'Consultas de rotina e ecocardiograma',
    handoffNotes: 'Paciente João - acompanhar pressão arterial',
    emergencyProtocols: ['cardiac-emergency', 'code-blue'],
    createdAt: new Date('2024-08-20'),
    updatedAt: new Date('2024-08-21'),
    createdBy: 'admin-001',
  },
  {
    id: 'sched-002',
    professionalId: 'prof-002', // Dr. Roberto Oliveira
    startTime: new Date('2024-08-21T19:00:00'),
    endTime: new Date('2024-08-22T07:00:00'),
    shiftType: 'night',
    department: 'Urgência e Emergência',
    location: 'Pronto Socorro',
    breakScheduled: true,
    shortBreaksCount: 3,
    isOvertimeShift: true, // CLT issue: over weekly limit
    overtimeApprovalId: 'approval-001',
    assignedPatients: [],
    assignedEquipment: ['equip-emergency-001', 'equip-emergency-002'],
    assignedRooms: ['emergency-room-01', 'trauma-bay-01'],
    isEmergencyShift: true,
    isHolidayShift: false,
    isNightShift: true,
    status: 'active',
    actualStartTime: new Date('2024-08-21T19:00:00'),
    actualEndTime: null,
    noShowReason: null,
    notes: 'Plantão noturno - cobertura emergência',
    handoffNotes: 'Atenção para casos de trauma',
    emergencyProtocols: [
      'trauma-protocol',
      'cardiac-arrest',
      'stroke-protocol',
    ],
    createdAt: new Date('2024-08-20'),
    updatedAt: new Date('2024-08-21'),
    createdBy: 'admin-001',
  },
  {
    id: 'sched-003',
    professionalId: 'prof-003', // Enf. Ana Paula
    startTime: new Date('2024-08-21T07:00:00'),
    endTime: new Date('2024-08-21T19:00:00'),
    shiftType: 'regular',
    department: 'UTI',
    location: 'UTI - Setor A',
    breakScheduled: true,
    shortBreaksCount: 2,
    isOvertimeShift: false,
    overtimeApprovalId: null,
    assignedPatients: ['patient-uti-001', 'patient-uti-002', 'patient-uti-003'],
    assignedEquipment: ['ventilator-001', 'monitor-001'],
    assignedRooms: ['uti-bed-05', 'uti-bed-06'],
    isEmergencyShift: false,
    isHolidayShift: false,
    isNightShift: false,
    status: 'active',
    actualStartTime: new Date('2024-08-21T07:00:00'),
    actualEndTime: null,
    noShowReason: null,
    notes: 'Cuidados intensivos - pacientes críticos',
    handoffNotes:
      'Paciente leito 05: ventilação mecânica, monitorar gasometria',
    emergencyProtocols: ['icu-emergency', 'ventilator-emergency'],
    createdAt: new Date('2024-08-20'),
    updatedAt: new Date('2024-08-21'),
    createdBy: 'admin-001',
  },
]; // Mock staff data (simplified for scheduling)
const mockStaffForScheduling = [
  {
    id: 'prof-001',
    name: 'Dra. Maria Silva',
    role: 'medico',
    department: 'Cardiologia',
  },
  {
    id: 'prof-002',
    name: 'Dr. Roberto Oliveira',
    role: 'medico',
    department: 'Urgência e Emergência',
  },
  {
    id: 'prof-003',
    name: 'Enf. Ana Paula',
    role: 'enfermeiro',
    department: 'UTI',
  },
  {
    id: 'prof-004',
    name: 'Dr. Carlos Lima',
    role: 'medico',
    department: 'Cardiologia',
  },
  {
    id: 'prof-005',
    name: 'Enf. Sandra Costa',
    role: 'enfermeiro',
    department: 'Urgência e Emergência',
  },
];

// Mock schedule conflicts
const mockConflicts: ScheduleConflict[] = [
  {
    id: 'conflict-001',
    type: 'clt_violation',
    severity: 'high',
    description:
      'Dr. Roberto Oliveira excedendo limite semanal de 44h (46h programadas)',
    affectedSchedules: ['sched-002'],
    suggestedResolution:
      'Redistribuir 2h para outro profissional ou aprovar horas extras',
    resolutionRequired: true,
    resolvedAt: null,
    resolvedBy: null,
    createdAt: new Date('2024-08-21T10:00:00'),
  },
  {
    id: 'conflict-002',
    type: 'equipment_conflict',
    severity: 'medium',
    description:
      'Monitor ECG-001 atribuído para 2 profissionais no mesmo horário',
    affectedSchedules: ['sched-001', 'sched-004'],
    suggestedResolution: 'Realocar equipamento ou usar monitor alternativo',
    resolutionRequired: true,
    resolvedAt: null,
    resolvedBy: null,
    createdAt: new Date('2024-08-21T11:30:00'),
  },
];

// Time slots for the schedule grid (24 hours, 1-hour intervals)
const timeSlots = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, '0');
  return `${hour}:00`;
});

// Days of the week
const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

// Shift type colors and labels
const shiftTypeInfo = {
  regular: {
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    label: 'Regular',
  },
  emergency: {
    color: 'bg-red-100 text-red-800 border-red-200',
    label: 'Emergência',
  },
  on_call: {
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    label: 'Sobreaviso',
  },
  night: {
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    label: 'Noturno',
  },
  weekend: {
    color: 'bg-green-100 text-green-800 border-green-200',
    label: 'Fim de Semana',
  },
  holiday: {
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    label: 'Feriado',
  },
};

interface SchedulingSystemProps {
  emergencyMode?: boolean;
}

export function SchedulingSystem({
  emergencyMode = false,
}: SchedulingSystemProps) {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'week' | 'day'>('week');
  const [draggedSchedule, setDraggedSchedule] = useState<Schedule | null>(null);
  const [showConflicts, setShowConflicts] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(
    null
  ); // Filter schedules by department
  const filteredSchedules = useMemo(() => {
    if (selectedDepartment === 'all') return mockScheduleData;
    return mockScheduleData.filter(
      (schedule) => schedule.department === selectedDepartment
    );
  }, [selectedDepartment]);

  // Get unique departments
  const departments = useMemo(() => {
    return Array.from(
      new Set(mockScheduleData.map((schedule) => schedule.department))
    );
  }, []);

  // Generate week dates
  const weekDates = useMemo(() => {
    const startOfWeek = new Date(currentWeek);
    startOfWeek.setDate(currentWeek.getDate() - currentWeek.getDay());

    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      return date;
    });
  }, [currentWeek]);

  // Handle drag operations
  const handleDragStart = (schedule: Schedule) => {
    setDraggedSchedule(schedule);
  };

  const handleDragEnd = () => {
    setDraggedSchedule(null);
  };

  const handleDrop = (targetDate: Date, targetHour: number) => {
    if (!draggedSchedule) return;

    // Create new schedule with updated time
    const newStartTime = new Date(targetDate);
    newStartTime.setHours(targetHour, 0, 0, 0);

    const duration =
      draggedSchedule.endTime.getTime() - draggedSchedule.startTime.getTime();
    const newEndTime = new Date(newStartTime.getTime() + duration);

    // Here you would typically validate CLT compliance and check for conflicts
    console.log('Moving schedule:', {
      scheduleId: draggedSchedule.id,
      newStartTime,
      newEndTime,
      originalStart: draggedSchedule.startTime,
      originalEnd: draggedSchedule.endTime,
    });

    // TODO: Implement actual schedule update logic
    setDraggedSchedule(null);
  };
  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
        <div>
          <h2 className="font-bold text-2xl">Gestão de Escalas</h2>
          <p className="text-muted-foreground">
            Sistema de escalas com compliance CLT e protocolos de emergência
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button size="sm" variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Atualizar
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700" size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Nova Escala
          </Button>
          {emergencyMode && (
            <Button size="sm" variant="destructive">
              <Shield className="mr-2 h-4 w-4" />
              Escala Emergência
            </Button>
          )}
        </div>
      </div>
      {/* Controls and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Controles de Visualização</CardTitle>
          <CardDescription>
            Navegue pela semana e filtre por departamento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Week Navigation */}
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => {
                  const prevWeek = new Date(currentWeek);
                  prevWeek.setDate(currentWeek.getDate() - 7);
                  setCurrentWeek(prevWeek);
                }}
                size="sm"
                variant="outline"
              >
                ‹ Anterior
              </Button>
              <span className="whitespace-nowrap font-medium text-sm">
                {weekDates[0].toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                })}{' '}
                -{' '}
                {weekDates[6].toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                })}
              </span>
              <Button
                onClick={() => {
                  const nextWeek = new Date(currentWeek);
                  nextWeek.setDate(currentWeek.getDate() + 7);
                  setCurrentWeek(nextWeek);
                }}
                size="sm"
                variant="outline"
              >
                Próxima ›
              </Button>
            </div>{' '}
            {/* Department Filter */}
            <Select
              onValueChange={setSelectedDepartment}
              value={selectedDepartment}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filtrar Departamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Departamentos</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {/* View Mode */}
            <Select
              onValueChange={(value) => setViewMode(value as 'week' | 'day')}
              value={viewMode}
            >
              <SelectTrigger>
                <SelectValue placeholder="Modo de Visualização" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Visão Semanal</SelectItem>
                <SelectItem value="day">Visão Diária</SelectItem>
              </SelectContent>
            </Select>
            {/* Quick Actions */}
            <div className="flex items-center space-x-2">
              <Button
                className="text-xs"
                onClick={() => setShowConflicts(!showConflicts)}
                size="sm"
                variant={showConflicts ? 'default' : 'outline'}
              >
                <AlertTriangle className="mr-1 h-3 w-3" />
                Conflitos
              </Button>
              <Button className="text-xs" size="sm" variant="outline">
                <Save className="mr-1 h-3 w-3" />
                Salvar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Conflict Alerts */}
      {showConflicts && mockConflicts.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-semibold text-lg">Conflitos e Alertas CLT</h3>
          <div className="grid gap-3 md:grid-cols-2">
            {mockConflicts.map((conflict) => (
              <Alert
                className={`${
                  conflict.severity === 'high'
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                    : 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
                }`}
                key={conflict.id}
              >
                <AlertTriangle
                  className={`h-4 w-4 ${
                    conflict.severity === 'high'
                      ? 'text-red-600'
                      : 'text-yellow-600'
                  }`}
                />
                <AlertDescription
                  className={
                    conflict.severity === 'high'
                      ? 'text-red-700 dark:text-red-300'
                      : 'text-yellow-700 dark:text-yellow-300'
                  }
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">
                        {conflict.description}
                      </span>
                      <Badge
                        variant={
                          conflict.severity === 'high'
                            ? 'destructive'
                            : 'secondary'
                        }
                      >
                        {conflict.type}
                      </Badge>
                    </div>
                    <p className="text-xs opacity-80">
                      Sugestão: {conflict.suggestedResolution}
                    </p>
                    <div className="flex items-center space-x-2">
                      <Button
                        className="h-6 text-xs"
                        size="sm"
                        variant="outline"
                      >
                        Resolver
                      </Button>
                      <Button className="h-6 text-xs" size="sm" variant="ghost">
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            ))}
          </div>
        </div>
      )}{' '}
      {/* Schedule Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Escala Semanal</CardTitle>
          <CardDescription>
            Arraste e solte para reorganizar turnos. Sistema valida
            automaticamente compliance CLT.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="grid min-w-[800px] grid-cols-8 gap-1">
              {/* Header Row */}
              <div className="bg-muted p-2 text-center font-medium text-sm">
                Horário
              </div>
              {weekDates.map((date, index) => (
                <div
                  className="bg-muted p-2 text-center font-medium text-sm"
                  key={index}
                >
                  <div>{weekDays[index]}</div>
                  <div className="text-muted-foreground text-xs">
                    {date.toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                    })}
                  </div>
                </div>
              ))}

              {/* Time Slots Grid */}
              {timeSlots.map((timeSlot, hourIndex) => (
                <div className="contents" key={timeSlot}>
                  {/* Time Column */}
                  <div className="border bg-background p-2 text-center text-xs">
                    {timeSlot}
                  </div>

                  {/* Day Columns */}
                  {weekDates.map((date, dayIndex) => {
                    // Find schedules that overlap with this time slot
                    const daySchedules = filteredSchedules.filter(
                      (schedule) => {
                        const scheduleDate = new Date(schedule.startTime);
                        const isSameDay =
                          scheduleDate.toDateString() === date.toDateString();
                        const scheduleHour = scheduleDate.getHours();
                        const scheduleEndHour = new Date(
                          schedule.endTime
                        ).getHours();

                        return (
                          isSameDay &&
                          hourIndex >= scheduleHour &&
                          hourIndex < scheduleEndHour
                        );
                      }
                    );

                    return (
                      <div
                        className="relative min-h-[60px] border border-border/50 bg-background"
                        key={`${timeSlot}-${dayIndex}`}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() => handleDrop(date, hourIndex)}
                      >
                        {/* Render schedule blocks */}
                        {daySchedules.map((schedule) => {
                          const staff = mockStaffForScheduling.find(
                            (s) => s.id === schedule.professionalId
                          );
                          const shiftInfo = shiftTypeInfo[schedule.shiftType];
                          const isFirstHourOfShift =
                            new Date(schedule.startTime).getHours() ===
                            hourIndex;

                          if (!isFirstHourOfShift) return null; // Only render on first hour

                          const durationHours =
                            (new Date(schedule.endTime).getTime() -
                              new Date(schedule.startTime).getTime()) /
                            (1000 * 60 * 60);

                          return (
                            <div
                              className={`absolute inset-x-1 top-1 cursor-move rounded-md border-2 p-1 transition-shadow hover:shadow-md ${shiftInfo.color}`}
                              draggable
                              key={schedule.id}
                              onClick={() => {
                                setSelectedSchedule(schedule);
                                setIsEditDialogOpen(true);
                              }}
                              onDragEnd={handleDragEnd}
                              onDragStart={() => handleDragStart(schedule)}
                              style={{
                                height: `${durationHours * 60 - 8}px`, // 60px per hour minus gaps
                                zIndex: 10,
                              }}
                            >
                              <div className="truncate font-medium text-xs">
                                {staff?.name || 'Profissional'}
                              </div>
                              <div className="truncate text-muted-foreground text-xs">
                                {schedule.location}
                              </div>
                              <div className="mt-1 flex items-center space-x-1">
                                <Badge
                                  className="px-1 py-0 text-xs"
                                  variant="outline"
                                >
                                  {shiftInfo.label}
                                </Badge>
                                {schedule.isOvertimeShift && (
                                  <AlertTriangle className="h-3 w-3 text-yellow-600" />
                                )}
                                {schedule.isEmergencyShift && (
                                  <Shield className="h-3 w-3 text-red-600" />
                                )}
                              </div>
                            </div>
                          );
                        })}

                        {/* Empty slot indicator */}
                        {daySchedules.length === 0 && (
                          <div className="flex h-full w-full items-center justify-center opacity-0 transition-opacity hover:opacity-100">
                            <Plus className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
