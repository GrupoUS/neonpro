"use client";

import type { zodResolver } from "@hookform/resolvers/zod";
import type {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  Coffee,
  Loader2,
  Pause,
  Plus,
  Save,
  Settings,
  Trash2,
} from "lucide-react";
import type { useEffect, useState } from "react";
import type { useFieldArray, useForm } from "react-hook-form";
import type { toast } from "sonner";
import * as z from "zod";
import type { Alert, AlertDescription } from "@/components/ui/alert";
import type { Badge } from "@/components/ui/badge";
import type { Button } from "@/components/ui/button";
import type {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import type { Input } from "@/components/ui/input";
import type {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Switch } from "@/components/ui/switch";
import type { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const daysOfWeek = [
  { value: "monday", label: "Segunda-feira", short: "SEG" },
  { value: "tuesday", label: "Terça-feira", short: "TER" },
  { value: "wednesday", label: "Quarta-feira", short: "QUA" },
  { value: "thursday", label: "Quinta-feira", short: "QUI" },
  { value: "friday", label: "Sexta-feira", short: "SEX" },
  { value: "saturday", label: "Sábado", short: "SAB" },
  { value: "sunday", label: "Domingo", short: "DOM" },
];

const timeSlots = Array.from({ length: 24 * 4 }, (_, i) => {
  const hour = Math.floor(i / 4);
  const minute = (i % 4) * 15;
  const time = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
  return { value: time, label: time };
});

const workingHoursSchema = z
  .object({
    day: z.string(),
    isOpen: z.boolean(),
    openTime: z.string().optional(),
    closeTime: z.string().optional(),
    breakStart: z.string().optional(),
    breakEnd: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.isOpen) {
      if (!data.openTime) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Horário de abertura é obrigatório",
          path: ["openTime"],
        });
      }
      if (!data.closeTime) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Horário de fechamento é obrigatório",
          path: ["closeTime"],
        });
      }
      if (data.openTime && data.closeTime && data.openTime >= data.closeTime) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Horário de fechamento deve ser após o de abertura",
          path: ["closeTime"],
        });
      }
      if (data.breakStart && data.breakEnd && data.breakStart >= data.breakEnd) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Fim do intervalo deve ser após o início",
          path: ["breakEnd"],
        });
      }
    }
  });

const holidaySchema = z.object({
  date: z.string(),
  name: z.string().min(1, "Nome do feriado é obrigatório"),
  isRecurring: z.boolean(),
});

const businessSettingsSchema = z.object({
  // Working Hours
  workingHours: z.array(workingHoursSchema),

  // Appointment Settings
  defaultAppointmentDuration: z.number().min(15, "Duração mínima é 15 minutos"),
  appointmentBuffer: z.number().min(0, "Buffer deve ser 0 ou maior"),
  maxAppointmentsPerDay: z.number().min(1, "Máximo deve ser pelo menos 1"),

  // Booking Rules
  advanceBookingLimit: z.number().min(0, "Limite deve ser 0 ou maior"),
  cancellationDeadline: z.number().min(0, "Prazo deve ser 0 ou maior"),
  rescheduleLimit: z.number().min(0, "Limite deve ser 0 ou maior"),

  // Automatic Confirmations
  autoConfirmBookings: z.boolean(),
  autoConfirmHours: z.number().min(0).max(168),

  // Reminders
  enableReminders: z.boolean(),
  reminderHours: z.array(z.number()),

  // No-show Policy
  noShowFee: z.number().min(0),
  noShowAfterMinutes: z.number().min(0),
  blacklistAfterNoShows: z.number().min(0),

  // Special Schedules
  holidays: z.array(holidaySchema),

  // Timezone
  timezone: z.string(),
});

type BusinessSettingsFormData = z.infer<typeof businessSettingsSchema>;

const brazilianTimezones = [
  { value: "America/Sao_Paulo", label: "Brasília (UTC-3)" },
  { value: "America/Manaus", label: "Manaus (UTC-4)" },
  { value: "America/Rio_Branco", label: "Rio Branco (UTC-5)" },
  { value: "America/Noronha", label: "Fernando de Noronha (UTC-2)" },
];

