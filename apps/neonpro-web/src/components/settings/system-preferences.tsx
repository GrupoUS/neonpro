"use client";

import type { useState, useEffect } from "react";
import type { useForm } from "react-hook-form";
import type { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import type { Button } from "@/components/ui/button";
import type { Switch } from "@/components/ui/switch";
import type {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Settings, Bell, Palette, Globe, Save, Loader2, CheckCircle2 } from "lucide-react";
import type { toast } from "sonner";

const systemPreferencesSchema = z.object({
  // UI Preferences
  ui: z.object({
    theme: z.enum(["light", "dark", "system"]),
    language: z.enum(["pt-BR", "en-US", "es-ES"]),
    dateFormat: z.enum(["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"]),
    timeFormat: z.enum(["12", "24"]),
    currency: z.enum(["BRL", "USD", "EUR"]),
    compactMode: z.boolean(),
  }),

  // Notifications
  notifications: z.object({
    email: z.object({
      enabled: z.boolean(),
      appointmentReminders: z.boolean(),
      systemAlerts: z.boolean(),
      marketingEmails: z.boolean(),
      weeklyReports: z.boolean(),
    }),
    sms: z.object({
      enabled: z.boolean(),
      appointmentReminders: z.boolean(),
      emergencyAlerts: z.boolean(),
    }),
    push: z.object({
      enabled: z.boolean(),
      appointmentReminders: z.boolean(),
      patientMessages: z.boolean(),
      systemUpdates: z.boolean(),
    }),
  }),

  // System Behavior
  system: z.object({
    autoLogout: z.boolean(),
    autoLogoutMinutes: z.number().min(5).max(480),
    requireTwoFactor: z.boolean(),
    auditLogging: z.boolean(),
    performanceMode: z.enum(["normal", "high", "low"]),
    dataRetentionDays: z.number().min(90).max(2555), // Max 7 years
  }),

  // Privacy
  privacy: z.object({
    shareAnalytics: z.boolean(),
    shareUsageData: z.boolean(),
    enableCookies: z.boolean(),
    dataProcessingConsent: z.boolean(),
  }),
});

type SystemPreferencesFormData = z.infer<typeof systemPreferencesSchema>;

export default function SystemPreferences() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const form = useForm<SystemPreferencesFormData>({
    resolver: zodResolver(systemPreferencesSchema),
    defaultValues: {
      ui: {
        theme: "light",
        language: "pt-BR",
        dateFormat: "DD/MM/YYYY",
        timeFormat: "24",
        currency: "BRL",
        compactMode: false,
      },
      notifications: {
        email: {
          enabled: true,
          appointmentReminders: true,
          systemAlerts: true,
          marketingEmails: false,
          weeklyReports: true,
        },
        sms: {
          enabled: false,
          appointmentReminders: true,
          emergencyAlerts: true,
        },
        push: {
          enabled: true,
          appointmentReminders: true,
          patientMessages: true,
          systemUpdates: false,
        },
      },
      system: {
        autoLogout: true,
        autoLogoutMinutes: 60,
        requireTwoFactor: false,
        auditLogging: true,
        performanceMode: "normal",
        dataRetentionDays: 1825, // 5 years
      },
      privacy: {
        shareAnalytics: false,
        shareUsageData: false,
        enableCookies: true,
        dataProcessingConsent: true,
      },
    },
  });

  // Load existing settings
  useEffect(() => {
    const loadSystemPreferences = async () => {
      setIsLoading(true);
      try {
        // TODO: Replace with actual API call
      } catch (error) {
        console.error("Erro ao carregar preferências:", error);
        toast.error("Erro ao carregar preferências do sistema");
      } finally {
        setIsLoading(false);
      }
    };

    loadSystemPreferences();
  }, [form]);

  const onSubmit = async (data: SystemPreferencesFormData) => {
    setIsSaving(true);
    try {
      setLastSaved(new Date());
      toast.success("Preferências do sistema salvas com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar preferências:", error);
      toast.error("Erro ao salvar preferências");
    } finally {
      setIsSaving(false);
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
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* UI Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Interface e Exibição
              </CardTitle>
              <CardDescription>Personalize a aparência e formato de exibição</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="ui.theme"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tema</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="light">Claro</SelectItem>
                          <SelectItem value="dark">Escuro</SelectItem>
                          <SelectItem value="system">Sistema</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ui.language"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Idioma</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                          <SelectItem value="en-US">English (US)</SelectItem>
                          <SelectItem value="es-ES">Español</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ui.dateFormat"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Formato de Data</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                          <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                          <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ui.timeFormat"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Formato de Hora</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="24">24 horas</SelectItem>
                          <SelectItem value="12">12 horas (AM/PM)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="ui.compactMode"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Modo Compacto</FormLabel>
                      <FormDescription>
                        Reduzir espaçamento e mostrar mais informações
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notificações
              </CardTitle>
              <CardDescription>Configure como e quando receber notificações</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium">Email</h4>

                <FormField
                  control={form.control}
                  name="notifications.email.enabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Notificações por Email</FormLabel>
                        <FormDescription>Receber notificações via email</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {form.watch("notifications.email.enabled") && (
                  <div className="ml-4 space-y-3">
                    <FormField
                      control={form.control}
                      name="notifications.email.appointmentReminders"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel>Lembretes de Consulta</FormLabel>
                            <FormDescription>Notificações sobre próximas consultas</FormDescription>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="notifications.email.systemAlerts"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel>Alertas do Sistema</FormLabel>
                            <FormDescription>
                              Notificações sobre problemas e atualizações
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="notifications.email.weeklyReports"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel>Relatórios Semanais</FormLabel>
                            <FormDescription>Resumo semanal das atividades</FormDescription>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Push Notifications</h4>

                <FormField
                  control={form.control}
                  name="notifications.push.enabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Notificações Push</FormLabel>
                        <FormDescription>Notificações instantâneas no navegador</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {form.watch("notifications.push.enabled") && (
                  <div className="ml-4 space-y-3">
                    <FormField
                      control={form.control}
                      name="notifications.push.appointmentReminders"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel>Lembretes de Consulta</FormLabel>
                            <FormDescription>Notificações sobre próximas consultas</FormDescription>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="notifications.push.patientMessages"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel>Mensagens de Pacientes</FormLabel>
                            <FormDescription>Notificações sobre novas mensagens</FormDescription>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* System Behavior */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Comportamento do Sistema
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="system.autoLogout"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Logout Automático</FormLabel>
                      <FormDescription>Desconectar automaticamente por inatividade</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              {form.watch("system.autoLogout") && (
                <FormField
                  control={form.control}
                  name="system.autoLogoutMinutes"
                  render={({ field }) => (
                    <FormItem className="md:w-1/3">
                      <FormLabel>Tempo de Inatividade (minutos)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="5"
                          max="480"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 60)}
                        />
                      </FormControl>
                      <FormDescription>Minutos de inatividade antes do logout</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="system.performanceMode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Modo de Performance</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">Baixa (economiza recursos)</SelectItem>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="high">Alta (máxima velocidade)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="system.dataRetentionDays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Retenção de Dados (dias)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="90"
                          max="2555"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 1825)}
                        />
                      </FormControl>
                      <FormDescription>
                        Tempo para manter dados arquivados (90-2555 dias)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="system.auditLogging"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Log de Auditoria</FormLabel>
                      <FormDescription>Registrar todas as ações para conformidade</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

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
                  Salvar Preferências
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
