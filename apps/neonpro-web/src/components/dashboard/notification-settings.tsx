"use client";

import type {
  AlertTriangle,
  Bell,
  Calendar,
  Clock,
  Mail,
  RefreshCw,
  Save,
  Settings,
  Smartphone,
  Volume2,
  VolumeX,
} from "lucide-react";
import type { useState } from "react";
import type { toast } from "sonner";
import type { Badge } from "@/components/ui/badge";
import type { Button } from "@/components/ui/button";
import type {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Label } from "@/components/ui/label";
import type {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Separator } from "@/components/ui/separator";
import type { Switch } from "@/components/ui/switch";
import type { useNotificationContext } from "@/contexts/notification-context";
import type { NotificationPreferences } from "@/hooks/use-notifications";

interface NotificationSettingsProps {
  className?: string;
}

interface SettingsSection {
  title: string;
  description: string;
  icon: React.ElementType;
  settings: {
    key: keyof NotificationPreferences;
    label: string;
    description: string;
    type: "switch" | "select" | "time";
    options?: { value: string | number; label: string }[];
  }[];
}

export function NotificationSettings({ className }: NotificationSettingsProps) {
  const { preferences, updatePreferences, requestPermission, isLoading } = useNotificationContext();

  const [saving, setSaving] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>(
    typeof window !== "undefined" && "Notification" in window ? Notification.permission : "denied",
  );

  const handlePreferenceChange = async (key: keyof NotificationPreferences, value: any) => {
    try {
      await updatePreferences({ [key]: value });
      toast.success("Configuração atualizada!");
    } catch (error) {
      toast.error("Erro ao atualizar configuração");
      console.error("Error updating preference:", error);
    }
  };

  const handleRequestPermission = async () => {
    try {
      const permission = await requestPermission();
      setPermissionStatus(permission);

      if (permission === "granted") {
        // Enable push notifications when permission is granted
        await handlePreferenceChange("push_enabled", true);
      }
    } catch (error) {
      toast.error("Erro ao solicitar permissão");
    }
  };

  const settingsSections: SettingsSection[] = [
    {
      title: "Notificações por Email",
      description: "Receba notificações importantes por email",
      icon: Mail,
      settings: [
        {
          key: "email_enabled",
          label: "Ativar notificações por email",
          description: "Receber emails sobre agendamentos e lembretes",
          type: "switch",
        },
      ],
    },
    {
      title: "Notificações Push",
      description: "Notificações instantâneas no navegador e dispositivo",
      icon: Smartphone,
      settings: [
        {
          key: "push_enabled",
          label: "Ativar notificações push",
          description: "Receber notificações em tempo real",
          type: "switch",
        },
      ],
    },
    {
      title: "Tipos de Notificação",
      description: "Escolha que tipos de notificação deseja receber",
      icon: Bell,
      settings: [
        {
          key: "appointment_reminders",
          label: "Lembretes de agendamento",
          description: "Receber lembretes antes dos agendamentos",
          type: "switch",
        },
        {
          key: "status_changes",
          label: "Mudanças de status",
          description: "Notificações sobre confirmações, cancelamentos, etc.",
          type: "switch",
        },
        {
          key: "marketing_emails",
          label: "Emails promocionais",
          description: "Receber ofertas especiais e novidades",
          type: "switch",
        },
      ],
    },
    {
      title: "Configurações de Lembrete",
      description: "Quando receber lembretes de agendamentos",
      icon: Clock,
      settings: [
        {
          key: "reminder_timing",
          label: "Enviar lembrete",
          description: "Tempo antes do agendamento para enviar lembrete",
          type: "select",
          options: [
            { value: 60, label: "1 hora antes" },
            { value: 120, label: "2 horas antes" },
            { value: 240, label: "4 horas antes" },
            { value: 1440, label: "1 dia antes" },
            { value: 2880, label: "2 dias antes" },
          ],
        },
      ],
    },
    {
      title: "Horário Silencioso",
      description: "Não receber notificações em horários específicos",
      icon: VolumeX,
      settings: [
        {
          key: "quiet_hours_start",
          label: "Início do horário silencioso",
          description: "Hora de início (ex: 22:00)",
          type: "time",
        },
        {
          key: "quiet_hours_end",
          label: "Fim do horário silencioso",
          description: "Hora de fim (ex: 08:00)",
          type: "time",
        },
      ],
    },
  ];

  if (isLoading || !preferences) {
    return (
      <Card className={className}>
        <CardContent className="flex justify-center p-6">
          <RefreshCw className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Browser Permission Status */}
      {typeof window !== "undefined" && "Notification" in window && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Status das Permissões
            </CardTitle>
            <CardDescription>Status das permissões do navegador para notificações</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Notificações do Navegador</p>
                <p className="text-sm text-muted-foreground">
                  {permissionStatus === "granted" && "Permitidas - você receberá notificações"}
                  {permissionStatus === "denied" && "Negadas - você não receberá notificações"}
                  {permissionStatus === "default" && "Não configuradas - clique para permitir"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={permissionStatus === "granted" ? "default" : "destructive"}>
                  {permissionStatus === "granted" && "Ativado"}
                  {permissionStatus === "denied" && "Bloqueado"}
                  {permissionStatus === "default" && "Pendente"}
                </Badge>
                {permissionStatus !== "granted" && (
                  <Button
                    size="sm"
                    onClick={handleRequestPermission}
                    disabled={permissionStatus === "denied"}
                  >
                    Permitir
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Settings Sections */}
      {settingsSections.map((section, sectionIndex) => (
        <Card key={section.title}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <section.icon className="h-5 w-5" />
              {section.title}
            </CardTitle>
            <CardDescription>{section.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {section.settings.map((setting, settingIndex) => (
              <div key={setting.key}>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor={setting.key}>{setting.label}</Label>
                    <p className="text-sm text-muted-foreground">{setting.description}</p>
                  </div>

                  <div className="flex items-center">
                    {setting.type === "switch" && (
                      <Switch
                        id={setting.key}
                        checked={preferences[setting.key] as boolean}
                        onCheckedChange={(checked) => handlePreferenceChange(setting.key, checked)}
                        disabled={saving}
                      />
                    )}

                    {setting.type === "select" && setting.options && (
                      <Select
                        value={String(preferences[setting.key] || "")}
                        onValueChange={(value) =>
                          handlePreferenceChange(setting.key, parseInt(value))
                        }
                      >
                        <SelectTrigger className="w-48">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {setting.options.map((option) => (
                            <SelectItem key={option.value} value={String(option.value)}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}

                    {setting.type === "time" && (
                      <input
                        type="time"
                        id={setting.key}
                        value={(preferences[setting.key] as string) || ""}
                        onChange={(e) => handlePreferenceChange(setting.key, e.target.value)}
                        className="px-3 py-2 border border-input bg-background rounded-md text-sm"
                        disabled={saving}
                      />
                    )}
                  </div>
                </div>

                {settingIndex < section.settings.length - 1 && <Separator className="mt-6" />}
              </div>
            ))}
          </CardContent>
        </Card>
      ))}

      {/* Test Notification */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="h-5 w-5" />
            Testar Notificações
          </CardTitle>
          <CardDescription>
            Envie uma notificação de teste para verificar suas configurações
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={() => {
              toast.success("Teste de notificação!", {
                description: "Suas configurações de notificação estão funcionando corretamente.",
                duration: 5000,
              });

              // Also send browser notification if enabled
              if (preferences.push_enabled && Notification.permission === "granted") {
                new Notification("NeonPro - Teste de Notificação", {
                  body: "Suas configurações de notificação estão funcionando corretamente.",
                  icon: "/icon-192x192.png",
                });
              }
            }}
            disabled={saving}
          >
            Enviar Notificação de Teste
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
