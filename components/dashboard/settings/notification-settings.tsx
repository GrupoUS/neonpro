"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Bell, Loader2, Mail, MessageSquare, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

// Schema de validação para configurações de notificação
const notificationSettingsSchema = z.object({
  email_notifications: z.boolean().default(true),
  sms_notifications: z.boolean().default(false),
  whatsapp_notifications: z.boolean().default(false),
  appointment_reminders: z.boolean().default(true),
  appointment_confirmations: z.boolean().default(true),
  cancellation_notifications: z.boolean().default(true),
  reminder_hours_before: z
    .number()
    .min(1, "Mínimo de 1 hora")
    .max(168, "Máximo de 7 dias"),
  email_template_reminder: z.string().optional(),
  email_template_confirmation: z.string().optional(),
  whatsapp_api_key: z.string().optional(),
  whatsapp_phone_number: z.string().optional(),
});

type NotificationSettingsFormData = z.infer<typeof notificationSettingsSchema>;

export function NotificationSettings() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<NotificationSettingsFormData>({
    resolver: zodResolver(notificationSettingsSchema),
    defaultValues: {
      email_notifications: true,
      sms_notifications: false,
      whatsapp_notifications: false,
      appointment_reminders: true,
      appointment_confirmations: true,
      cancellation_notifications: true,
      reminder_hours_before: 24,
      email_template_reminder: "",
      email_template_confirmation: "",
      whatsapp_api_key: "",
      whatsapp_phone_number: "",
    },
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("notification_settings")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (data) {
        setValue("email_notifications", data.email_notifications ?? true);
        setValue("sms_notifications", data.sms_notifications ?? false);
        setValue(
          "whatsapp_notifications",
          data.whatsapp_notifications ?? false
        );
        setValue("appointment_reminders", data.appointment_reminders ?? true);
        setValue(
          "appointment_confirmations",
          data.appointment_confirmations ?? true
        );
        setValue(
          "cancellation_notifications",
          data.cancellation_notifications ?? true
        );
        setValue("reminder_hours_before", data.reminder_hours_before || 24);
        setValue("email_template_reminder", data.email_template_reminder || "");
        setValue(
          "email_template_confirmation",
          data.email_template_confirmation || ""
        );
        setValue("whatsapp_api_key", data.whatsapp_api_key || "");
        setValue("whatsapp_phone_number", data.whatsapp_phone_number || "");
      }
    } catch (err) {
      console.error("Erro ao carregar configurações:", err);
    }
  };

  const onSubmit = async (data: NotificationSettingsFormData) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("Usuário não autenticado");
      }

      const settingsData = {
        ...data,
        user_id: user.id,
        updated_at: new Date().toISOString(),
      };

      // Tentar atualizar primeiro
      const { error: updateError } = await supabase
        .from("notification_settings")
        .update(settingsData)
        .eq("user_id", user.id);

      // Se não existir, criar novo
      if (updateError && updateError.code === "PGRST116") {
        const { error: insertError } = await supabase
          .from("notification_settings")
          .insert([
            {
              ...settingsData,
              created_at: new Date().toISOString(),
            },
          ]);

        if (insertError) throw insertError;
      } else if (updateError) {
        throw updateError;
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || "Erro ao salvar configurações");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <AlertDescription>Configurações salvas com sucesso!</AlertDescription>
        </Alert>
      )}

      {/* Tipos de Notificação */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="mr-2 h-5 w-5" />
            Tipos de Notificação
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="email_notifications"
                checked={watch("email_notifications")}
                onCheckedChange={(checked) =>
                  setValue("email_notifications", !!checked)
                }
              />
              <Label htmlFor="email_notifications">
                Notificações por Email
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="sms_notifications"
                checked={watch("sms_notifications")}
                onCheckedChange={(checked) =>
                  setValue("sms_notifications", !!checked)
                }
              />
              <Label htmlFor="sms_notifications">Notificações por SMS</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="whatsapp_notifications"
                checked={watch("whatsapp_notifications")}
                onCheckedChange={(checked) =>
                  setValue("whatsapp_notifications", !!checked)
                }
              />
              <Label htmlFor="whatsapp_notifications">
                Notificações por WhatsApp
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Eventos de Notificação */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="mr-2 h-5 w-5" />
            Eventos de Notificação
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="appointment_reminders"
                checked={watch("appointment_reminders")}
                onCheckedChange={(checked) =>
                  setValue("appointment_reminders", !!checked)
                }
              />
              <Label htmlFor="appointment_reminders">
                Lembretes de agendamento
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="appointment_confirmations"
                checked={watch("appointment_confirmations")}
                onCheckedChange={(checked) =>
                  setValue("appointment_confirmations", !!checked)
                }
              />
              <Label htmlFor="appointment_confirmations">
                Confirmações de agendamento
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="cancellation_notifications"
                checked={watch("cancellation_notifications")}
                onCheckedChange={(checked) =>
                  setValue("cancellation_notifications", !!checked)
                }
              />
              <Label htmlFor="cancellation_notifications">
                Notificações de cancelamento
              </Label>
            </div>
          </div>

          <div>
            <Label htmlFor="reminder_hours_before">
              Enviar lembrete (horas antes)
            </Label>
            <Input
              id="reminder_hours_before"
              type="number"
              min="1"
              max="168"
              {...register("reminder_hours_before", { valueAsNumber: true })}
            />
            {errors.reminder_hours_before && (
              <p className="text-sm text-red-600 mt-1">
                {errors.reminder_hours_before.message}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Templates de Email */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Mail className="mr-2 h-5 w-5" />
            Templates de Email
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="email_template_reminder">
              Template de Lembrete
            </Label>
            <Textarea
              id="email_template_reminder"
              {...register("email_template_reminder")}
              placeholder="Olá {cliente_nome}, você tem um agendamento em {data_agendamento} às {hora_agendamento}..."
              rows={4}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Use {"{cliente_nome}"}, {"{data_agendamento}"},{" "}
              {"{hora_agendamento}"} como variáveis
            </p>
          </div>

          <div>
            <Label htmlFor="email_template_confirmation">
              Template de Confirmação
            </Label>
            <Textarea
              id="email_template_confirmation"
              {...register("email_template_confirmation")}
              placeholder="Olá {cliente_nome}, seu agendamento foi confirmado para {data_agendamento} às {hora_agendamento}..."
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* Configurações do WhatsApp */}
      {watch("whatsapp_notifications") && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageSquare className="mr-2 h-5 w-5" />
              Configurações do WhatsApp
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="whatsapp_api_key">
                API Key do WhatsApp Business
              </Label>
              <Input
                id="whatsapp_api_key"
                type="password"
                {...register("whatsapp_api_key")}
                placeholder="Sua chave da API do WhatsApp Business"
              />
            </div>

            <div>
              <Label htmlFor="whatsapp_phone_number">Número do WhatsApp</Label>
              <Input
                id="whatsapp_phone_number"
                {...register("whatsapp_phone_number")}
                placeholder="Ex: +5511999999999"
              />
            </div>

            <Alert>
              <AlertDescription>
                Para usar notificações por WhatsApp, você precisa de uma conta
                do WhatsApp Business API.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Teste do WhatsApp */}
      {watch("whatsapp_notifications") && <WhatsAppTest />}

      {/* Botão de salvar */}
      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <Save className="mr-2 h-4 w-4" />
          Salvar Configurações
        </Button>
      </div>
    </form>
  );
}
