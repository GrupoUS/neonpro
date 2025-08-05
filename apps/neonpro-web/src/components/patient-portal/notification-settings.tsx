"use client";

import type { Badge } from "@/components/ui/badge";
import type { Button } from "@/components/ui/button";
import type {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Input } from "@/components/ui/input";
import type { Label } from "@/components/ui/label";
import LoadingSpinner from "@/components/ui/loading-spinner";
import type {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Switch } from "@/components/ui/switch";
import type { useToast } from "@/components/ui/use-toast";
import type {
  AlertCircle,
  Bell,
  Calendar,
  CheckCircle,
  Clock,
  CreditCard,
  Heart,
  Mail,
  MessageSquare,
  Settings,
  Shield,
  Smartphone,
  Volume2,
  VolumeX,
} from "lucide-react";
import type { useState } from "react";

// Tipos para configurações de notificação
interface NotificationChannel {
  id: string;
  name: string;
  type: "email" | "sms" | "whatsapp" | "push" | "phone";
  enabled: boolean;
  verified: boolean;
  contact: string;
  icon: React.ReactNode;
}

interface NotificationCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  settings: {
    email: boolean;
    sms: boolean;
    whatsapp: boolean;
    push: boolean;
  };
  frequency: "immediate" | "daily" | "weekly" | "monthly";
  quietHours: boolean;
  lgpdConsent: boolean;
}

interface NotificationPreferences {
  channels: NotificationChannel[];
  categories: NotificationCategory[];
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
  timezone: string;
  language: string;
  doNotDisturb: boolean;
  emergencyOnly: boolean;
}

// Dados simulados das preferências de notificação
const mockPreferences: NotificationPreferences = {
  channels: [
    {
      id: "email",
      name: "Email",
      type: "email",
      enabled: true,
      verified: true,
      contact: "paciente@email.com",
      icon: <Mail className="h-4 w-4" />,
    },
    {
      id: "sms",
      name: "SMS",
      type: "sms",
      enabled: true,
      verified: true,
      contact: "+55 11 99999-9999",
      icon: <MessageSquare className="h-4 w-4" />,
    },
    {
      id: "whatsapp",
      name: "WhatsApp",
      type: "whatsapp",
      enabled: false,
      verified: false,
      contact: "+55 11 99999-9999",
      icon: <MessageSquare className="h-4 w-4" />,
    },
    {
      id: "push",
      name: "Push (App)",
      type: "push",
      enabled: true,
      verified: true,
      contact: "Dispositivo Mobile",
      icon: <Smartphone className="h-4 w-4" />,
    },
  ],
  categories: [
    {
      id: "appointments",
      name: "Consultas e Agendamentos",
      description: "Lembretes, confirmações e alterações de consultas",
      icon: <Calendar className="h-5 w-5" />,
      settings: { email: true, sms: true, whatsapp: false, push: true },
      frequency: "immediate",
      quietHours: true,
      lgpdConsent: true,
    },
    {
      id: "treatments",
      name: "Tratamentos e Procedimentos",
      description: "Informações sobre seus tratamentos e cuidados pós-procedimento",
      icon: <Heart className="h-5 w-5" />,
      settings: { email: true, sms: false, whatsapp: false, push: true },
      frequency: "immediate",
      quietHours: true,
      lgpdConsent: true,
    },
    {
      id: "billing",
      name: "Financeiro e Cobrança",
      description: "Faturas, recibos e informações de pagamento",
      icon: <CreditCard className="h-5 w-5" />,
      settings: { email: true, sms: false, whatsapp: false, push: false },
      frequency: "immediate",
      quietHours: false,
      lgpdConsent: true,
    },
    {
      id: "marketing",
      name: "Promocões e Novidades",
      description: "Ofertas especiais, novos tratamentos e eventos",
      icon: <Bell className="h-5 w-5" />,
      settings: { email: false, sms: false, whatsapp: false, push: false },
      frequency: "weekly",
      quietHours: true,
      lgpdConsent: false,
    },
    {
      id: "security",
      name: "Segurança e Privacidade",
      description: "Alertas de segurança e atualizações de privacidade",
      icon: <Shield className="h-5 w-5" />,
      settings: { email: true, sms: true, whatsapp: false, push: true },
      frequency: "immediate",
      quietHours: false,
      lgpdConsent: true,
    },
  ],
  quietHours: {
    enabled: true,
    start: "22:00",
    end: "08:00",
  },
  timezone: "America/Sao_Paulo",
  language: "pt-BR",
  doNotDisturb: false,
  emergencyOnly: false,
};