export default function BusinessSettings() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState("hours");

  const form = useForm<BusinessSettingsFormData>({
    resolver: zodResolver(businessSettingsSchema),
    defaultValues: {
      workingHours: daysOfWeek.map((day) => ({
        day: day.value,
        isOpen: day.value !== "sunday",
        openTime: "08:00",
        closeTime: "18:00",
        breakStart: "12:00",
        breakEnd: "13:00",
      })),
      defaultAppointmentDuration: 60,
      appointmentBuffer: 15,
      maxAppointmentsPerDay: 20,
      advanceBookingLimit: 30,
      cancellationDeadline: 24,
      rescheduleLimit: 2,
      autoConfirmBookings: true,
      autoConfirmHours: 2,
      enableReminders: true,
      reminderHours: [24, 2],
      noShowFee: 50.0,
      noShowAfterMinutes: 15,
      blacklistAfterNoShows: 3,
      holidays: [],
      timezone: "America/Sao_Paulo",
    },
  });

  const {
    fields: holidayFields,
    append: appendHoliday,
    remove: removeHoliday,
  } = useFieldArray({
    control: form.control,
    name: "holidays",
  });

  // Load existing settings
  useEffect(() => {
    const loadBusinessSettings = async () => {
      setIsLoading(true);
      try {
        // TODO: Replace with actual API call
        // const response = await fetch("/api/settings/business");
        // const data = await response.json();
        // form.reset(data);
      } catch (error) {
        console.error("Erro ao carregar configurações:", error);
        toast.error("Erro ao carregar configurações de funcionamento");
      } finally {
        setIsLoading(false);
      }
    };

    loadBusinessSettings();
  }, [form]);

  const onSubmit = async (data: BusinessSettingsFormData) => {
    setIsSaving(true);
    try {
      // TODO: Replace with actual API call
      // await fetch("/api/settings/business", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(data),
      // });

      setLastSaved(new Date());
      toast.success("Configurações salvas com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
      toast.error("Erro ao salvar configurações");
    } finally {
      setIsSaving(false);
    }
  };

  const copyScheduleToAll = (sourceDay: string) => {
    const sourceSchedule = form.getValues(
      `workingHours.${daysOfWeek.findIndex((d) => d.value === sourceDay)}`,
    );

    daysOfWeek.forEach((day, index) => {
      if (day.value !== sourceDay) {
        form.setValue(`workingHours.${index}`, {
          ...sourceSchedule,
          day: day.value,
        });
      }
    });

    toast.success("Horário copiado para todos os dias!");
  };

  const addBrazilianHoliday = () => {
    const currentYear = new Date().getFullYear();
    const commonHolidays = [
      { date: `${currentYear}-01-01`, name: "Confraternização Universal", isRecurring: true },
      { date: `${currentYear}-04-21`, name: "Tiradentes", isRecurring: true },
      { date: `${currentYear}-05-01`, name: "Dia do Trabalhador", isRecurring: true },
      { date: `${currentYear}-07-09`, name: "Independência do Brasil", isRecurring: true },
      { date: `${currentYear}-10-12`, name: "Nossa Senhora Aparecida", isRecurring: true },
      { date: `${currentYear}-11-02`, name: "Finados", isRecurring: true },
      { date: `${currentYear}-11-15`, name: "Proclamação da República", isRecurring: true },
      { date: `${currentYear}-12-25`, name: "Natal", isRecurring: true },
    ];

    const existingDates = form.getValues("holidays").map((h) => h.date);
    const newHolidays = commonHolidays.filter((h) => !existingDates.includes(h.date));

    newHolidays.forEach((holiday) => {
      appendHoliday(holiday);
    });

    if (newHolidays.length > 0) {
      toast.success(`${newHolidays.length} feriados nacionais adicionados!`);
    } else {
      toast.info("Todos os feriados nacionais já estão cadastrados");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Alert>
        <Clock className="h-4 w-4" />
        <AlertDescription>
          <strong>Horário de Brasília:</strong> As configurações seguem o fuso horário brasileiro.
          Certifique-se de configurar corretamente os horários de funcionamento para sua região.
        </AlertDescription>
      </Alert>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="hours" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Horários
              </TabsTrigger>
              <TabsTrigger value="appointments" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Agendamentos
              </TabsTrigger>
              <TabsTrigger value="policies" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Políticas
              </TabsTrigger>
              <TabsTrigger value="holidays" className="flex items-center gap-2">
                <Coffee className="h-4 w-4" />
                Feriados
              </TabsTrigger>
            </TabsList>

            {/* Working Hours Tab */}
            <TabsContent value="hours" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Horários de Funcionamento</CardTitle>
                  <CardDescription>
                    Configure os horários de funcionamento para cada dia da semana
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {daysOfWeek.map((day, index) => (
                    <div key={day.value} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="w-12 text-center">
                            {day.short}
                          </Badge>
                          <span className="font-medium">{day.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FormField
                            control={form.control}
                            name={`workingHours.${index}.isOpen`}
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-2">
                                <FormLabel className="text-sm">Aberto</FormLabel>
                                <FormControl>
                                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => copyScheduleToAll(day.value)}
                            disabled={!form.watch(`workingHours.${index}.isOpen`)}
                          >
                            Copiar para todos
                          </Button>
                        </div>
                      </div>

                      {form.watch(`workingHours.${index}.isOpen`) && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <FormField
                            control={form.control}
                            name={`workingHours.${index}.openTime`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Abertura</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="00:00" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {timeSlots.slice(0, timeSlots.length - 4).map((slot) => (
                                      <SelectItem key={slot.value} value={slot.value}>
                                        {slot.label}
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
                            name={`workingHours.${index}.closeTime`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Fechamento</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="00:00" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {timeSlots.slice(4).map((slot) => (
                                      <SelectItem key={slot.value} value={slot.value}>
                                        {slot.label}
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
                            name={`workingHours.${index}.breakStart`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Início Intervalo</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Sem intervalo" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="">Sem intervalo</SelectItem>
                                    {timeSlots.map((slot) => (
                                      <SelectItem key={slot.value} value={slot.value}>
                                        {slot.label}
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
                            name={`workingHours.${index}.breakEnd`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Fim Intervalo</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Sem intervalo" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="">Sem intervalo</SelectItem>
                                    {timeSlots.map((slot) => (
                                      <SelectItem key={slot.value} value={slot.value}>
                                        {slot.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      )}
                    </div>
                  ))}

                  <FormField
                    control={form.control}
                    name="timezone"
                    render={({ field }) => (
                      <FormItem className="md:w-1/2">
                        <FormLabel>Fuso Horário</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o fuso horário" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {brazilianTimezones.map((tz) => (
                              <SelectItem key={tz.value} value={tz.value}>
                                {tz.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Fuso horário utilizado para agendamentos e relatórios
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Appointments Tab */}
            <TabsContent value="appointments" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Configurações de Agendamento</CardTitle>
                  <CardDescription>Defina regras para agendamentos e consultas</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="defaultAppointmentDuration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Duração Padrão (min)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="15"
                              step="15"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 60)}
                            />
                          </FormControl>
                          <FormDescription>Duração padrão para novos agendamentos</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="appointmentBuffer"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Intervalo Entre Consultas (min)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              step="5"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormDescription>Tempo livre entre consultas</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="maxAppointmentsPerDay"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Máximo Consultas/Dia</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="1"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 20)}
                            />
                          </FormControl>
                          <FormDescription>Limite de agendamentos por dia</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="autoConfirmBookings"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Confirmação Automática</FormLabel>
                            <FormDescription>
                              Confirmar agendamentos automaticamente após o prazo
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    {form.watch("autoConfirmBookings") && (
                      <FormField
                        control={form.control}
                        name="autoConfirmHours"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirmar Após (horas)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                max="168"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 2)}
                              />
                            </FormControl>
                            <FormDescription>Horas para confirmação automática</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Policies Tab */}
            <TabsContent value="policies" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Políticas de Agendamento</CardTitle>
                  <CardDescription>
                    Configure regras de cancelamento, reagendamento e faltas
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="advanceBookingLimit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Antecedência Máxima (dias)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 30)}
                            />
                          </FormControl>
                          <FormDescription>
                            Máximo de dias para agendar (0 = ilimitado)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="cancellationDeadline"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Prazo Cancelamento (horas)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 24)}
                            />
                          </FormControl>
                          <FormDescription>Horas mínimas para cancelar sem taxa</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="rescheduleLimit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Limite de Reagendamentos</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 2)}
                            />
                          </FormControl>
                          <FormDescription>Máximo reagendamentos por consulta</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="border-t pt-6">
                    <h4 className="text-lg font-medium mb-4">Política de Faltas</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="noShowFee"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Taxa por Falta (R$)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormDescription>Taxa cobrada por falta sem aviso</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="noShowAfterMinutes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tolerância (minutos)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 15)}
                              />
                            </FormControl>
                            <FormDescription>
                              Minutos de atraso para considerar falta
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="blacklistAfterNoShows"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bloqueio Após Faltas</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 3)}
                              />
                            </FormControl>
                            <FormDescription>
                              Faltas para bloquear agendamentos (0 = nunca)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <FormField
                      control={form.control}
                      name="enableReminders"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Lembretes Automáticos</FormLabel>
                            <FormDescription>
                              Enviar lembretes por email/SMS antes das consultas
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    {form.watch("enableReminders") && (
                      <div className="mt-4">
                        <FormLabel className="text-base">Horários dos Lembretes</FormLabel>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {[1, 2, 4, 24, 48].map((hours) => (
                            <label key={hours} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={form.watch("reminderHours")?.includes(hours) || false}
                                onChange={(e) => {
                                  const current = form.getValues("reminderHours") || [];
                                  if (e.target.checked) {
                                    form.setValue("reminderHours", [...current, hours]);
                                  } else {
                                    form.setValue(
                                      "reminderHours",
                                      current.filter((h) => h !== hours),
                                    );
                                  }
                                }}
                                className="rounded border-gray-300"
                              />
                              <span className="text-sm">{hours}h antes</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Holidays Tab */}
            <TabsContent value="holidays" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Feriados e Dias de Folga</CardTitle>
                      <CardDescription>
                        Configure os dias em que a clínica não funcionará
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button type="button" variant="outline" onClick={addBrazilianHoliday}>
                        Adicionar Feriados Nacionais
                      </Button>
                      <Button
                        type="button"
                        onClick={() =>
                          appendHoliday({
                            date: "",
                            name: "",
                            isRecurring: false,
                          })
                        }
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Adicionar Feriado
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {holidayFields.length === 0 ? (
                    <div className="text-center p-8">
                      <Coffee className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Nenhum feriado cadastrado
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Adicione feriados e dias de folga da clínica
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {holidayFields.map((field, index) => (
                        <div key={field.id} className="flex items-end gap-4 p-4 border rounded-lg">
                          <FormField
                            control={form.control}
                            name={`holidays.${index}.date`}
                            render={({ field }) => (
                              <FormItem className="flex-1">
                                <FormLabel>Data</FormLabel>
                                <FormControl>
                                  <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`holidays.${index}.name`}
                            render={({ field }) => (
                              <FormItem className="flex-2">
                                <FormLabel>Nome do Feriado</FormLabel>
                                <FormControl>
                                  <Input placeholder="Natal" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`holidays.${index}.isRecurring`}
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center space-x-2">
                                <FormControl>
                                  <input
                                    type="checkbox"
                                    checked={field.value}
                                    onChange={field.onChange}
                                    className="rounded border-gray-300"
                                  />
                                </FormControl>
                                <FormLabel className="text-sm">Anual</FormLabel>
                              </FormItem>
                            )}
                          />

                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeHoliday(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Save Button */}
          <div className="sticky bottom-0 bg-white border-t p-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              {lastSaved && (
                <>
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Salvo em {lastSaved.toLocaleTimeString()}
                </>
              )}
            </div>
            <Button type="submit" disabled={isSaving} className="min-w-32">
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Configurações
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
