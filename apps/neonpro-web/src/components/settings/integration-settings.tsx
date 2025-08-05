"use client";

import type { zodResolver } from "@hookform/resolvers/zod";
import type {
  CheckCircle2,
  ExternalLink,
  Loader2,
  Mail,
  MessageSquare,
  Phone,
  Plug,
  Save,
  TestTube,
  XCircle,
} from "lucide-react";
import type { useEffect, useState } from "react";
import type { useForm } from "react-hook-form";
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
import type { Switch } from "@/components/ui/switch";
import type { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const integrationSettingsSchema = z.object({
  // WhatsApp Business
  whatsapp: z.object({
    enabled: z.boolean(),
    phoneNumber: z.string().optional(),
    businessAccountId: z.string().optional(),
    accessToken: z.string().optional(),
    webhookUrl: z.string().url("URL inválida").optional().or(z.literal("")),
    enableAppointmentReminders: z.boolean(),
    enableConfirmations: z.boolean(),
    enableStatusUpdates: z.boolean(),
  }),

  // Email
  email: z.object({
    enabled: z.boolean(),
    provider: z.enum(["smtp", "sendgrid", "ses", "mailgun"]),
    smtpHost: z.string().optional(),
    smtpPort: z.number().optional(),
    smtpUser: z.string().optional(),
    smtpPassword: z.string().optional(),
    apiKey: z.string().optional(),
    fromName: z.string().optional(),
    fromEmail: z.string().email("Email inválido").optional().or(z.literal("")),
    enableAppointmentReminders: z.boolean(),
    enableNewsletters: z.boolean(),
    enableTransactional: z.boolean(),
  }),

  // SMS
  sms: z.object({
    enabled: z.boolean(),
    provider: z.enum(["twilio", "zenvia", "totalvoice"]),
    accountSid: z.string().optional(),
    authToken: z.string().optional(),
    fromNumber: z.string().optional(),
    enableAppointmentReminders: z.boolean(),
    enableConfirmations: z.boolean(),
    enableEmergencyAlerts: z.boolean(),
  }),

  // Calendar Integration
  calendar: z.object({
    googleCalendar: z.object({
      enabled: z.boolean(),
      clientId: z.string().optional(),
      clientSecret: z.string().optional(),
      refreshToken: z.string().optional(),
    }),
    outlookCalendar: z.object({
      enabled: z.boolean(),
      clientId: z.string().optional(),
      clientSecret: z.string().optional(),
      tenantId: z.string().optional(),
    }),
  }),

  // Payment Gateways
  paymentGateways: z.object({
    pixApiKey: z.string().optional(),
    mercadoPagoAccessToken: z.string().optional(),
    pagarmeApiKey: z.string().optional(),
    webhookSecret: z.string().optional(),
  }),
});

type IntegrationSettingsFormData = z.infer<typeof integrationSettingsSchema>;

export default function IntegrationSettings() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState("whatsapp");
  const [connectionStatus, setConnectionStatus] = useState<Record<string, boolean>>({});

  const form = useForm<IntegrationSettingsFormData>({
    resolver: zodResolver(integrationSettingsSchema),
    defaultValues: {
      whatsapp: {
        enabled: false,
        phoneNumber: "",
        businessAccountId: "",
        accessToken: "",
        webhookUrl: "",
        enableAppointmentReminders: true,
        enableConfirmations: true,
        enableStatusUpdates: false,
      },
      email: {
        enabled: false,
        provider: "smtp",
        smtpHost: "",
        smtpPort: 587,
        smtpUser: "",
        smtpPassword: "",
        apiKey: "",
        fromName: "",
        fromEmail: "",
        enableAppointmentReminders: true,
        enableNewsletters: false,
        enableTransactional: true,
      },
      sms: {
        enabled: false,
        provider: "zenvia",
        accountSid: "",
        authToken: "",
        fromNumber: "",
        enableAppointmentReminders: true,
        enableConfirmations: true,
        enableEmergencyAlerts: false,
      },
      calendar: {
        googleCalendar: {
          enabled: false,
          clientId: "",
          clientSecret: "",
          refreshToken: "",
        },
        outlookCalendar: {
          enabled: false,
          clientId: "",
          clientSecret: "",
          tenantId: "",
        },
      },
      paymentGateways: {
        pixApiKey: "",
        mercadoPagoAccessToken: "",
        pagarmeApiKey: "",
        webhookSecret: "",
      },
    },
  });

  // Load existing settings
  useEffect(() => {
    const loadIntegrationSettings = async () => {
      setIsLoading(true);
      try {
        // TODO: Replace with actual API call
        // const response = await fetch("/api/settings/integrations");
        // const data = await response.json();
        // form.reset(data);
      } catch (error) {
        console.error("Erro ao carregar integrações:", error);
        toast.error("Erro ao carregar configurações de integração");
      } finally {
        setIsLoading(false);
      }
    };

    loadIntegrationSettings();
  }, [form]);

  const onSubmit = async (data: IntegrationSettingsFormData) => {
    setIsSaving(true);
    try {
      // TODO: Replace with actual API call
      // await fetch("/api/settings/integrations", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(data),
      // });

      setLastSaved(new Date());
      toast.success("Configurações de integração salvas com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
      toast.error("Erro ao salvar configurações");
    } finally {
      setIsSaving(false);
    }
  };

  const testConnection = async (service: string) => {
    try {
      setConnectionStatus((prev) => ({ ...prev, [service]: false }));

      // TODO: Replace with actual API call
      // const response = await fetch(`/api/integrations/test/${service}`, {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(form.getValues()),
      // });

      // Mock success for demo
      setTimeout(() => {
        setConnectionStatus((prev) => ({ ...prev, [service]: true }));
        toast.success(`Conexão com ${service} testada com sucesso!`);
      }, 2000);
    } catch (error) {
      setConnectionStatus((prev) => ({ ...prev, [service]: false }));
      toast.error(`Erro ao testar conexão com ${service}`);
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
        <Plug className="h-4 w-4" />
        <AlertDescription>
          <strong>Integrações:</strong> Configure APIs e serviços externos para automatizar
          comunicações e melhorar a experiência do paciente.
        </AlertDescription>
      </Alert>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="whatsapp" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                WhatsApp
              </TabsTrigger>
              <TabsTrigger value="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </TabsTrigger>
              <TabsTrigger value="sms" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                SMS
              </TabsTrigger>
              <TabsTrigger value="others" className="flex items-center gap-2">
                <Plug className="h-4 w-4" />
                Outros
              </TabsTrigger>
            </TabsList>

            {/* WhatsApp Tab */}
            <TabsContent value="whatsapp" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5" />
                        WhatsApp Business
                      </CardTitle>
                      <CardDescription>
                        Integração com WhatsApp Business API para comunicação com pacientes
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {connectionStatus.whatsapp !== undefined && (
                        <Badge
                          className={
                            connectionStatus.whatsapp
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }
                        >
                          {connectionStatus.whatsapp ? (
                            <>
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Conectado
                            </>
                          ) : (
                            <>
                              <XCircle className="h-3 w-3 mr-1" />
                              Erro na conexão
                            </>
                          )}
                        </Badge>
                      )}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => testConnection("whatsapp")}
                        disabled={!form.watch("whatsapp.enabled")}
                      >
                        <TestTube className="h-4 w-4 mr-2" />
                        Testar Conexão
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="whatsapp.enabled"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Habilitar WhatsApp Business</FormLabel>
                          <FormDescription>
                            Ativar integração com WhatsApp para comunicação automatizada
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {form.watch("whatsapp.enabled") && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="whatsapp.phoneNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Número do WhatsApp Business</FormLabel>
                              <FormControl>
                                <Input placeholder="+55 11 99999-9999" {...field} />
                              </FormControl>
                              <FormDescription>
                                Número registrado no WhatsApp Business
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="whatsapp.businessAccountId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Business Account ID</FormLabel>
                              <FormControl>
                                <Input placeholder="1234567890123456" {...field} />
                              </FormControl>
                              <FormDescription>ID da conta business do WhatsApp</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="whatsapp.accessToken"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Access Token</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="EAABsBCS..." {...field} />
                            </FormControl>
                            <FormDescription>
                              Token de acesso do WhatsApp Business API
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="whatsapp.webhookUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Webhook URL</FormLabel>
                            <FormControl>
                              <Input placeholder="https://suaapi.com/webhook/whatsapp" {...field} />
                            </FormControl>
                            <FormDescription>
                              URL para receber callbacks do WhatsApp
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="space-y-4">
                        <h4 className="font-medium">Funcionalidades</h4>

                        <FormField
                          control={form.control}
                          name="whatsapp.enableAppointmentReminders"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                              <div className="space-y-0.5">
                                <FormLabel>Lembretes de Consulta</FormLabel>
                                <FormDescription>
                                  Enviar lembretes automáticos por WhatsApp
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
                          name="whatsapp.enableConfirmations"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                              <div className="space-y-0.5">
                                <FormLabel>Confirmações de Agendamento</FormLabel>
                                <FormDescription>Solicitar confirmação de presença</FormDescription>
                              </div>
                              <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="whatsapp.enableStatusUpdates"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                              <div className="space-y-0.5">
                                <FormLabel>Atualizações de Status</FormLabel>
                                <FormDescription>
                                  Notificar mudanças no status da consulta
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Email Tab */}
            <TabsContent value="email" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Mail className="h-5 w-5" />
                        Email Marketing
                      </CardTitle>
                      <CardDescription>Configuração de SMTP e provedores de email</CardDescription>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => testConnection("email")}
                      disabled={!form.watch("email.enabled")}
                    >
                      <TestTube className="h-4 w-4 mr-2" />
                      Testar Email
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="email.enabled"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Habilitar Email</FormLabel>
                          <FormDescription>Ativar envio de emails automatizados</FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {form.watch("email.enabled") && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="email.fromName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nome do Remetente</FormLabel>
                              <FormControl>
                                <Input placeholder="Clínica ABC" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="email.fromEmail"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email do Remetente</FormLabel>
                              <FormControl>
                                <Input
                                  type="email"
                                  placeholder="contato@clinica.com.br"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="email.smtpHost"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Servidor SMTP</FormLabel>
                              <FormControl>
                                <Input placeholder="smtp.gmail.com" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="email.smtpPort"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Porta SMTP</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="587"
                                  {...field}
                                  onChange={(e) => field.onChange(parseInt(e.target.value) || 587)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="email.smtpUser"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Usuário SMTP</FormLabel>
                              <FormControl>
                                <Input placeholder="contato@clinica.com.br" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="email.smtpPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Senha SMTP</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="••••••••" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* SMS Tab */}
            <TabsContent value="sms" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5" />
                    SMS
                  </CardTitle>
                  <CardDescription>Configuração de provedores SMS brasileiros</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="sms.enabled"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Habilitar SMS</FormLabel>
                          <FormDescription>Ativar envio de SMS para pacientes</FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {form.watch("sms.enabled") && (
                    <>
                      <FormField
                        control={form.control}
                        name="sms.provider"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Provedor SMS</FormLabel>
                            <FormControl>
                              <select
                                className="w-full p-2 border rounded-md"
                                value={field.value}
                                onChange={field.onChange}
                              >
                                <option value="zenvia">Zenvia</option>
                                <option value="totalvoice">TotalVoice</option>
                                <option value="twilio">Twilio</option>
                              </select>
                            </FormControl>
                            <FormDescription>Provedor brasileiro para envio de SMS</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="sms.accountSid"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Account SID</FormLabel>
                              <FormControl>
                                <Input placeholder="AC1234567890" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="sms.authToken"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Auth Token</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="••••••••" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Others Tab */}
            <TabsContent value="others" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Outras Integrações</CardTitle>
                  <CardDescription>
                    Calendários, gateways de pagamento e outras APIs
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">Gateways de Pagamento</h4>

                    <FormField
                      control={form.control}
                      name="paymentGateways.mercadoPagoAccessToken"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mercado Pago Access Token</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="APP_USR-..." {...field} />
                          </FormControl>
                          <FormDescription>Token para integração com Mercado Pago</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="paymentGateways.pixApiKey"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>PIX API Key</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="sk_..." {...field} />
                          </FormControl>
                          <FormDescription>Chave API para geração de PIX</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="border-t pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-medium">Google Calendar</h4>
                        <p className="text-sm text-gray-600">
                          Sincronizar agendamentos com Google Calendar
                        </p>
                      </div>
                      <FormField
                        control={form.control}
                        name="calendar.googleCalendar.enabled"
                        render={({ field }) => (
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        )}
                      />
                    </div>

                    {form.watch("calendar.googleCalendar.enabled") && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="calendar.googleCalendar.clientId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Client ID</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="123456789.apps.googleusercontent.com"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="calendar.googleCalendar.clientSecret"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Client Secret</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="GOCSPX-..." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
                  </div>
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
                  Salvar Integrações
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