export default function NotificationSettings() {
  const [preferences, setPreferences] = useState<NotificationPreferences>(mockPreferences);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  // Simular salvamento das preferências
  const handleSavePreferences = async () => {
    setSaving(true);

    // Simular API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setSaving(false);
    toast({
      title: "Preferências salvas",
      description: "Suas configurações de notificação foram atualizadas com sucesso.",
    });
  };

  // Atualizar canal de notificação
  const updateChannel = (channelId: string, enabled: boolean) => {
    setPreferences((prev) => ({
      ...prev,
      channels: prev.channels.map((channel) =>
        channel.id === channelId ? { ...channel, enabled } : channel,
      ),
    }));
  };

  // Atualizar categoria de notificação
  const updateCategory = (categoryId: string, field: string, value: any) => {
    setPreferences((prev) => ({
      ...prev,
      categories: prev.categories.map((category) =>
        category.id === categoryId ? { ...category, [field]: value } : category,
      ),
    }));
  };

  // Atualizar configuração específica de categoria
  const updateCategorySetting = (categoryId: string, channel: string, enabled: boolean) => {
    setPreferences((prev) => ({
      ...prev,
      categories: prev.categories.map((category) =>
        category.id === categoryId
          ? {
              ...category,
              settings: { ...category.settings, [channel]: enabled },
            }
          : category,
      ),
    }));
  };

  // Verificar canal de comunicação
  const verifyChannel = async (channelId: string) => {
    setLoading(true);

    // Simular processo de verificação
    await new Promise((resolve) => setTimeout(resolve, 3000));

    setPreferences((prev) => ({
      ...prev,
      channels: prev.channels.map((channel) =>
        channel.id === channelId ? { ...channel, verified: true } : channel,
      ),
    }));

    setLoading(false);
    toast({
      title: "Canal verificado",
      description: "Seu canal de comunicação foi verificado com sucesso.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 border">
        <div className="flex items-center gap-3 mb-4">
          <Bell className="h-6 w-6 text-purple-600" />
          <h1 className="text-2xl font-semibold text-gray-900">Configurações de Notificação</h1>
        </div>
        <p className="text-gray-600 mb-4">
          Personalize como e quando você deseja receber notificações sobre seus tratamentos,
          consultas e outras informações importantes.
        </p>

        {/* Status Geral */}
        <div className="bg-white rounded-lg p-4 border border-purple-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {preferences.doNotDisturb ? (
                <VolumeX className="h-5 w-5 text-red-600" />
              ) : (
                <Volume2 className="h-5 w-5 text-green-600" />
              )}
              <div>
                <p className="font-medium text-gray-900">
                  {preferences.doNotDisturb ? "Modo Não Perturbe Ativo" : "Notificações Ativas"}
                </p>
                <p className="text-sm text-gray-600">
                  {preferences.doNotDisturb
                    ? "Apenas notificações de emergência serão enviadas"
                    : "Recebendo notificações conforme suas preferências"}
                </p>
              </div>
            </div>
            <Switch
              checked={!preferences.doNotDisturb}
              onCheckedChange={(checked) =>
                setPreferences((prev) => ({ ...prev, doNotDisturb: !checked }))
              }
            />
          </div>
        </div>
      </div>
      {/* Canais de Comunicação */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Canais de Comunicação
          </CardTitle>
          <CardDescription>
            Configure e verifique seus canais de contato. Canais verificados são mais confiáveis
            para receber notificações importantes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {preferences.channels.map((channel) => (
              <div
                key={channel.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {channel.icon}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{channel.name}</span>
                      {channel.verified ? (
                        <Badge variant="outline" className="text-green-700 border-green-300">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verificado
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-orange-700 border-orange-300">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Não Verificado
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{channel.contact}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {!channel.verified && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => verifyChannel(channel.id)}
                      disabled={loading}
                    >
                      {loading ? <LoadingSpinner size="sm" /> : "Verificar"}
                    </Button>
                  )}
                  <Switch
                    checked={channel.enabled}
                    onCheckedChange={(checked) => updateChannel(channel.id, checked)}
                    disabled={!channel.verified}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>{" "}
      {/* Categorias de Notificação */}
      <Card>
        <CardHeader>
          <CardTitle>Tipos de Notificação</CardTitle>
          <CardDescription>
            Configure individualmente como deseja receber cada tipo de notificação. Respeite suas
            preferências de LGPD.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {preferences.categories.map((category) => (
              <div key={category.id} className="border rounded-lg">
                <div className="p-4 border-b bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {category.icon}
                      <div>
                        <h3 className="font-semibold text-gray-900">{category.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                        <div className="flex items-center gap-4 mt-3">
                          {category.lgpdConsent && (
                            <Badge variant="outline" className="text-blue-700 border-blue-300">
                              <Shield className="h-3 w-3 mr-1" />
                              LGPD Autorizado
                            </Badge>
                          )}
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock className="h-4 w-4" />
                            <span>
                              Frequência:{" "}
                              {category.frequency === "immediate"
                                ? "Imediata"
                                : category.frequency === "daily"
                                  ? "Diária"
                                  : category.frequency === "weekly"
                                    ? "Semanal"
                                    : "Mensal"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4">
                  {/* Configurações por Canal */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    {Object.entries(category.settings).map(([channelKey, enabled]) => {
                      const channel = preferences.channels.find((c) => c.type === channelKey);
                      if (!channel || !channel.enabled) return null;

                      return (
                        <div
                          key={channelKey}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div className="flex items-center gap-2">
                            {channel.icon}
                            <span className="text-sm font-medium">{channel.name}</span>
                          </div>
                          <Switch
                            checked={enabled && category.lgpdConsent}
                            onCheckedChange={(checked) =>
                              updateCategorySetting(category.id, channelKey, checked)
                            }
                            disabled={!category.lgpdConsent}
                          />
                        </div>
                      );
                    })}
                  </div>

                  {/* Configurações Avançadas */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`frequency-${category.id}`} className="text-sm font-medium">
                        Frequência de Notificação
                      </Label>
                      <Select
                        value={category.frequency}
                        onValueChange={(value) => updateCategory(category.id, "frequency", value)}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="immediate">Imediata</SelectItem>
                          <SelectItem value="daily">Diária</SelectItem>
                          <SelectItem value="weekly">Semanal</SelectItem>
                          <SelectItem value="monthly">Mensal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between pt-6">
                      <div>
                        <Label className="text-sm font-medium">Respeitar horário de silêncio</Label>
                        <p className="text-xs text-gray-600 mt-1">
                          Não enviar notificações durante as horas de silêncio
                        </p>
                      </div>
                      <Switch
                        checked={category.quietHours}
                        onCheckedChange={(checked) =>
                          updateCategory(category.id, "quietHours", checked)
                        }
                      />
                    </div>
                  </div>

                  {/* LGPD Consent */}
                  {!category.lgpdConsent && category.id === "marketing" && (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                        <div className="text-sm">
                          <p className="font-medium text-yellow-800 mb-1">
                            Consentimento LGPD Necessário
                          </p>
                          <p className="text-yellow-700 mb-3">
                            Para receber notificações de marketing, você precisa autorizar o uso de
                            seus dados para fins promocionais conforme a LGPD.
                          </p>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateCategory(category.id, "lgpdConsent", true)}
                            className="border-yellow-300 text-yellow-800 hover:bg-yellow-100"
                          >
                            Autorizar Uso para Marketing
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>{" "}
      {/* Horário de Silêncio */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Horário de Silêncio
          </CardTitle>
          <CardDescription>
            Configure um período em que não deseja receber notificações não-urgentes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Ativar horário de silêncio</Label>
                <p className="text-xs text-gray-600 mt-1">
                  Notificações urgentes ainda serão enviadas
                </p>
              </div>
              <Switch
                checked={preferences.quietHours.enabled}
                onCheckedChange={(checked) =>
                  setPreferences((prev) => ({
                    ...prev,
                    quietHours: { ...prev.quietHours, enabled: checked },
                  }))
                }
              />
            </div>

            {preferences.quietHours.enabled && (
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <Label htmlFor="quiet-start" className="text-sm font-medium">
                    Início do silêncio
                  </Label>
                  <Input
                    id="quiet-start"
                    type="time"
                    value={preferences.quietHours.start}
                    onChange={(e) =>
                      setPreferences((prev) => ({
                        ...prev,
                        quietHours: {
                          ...prev.quietHours,
                          start: e.target.value,
                        },
                      }))
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="quiet-end" className="text-sm font-medium">
                    Fim do silêncio
                  </Label>
                  <Input
                    id="quiet-end"
                    type="time"
                    value={preferences.quietHours.end}
                    onChange={(e) =>
                      setPreferences((prev) => ({
                        ...prev,
                        quietHours: { ...prev.quietHours, end: e.target.value },
                      }))
                    }
                    className="mt-1"
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      {/* Configurações Gerais */}
      <Card>
        <CardHeader>
          <CardTitle>Configurações Gerais</CardTitle>
          <CardDescription>
            Configurações globais de idioma, fuso horário e modo de emergência.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="language" className="text-sm font-medium">
                Idioma das Notificações
              </Label>
              <Select
                value={preferences.language}
                onValueChange={(value) => setPreferences((prev) => ({ ...prev, language: value }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                  <SelectItem value="en-US">English (US)</SelectItem>
                  <SelectItem value="es-ES">Español</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="timezone" className="text-sm font-medium">
                Fuso Horário
              </Label>
              <Select
                value={preferences.timezone}
                onValueChange={(value) => setPreferences((prev) => ({ ...prev, timezone: value }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="America/Sao_Paulo">Brasília (GMT-3)</SelectItem>
                  <SelectItem value="America/Manaus">Manaus (GMT-4)</SelectItem>
                  <SelectItem value="America/Rio_Branco">Acre (GMT-5)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium text-red-700">Modo Somente Emergência</Label>
                <p className="text-xs text-gray-600 mt-1">
                  Receber apenas notificações críticas e de emergência médica
                </p>
              </div>
              <Switch
                checked={preferences.emergencyOnly}
                onCheckedChange={(checked) =>
                  setPreferences((prev) => ({
                    ...prev,
                    emergencyOnly: checked,
                  }))
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Ações */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button
          onClick={handleSavePreferences}
          disabled={saving}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
        >
          {saving ? (
            <>
              <LoadingSpinner size="sm" />
              Salvando...
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4" />
              Salvar Configurações
            </>
          )}
        </Button>

        <Button variant="outline" onClick={() => setPreferences(mockPreferences)} disabled={saving}>
          Restaurar Padrões
        </Button>

        <Button
          variant="outline"
          onClick={() => {
            // Em implementação real, abrir modal de teste de notificação
            toast({
              title: "Notificação de teste enviada",
              description: "Verifique seus canais de comunicação habilitados.",
            });
          }}
          disabled={saving}
        >
          Enviar Teste
        </Button>
      </div>
      {/* Informações LGPD */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <Shield className="h-6 w-6 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Privacidade e Consentimento LGPD</h3>
              <div className="text-sm text-blue-800 space-y-2">
                <p>
                  • Suas preferências de notificação são armazenadas de forma segura e criptografada
                </p>
                <p>
                  • Você pode retirar seu consentimento para qualquer tipo de comunicação a qualquer
                  momento
                </p>
                <p>
                  • Notificações essenciais (consultas, segurança) são enviadas independente das
                  configurações
                </p>
                <p>
                  • Seus dados de contato não são compartilhados com terceiros sem seu consentimento
                  explícito
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-blue-200">
                <p className="text-sm text-blue-700">
                  Para mais informações sobre tratamento de dados, consulte nossa
                  <Button variant="link" className="p-0 h-auto ml-1 text-blue-700 underline">
                    Política de Privacidade
                  </Button>
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
