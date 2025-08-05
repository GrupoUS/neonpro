"use client";

// =============================================
// NeonPro Professional Schedule Management
// Story 1.2: Business rules configuration
// =============================================

import type { ProfessionalSchedule, WorkingHoursConfig } from "@/app/lib/types/conflict-prevention";
import type { Badge } from "@/components/ui/badge";
import type { Button } from "@/components/ui/button";
import type { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Input } from "@/components/ui/input";
import type { Label } from "@/components/ui/label";
import type { Switch } from "@/components/ui/switch";
import type { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { AlertTriangle, Clock, Plus, Save, Settings, User } from "lucide-react";
import type { useEffect, useState } from "react";
import type { toast } from "sonner";

interface ProfessionalScheduleManagerProps {
  professionalId: string;
  professionalName?: string;
  clinicId: string;
  onSave?: (config: WorkingHoursConfig) => void;
}

const DAYS_OF_WEEK = [
  { value: 0, label: "Domingo", short: "Dom" },
  { value: 1, label: "Segunda-feira", short: "Seg" },
  { value: 2, label: "Terça-feira", short: "Ter" },
  { value: 3, label: "Quarta-feira", short: "Qua" },
  { value: 4, label: "Quinta-feira", short: "Qui" },
  { value: 5, label: "Sexta-feira", short: "Sex" },
  { value: 6, label: "Sábado", short: "Sáb" },
];

export function ProfessionalScheduleManager({
  professionalId,
  professionalName = "Professional",
  clinicId,
  onSave,
}: ProfessionalScheduleManagerProps) {
  // State management
  const [schedules, setSchedules] = useState<ProfessionalSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("schedule");
  const [globalSettings, setGlobalSettings] = useState({
    min_booking_notice_hours: 2,
    max_booking_days_ahead: 90,
    buffer_minutes_between: 15,
    max_appointments_per_hour: 4,
  });

  // Initialize schedules for all days if not exist
  useEffect(() => {
    initializeSchedules();
  }, [professionalId, clinicId]);

  const initializeSchedules = async () => {
    try {
      setIsLoading(true);

      // Try to fetch existing schedules
      const response = await fetch(`/api/professionals/${professionalId}/schedules`);

      if (response.ok) {
        const existingSchedules = await response.json();
        setSchedules(existingSchedules);
      } else {
        // Create default schedules for weekdays (Monday-Friday)
        const defaultSchedules: ProfessionalSchedule[] = DAYS_OF_WEEK.map((day) => ({
          id: `temp-${day.value}`,
          professional_id: professionalId,
          clinic_id: clinicId,
          day_of_week: day.value,
          start_time: day.value >= 1 && day.value <= 5 ? "08:00" : "09:00", // Earlier start on weekdays
          end_time: day.value >= 1 && day.value <= 5 ? "18:00" : "17:00",
          break_start_time: "12:00",
          break_end_time: "13:00",
          is_available: day.value >= 1 && day.value <= 5, // Only weekdays available by default
          max_appointments_per_hour: 4,
          buffer_minutes_between: 15,
          min_booking_notice_hours: 2,
          max_booking_days_ahead: 90,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }));

        setSchedules(defaultSchedules);
      }
    } catch (error) {
      console.error("Error loading schedules:", error);
      toast.error("Erro ao carregar horários");
    } finally {
      setIsLoading(false);
    }
  };

  const updateSchedule = (dayOfWeek: number, updates: Partial<ProfessionalSchedule>) => {
    setSchedules((prev) =>
      prev.map((schedule) =>
        schedule.day_of_week === dayOfWeek
          ? { ...schedule, ...updates, updated_at: new Date().toISOString() }
          : schedule,
      ),
    );
  };

  const saveSchedules = async () => {
    try {
      setIsSaving(true);

      const config: WorkingHoursConfig = {
        professional_id: professionalId,
        schedules: schedules.map((s) => ({
          day_of_week: s.day_of_week,
          start_time: s.start_time,
          end_time: s.end_time,
          break_start_time: s.break_start_time,
          break_end_time: s.break_end_time,
          is_available: s.is_available,
          max_appointments_per_hour: s.max_appointments_per_hour,
          buffer_minutes_between: s.buffer_minutes_between,
        })),
        default_settings: globalSettings,
      };

      const response = await fetch(`/api/professionals/${professionalId}/schedules`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        throw new Error("Failed to save schedules");
      }

      toast.success("Horários salvos com sucesso!");
      onSave?.(config);
    } catch (error) {
      console.error("Error saving schedules:", error);
      toast.error("Erro ao salvar horários");
    } finally {
      setIsSaving(false);
    }
  };

  const copyScheduleToAll = (sourceDay: number) => {
    const sourceSchedule = schedules.find((s) => s.day_of_week === sourceDay);
    if (!sourceSchedule) return;

    setSchedules((prev) =>
      prev.map((schedule) => ({
        ...schedule,
        start_time: sourceSchedule.start_time,
        end_time: sourceSchedule.end_time,
        break_start_time: sourceSchedule.break_start_time,
        break_end_time: sourceSchedule.break_end_time,
        max_appointments_per_hour: sourceSchedule.max_appointments_per_hour,
        buffer_minutes_between: sourceSchedule.buffer_minutes_between,
        updated_at: new Date().toISOString(),
      })),
    );

    toast.success("Horário copiado para todos os dias");
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 animate-spin" />
            <span>Carregando horários...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Horários de {professionalName}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="schedule">Agenda Semanal</TabsTrigger>
            <TabsTrigger value="settings">Configurações</TabsTrigger>
          </TabsList>

          <TabsContent value="schedule" className="space-y-4">
            <div className="grid gap-4">
              {DAYS_OF_WEEK.map((day) => {
                const schedule = schedules.find((s) => s.day_of_week === day.value);
                if (!schedule) return null;

                return (
                  <Card key={day.value} className={schedule.is_available ? "" : "opacity-60"}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Badge variant={schedule.is_available ? "default" : "secondary"}>
                            {day.short}
                          </Badge>
                          <span className="font-medium">{day.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={schedule.is_available}
                            onCheckedChange={(checked) =>
                              updateSchedule(day.value, {
                                is_available: checked,
                              })
                            }
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyScheduleToAll(day.value)}
                            title="Copiar para todos os dias"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      {schedule.is_available && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <Label htmlFor={`start-${day.value}`}>Início</Label>
                            <Input
                              id={`start-${day.value}`}
                              type="time"
                              value={schedule.start_time}
                              onChange={(e) =>
                                updateSchedule(day.value, {
                                  start_time: e.target.value,
                                })
                              }
                            />
                          </div>
                          <div>
                            <Label htmlFor={`end-${day.value}`}>Fim</Label>
                            <Input
                              id={`end-${day.value}`}
                              type="time"
                              value={schedule.end_time}
                              onChange={(e) =>
                                updateSchedule(day.value, {
                                  end_time: e.target.value,
                                })
                              }
                            />
                          </div>
                          <div>
                            <Label htmlFor={`break-start-${day.value}`}>Pausa início</Label>
                            <Input
                              id={`break-start-${day.value}`}
                              type="time"
                              value={schedule.break_start_time || ""}
                              onChange={(e) =>
                                updateSchedule(day.value, {
                                  break_start_time: e.target.value || undefined,
                                })
                              }
                            />
                          </div>
                          <div>
                            <Label htmlFor={`break-end-${day.value}`}>Pausa fim</Label>
                            <Input
                              id={`break-end-${day.value}`}
                              type="time"
                              value={schedule.break_end_time || ""}
                              onChange={(e) =>
                                updateSchedule(day.value, {
                                  break_end_time: e.target.value || undefined,
                                })
                              }
                            />
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Settings className="h-4 w-4" />
                    Configurações de Agendamento
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="min-notice">Aviso mínimo (horas)</Label>
                      <Input
                        id="min-notice"
                        type="number"
                        min="0"
                        max="168"
                        value={globalSettings.min_booking_notice_hours}
                        onChange={(e) =>
                          setGlobalSettings((prev) => ({
                            ...prev,
                            min_booking_notice_hours: parseInt(e.target.value) || 0,
                          }))
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="max-days">Máximo de dias antecedência</Label>
                      <Input
                        id="max-days"
                        type="number"
                        min="1"
                        max="365"
                        value={globalSettings.max_booking_days_ahead}
                        onChange={(e) =>
                          setGlobalSettings((prev) => ({
                            ...prev,
                            max_booking_days_ahead: parseInt(e.target.value) || 1,
                          }))
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="buffer-minutes">Buffer entre consultas (min)</Label>
                      <Input
                        id="buffer-minutes"
                        type="number"
                        min="0"
                        max="120"
                        value={globalSettings.buffer_minutes_between}
                        onChange={(e) =>
                          setGlobalSettings((prev) => ({
                            ...prev,
                            buffer_minutes_between: parseInt(e.target.value) || 0,
                          }))
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="max-per-hour">Máx. consultas por hora</Label>
                      <Input
                        id="max-per-hour"
                        type="number"
                        min="1"
                        max="20"
                        value={globalSettings.max_appointments_per_hour}
                        onChange={(e) =>
                          setGlobalSettings((prev) => ({
                            ...prev,
                            max_appointments_per_hour: parseInt(e.target.value) || 1,
                          }))
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    Resumo das Configurações
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <p>
                      <strong>Dias disponíveis:</strong>{" "}
                      {schedules.filter((s) => s.is_available).length} de 7
                    </p>
                    <p>
                      <strong>Aviso mínimo:</strong> {globalSettings.min_booking_notice_hours} horas
                    </p>
                    <p>
                      <strong>Antecedência máxima:</strong> {globalSettings.max_booking_days_ahead}{" "}
                      dias
                    </p>
                    <p>
                      <strong>Buffer entre consultas:</strong>{" "}
                      {globalSettings.buffer_minutes_between} minutos
                    </p>
                    <p>
                      <strong>Capacidade por hora:</strong>{" "}
                      {globalSettings.max_appointments_per_hour} consultas
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 mt-6">
          <Button onClick={saveSchedules} disabled={isSaving} className="min-w-[120px]">
            {isSaving ? (
              <Clock className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {isSaving ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
