"use client";
var __awaiter =
  (this && this.__awaiter) ||
  ((thisArg, _arguments, P, generator) => {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P((resolve) => {
            resolve(value);
          });
    }
    return new (P || (P = Promise))((resolve, reject) => {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  });
var __generator =
  (this && this.__generator) ||
  ((thisArg, body) => {
    var _ = {
        label: 0,
        sent: () => {
          if (t[0] & 1) throw t[1];
          return t[1];
        },
        trys: [],
        ops: [],
      },
      f,
      y,
      t,
      g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return (
      (g.next = verb(0)),
      (g["throw"] = verb(1)),
      (g["return"] = verb(2)),
      typeof Symbol === "function" &&
        (g[Symbol.iterator] = function () {
          return this;
        }),
      g
    );
    function verb(n) {
      return (v) => step([n, v]);
    }
    function step(op) {
      if (f) throw new TypeError("Generator is already executing.");
      while ((g && ((g = 0), op[0] && (_ = 0)), _))
        try {
          if (
            ((f = 1),
            y &&
              (t =
                op[0] & 2
                  ? y["return"]
                  : op[0]
                    ? y["throw"] || ((t = y["return"]) && t.call(y), 0)
                    : y.next) &&
              !(t = t.call(y, op[1])).done)
          )
            return t;
          if (((y = 0), t)) op = [op[0] & 2, t.value];
          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;
            case 4:
              _.label++;
              return { value: op[1], done: false };
            case 5:
              _.label++;
              y = op[1];
              op = [0];
              continue;
            case 7:
              op = _.ops.pop();
              _.trys.pop();
              continue;
            default:
              if (
                !((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
                (op[0] === 6 || op[0] === 2)
              ) {
                _ = 0;
                continue;
              }
              if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                _.label = op[1];
                break;
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break;
              }
              if (t && _.label < t[2]) {
                _.label = t[2];
                _.ops.push(op);
                break;
              }
              if (t[2]) _.ops.pop();
              _.trys.pop();
              continue;
          }
          op = body.call(thisArg, _);
        } catch (e) {
          op = [6, e];
          y = 0;
        } finally {
          f = t = 0;
        }
      if (op[0] & 5) throw op[1];
      return { value: op[0] ? op[1] : void 0, done: true };
    }
  });
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SystemPreferences;
var react_1 = require("react");
var react_hook_form_1 = require("react-hook-form");
var zod_1 = require("@hookform/resolvers/zod");
var z = require("zod");
var card_1 = require("@/components/ui/card");
var form_1 = require("@/components/ui/form");
var input_1 = require("@/components/ui/input");
var button_1 = require("@/components/ui/button");
var switch_1 = require("@/components/ui/switch");
var select_1 = require("@/components/ui/select");
var lucide_react_1 = require("lucide-react");
var sonner_1 = require("sonner");
var systemPreferencesSchema = z.object({
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
function SystemPreferences() {
  var _a = (0, react_1.useState)(false),
    isLoading = _a[0],
    setIsLoading = _a[1];
  var _b = (0, react_1.useState)(false),
    isSaving = _b[0],
    setIsSaving = _b[1];
  var _c = (0, react_1.useState)(null),
    lastSaved = _c[0],
    setLastSaved = _c[1];
  var form = (0, react_hook_form_1.useForm)({
    resolver: (0, zod_1.zodResolver)(systemPreferencesSchema),
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
  (0, react_1.useEffect)(() => {
    var loadSystemPreferences = () =>
      __awaiter(this, void 0, void 0, function () {
        return __generator(this, (_a) => {
          setIsLoading(true);
          try {
            // TODO: Replace with actual API call
          } catch (error) {
            console.error("Erro ao carregar preferências:", error);
            sonner_1.toast.error("Erro ao carregar preferências do sistema");
          } finally {
            setIsLoading(false);
          }
          return [2 /*return*/];
        });
      });
    loadSystemPreferences();
  }, [form]);
  var onSubmit = (data) =>
    __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        setIsSaving(true);
        try {
          setLastSaved(new Date());
          sonner_1.toast.success("Preferências do sistema salvas com sucesso!");
        } catch (error) {
          console.error("Erro ao salvar preferências:", error);
          sonner_1.toast.error("Erro ao salvar preferências");
        } finally {
          setIsSaving(false);
        }
        return [2 /*return*/];
      });
    });
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <lucide_react_1.Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <form_1.Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* UI Preferences */}
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle className="flex items-center gap-2">
                <lucide_react_1.Palette className="h-5 w-5" />
                Interface e Exibição
              </card_1.CardTitle>
              <card_1.CardDescription>
                Personalize a aparência e formato de exibição
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <form_1.FormField
                  control={form.control}
                  name="ui.theme"
                  render={(_a) => {
                    var field = _a.field;
                    return (
                      <form_1.FormItem>
                        <form_1.FormLabel>Tema</form_1.FormLabel>
                        <select_1.Select onValueChange={field.onChange} defaultValue={field.value}>
                          <form_1.FormControl>
                            <select_1.SelectTrigger>
                              <select_1.SelectValue />
                            </select_1.SelectTrigger>
                          </form_1.FormControl>
                          <select_1.SelectContent>
                            <select_1.SelectItem value="light">Claro</select_1.SelectItem>
                            <select_1.SelectItem value="dark">Escuro</select_1.SelectItem>
                            <select_1.SelectItem value="system">Sistema</select_1.SelectItem>
                          </select_1.SelectContent>
                        </select_1.Select>
                        <form_1.FormMessage />
                      </form_1.FormItem>
                    );
                  }}
                />

                <form_1.FormField
                  control={form.control}
                  name="ui.language"
                  render={(_a) => {
                    var field = _a.field;
                    return (
                      <form_1.FormItem>
                        <form_1.FormLabel>Idioma</form_1.FormLabel>
                        <select_1.Select onValueChange={field.onChange} defaultValue={field.value}>
                          <form_1.FormControl>
                            <select_1.SelectTrigger>
                              <select_1.SelectValue />
                            </select_1.SelectTrigger>
                          </form_1.FormControl>
                          <select_1.SelectContent>
                            <select_1.SelectItem value="pt-BR">
                              Português (Brasil)
                            </select_1.SelectItem>
                            <select_1.SelectItem value="en-US">English (US)</select_1.SelectItem>
                            <select_1.SelectItem value="es-ES">Español</select_1.SelectItem>
                          </select_1.SelectContent>
                        </select_1.Select>
                        <form_1.FormMessage />
                      </form_1.FormItem>
                    );
                  }}
                />

                <form_1.FormField
                  control={form.control}
                  name="ui.dateFormat"
                  render={(_a) => {
                    var field = _a.field;
                    return (
                      <form_1.FormItem>
                        <form_1.FormLabel>Formato de Data</form_1.FormLabel>
                        <select_1.Select onValueChange={field.onChange} defaultValue={field.value}>
                          <form_1.FormControl>
                            <select_1.SelectTrigger>
                              <select_1.SelectValue />
                            </select_1.SelectTrigger>
                          </form_1.FormControl>
                          <select_1.SelectContent>
                            <select_1.SelectItem value="DD/MM/YYYY">DD/MM/YYYY</select_1.SelectItem>
                            <select_1.SelectItem value="MM/DD/YYYY">MM/DD/YYYY</select_1.SelectItem>
                            <select_1.SelectItem value="YYYY-MM-DD">YYYY-MM-DD</select_1.SelectItem>
                          </select_1.SelectContent>
                        </select_1.Select>
                        <form_1.FormMessage />
                      </form_1.FormItem>
                    );
                  }}
                />

                <form_1.FormField
                  control={form.control}
                  name="ui.timeFormat"
                  render={(_a) => {
                    var field = _a.field;
                    return (
                      <form_1.FormItem>
                        <form_1.FormLabel>Formato de Hora</form_1.FormLabel>
                        <select_1.Select onValueChange={field.onChange} defaultValue={field.value}>
                          <form_1.FormControl>
                            <select_1.SelectTrigger>
                              <select_1.SelectValue />
                            </select_1.SelectTrigger>
                          </form_1.FormControl>
                          <select_1.SelectContent>
                            <select_1.SelectItem value="24">24 horas</select_1.SelectItem>
                            <select_1.SelectItem value="12">12 horas (AM/PM)</select_1.SelectItem>
                          </select_1.SelectContent>
                        </select_1.Select>
                        <form_1.FormMessage />
                      </form_1.FormItem>
                    );
                  }}
                />
              </div>

              <form_1.FormField
                control={form.control}
                name="ui.compactMode"
                render={(_a) => {
                  var field = _a.field;
                  return (
                    <form_1.FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <form_1.FormLabel className="text-base">Modo Compacto</form_1.FormLabel>
                        <form_1.FormDescription>
                          Reduzir espaçamento e mostrar mais informações
                        </form_1.FormDescription>
                      </div>
                      <form_1.FormControl>
                        <switch_1.Switch checked={field.value} onCheckedChange={field.onChange} />
                      </form_1.FormControl>
                    </form_1.FormItem>
                  );
                }}
              />
            </card_1.CardContent>
          </card_1.Card>

          {/* Notifications */}
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle className="flex items-center gap-2">
                <lucide_react_1.Bell className="h-5 w-5" />
                Notificações
              </card_1.CardTitle>
              <card_1.CardDescription>
                Configure como e quando receber notificações
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium">Email</h4>

                <form_1.FormField
                  control={form.control}
                  name="notifications.email.enabled"
                  render={(_a) => {
                    var field = _a.field;
                    return (
                      <form_1.FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <form_1.FormLabel className="text-base">
                            Notificações por Email
                          </form_1.FormLabel>
                          <form_1.FormDescription>
                            Receber notificações via email
                          </form_1.FormDescription>
                        </div>
                        <form_1.FormControl>
                          <switch_1.Switch checked={field.value} onCheckedChange={field.onChange} />
                        </form_1.FormControl>
                      </form_1.FormItem>
                    );
                  }}
                />

                {form.watch("notifications.email.enabled") && (
                  <div className="ml-4 space-y-3">
                    <form_1.FormField
                      control={form.control}
                      name="notifications.email.appointmentReminders"
                      render={(_a) => {
                        var field = _a.field;
                        return (
                          <form_1.FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                              <form_1.FormLabel>Lembretes de Consulta</form_1.FormLabel>
                              <form_1.FormDescription>
                                Notificações sobre próximas consultas
                              </form_1.FormDescription>
                            </div>
                            <form_1.FormControl>
                              <switch_1.Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </form_1.FormControl>
                          </form_1.FormItem>
                        );
                      }}
                    />

                    <form_1.FormField
                      control={form.control}
                      name="notifications.email.systemAlerts"
                      render={(_a) => {
                        var field = _a.field;
                        return (
                          <form_1.FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                              <form_1.FormLabel>Alertas do Sistema</form_1.FormLabel>
                              <form_1.FormDescription>
                                Notificações sobre problemas e atualizações
                              </form_1.FormDescription>
                            </div>
                            <form_1.FormControl>
                              <switch_1.Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </form_1.FormControl>
                          </form_1.FormItem>
                        );
                      }}
                    />

                    <form_1.FormField
                      control={form.control}
                      name="notifications.email.weeklyReports"
                      render={(_a) => {
                        var field = _a.field;
                        return (
                          <form_1.FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                              <form_1.FormLabel>Relatórios Semanais</form_1.FormLabel>
                              <form_1.FormDescription>
                                Resumo semanal das atividades
                              </form_1.FormDescription>
                            </div>
                            <form_1.FormControl>
                              <switch_1.Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </form_1.FormControl>
                          </form_1.FormItem>
                        );
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Push Notifications</h4>

                <form_1.FormField
                  control={form.control}
                  name="notifications.push.enabled"
                  render={(_a) => {
                    var field = _a.field;
                    return (
                      <form_1.FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <form_1.FormLabel className="text-base">
                            Notificações Push
                          </form_1.FormLabel>
                          <form_1.FormDescription>
                            Notificações instantâneas no navegador
                          </form_1.FormDescription>
                        </div>
                        <form_1.FormControl>
                          <switch_1.Switch checked={field.value} onCheckedChange={field.onChange} />
                        </form_1.FormControl>
                      </form_1.FormItem>
                    );
                  }}
                />

                {form.watch("notifications.push.enabled") && (
                  <div className="ml-4 space-y-3">
                    <form_1.FormField
                      control={form.control}
                      name="notifications.push.appointmentReminders"
                      render={(_a) => {
                        var field = _a.field;
                        return (
                          <form_1.FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                              <form_1.FormLabel>Lembretes de Consulta</form_1.FormLabel>
                              <form_1.FormDescription>
                                Notificações sobre próximas consultas
                              </form_1.FormDescription>
                            </div>
                            <form_1.FormControl>
                              <switch_1.Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </form_1.FormControl>
                          </form_1.FormItem>
                        );
                      }}
                    />

                    <form_1.FormField
                      control={form.control}
                      name="notifications.push.patientMessages"
                      render={(_a) => {
                        var field = _a.field;
                        return (
                          <form_1.FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                              <form_1.FormLabel>Mensagens de Pacientes</form_1.FormLabel>
                              <form_1.FormDescription>
                                Notificações sobre novas mensagens
                              </form_1.FormDescription>
                            </div>
                            <form_1.FormControl>
                              <switch_1.Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </form_1.FormControl>
                          </form_1.FormItem>
                        );
                      }}
                    />
                  </div>
                )}
              </div>
            </card_1.CardContent>
          </card_1.Card>

          {/* System Behavior */}
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle className="flex items-center gap-2">
                <lucide_react_1.Settings className="h-5 w-5" />
                Comportamento do Sistema
              </card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent className="space-y-4">
              <form_1.FormField
                control={form.control}
                name="system.autoLogout"
                render={(_a) => {
                  var field = _a.field;
                  return (
                    <form_1.FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <form_1.FormLabel className="text-base">Logout Automático</form_1.FormLabel>
                        <form_1.FormDescription>
                          Desconectar automaticamente por inatividade
                        </form_1.FormDescription>
                      </div>
                      <form_1.FormControl>
                        <switch_1.Switch checked={field.value} onCheckedChange={field.onChange} />
                      </form_1.FormControl>
                    </form_1.FormItem>
                  );
                }}
              />

              {form.watch("system.autoLogout") && (
                <form_1.FormField
                  control={form.control}
                  name="system.autoLogoutMinutes"
                  render={(_a) => {
                    var field = _a.field;
                    return (
                      <form_1.FormItem className="md:w-1/3">
                        <form_1.FormLabel>Tempo de Inatividade (minutos)</form_1.FormLabel>
                        <form_1.FormControl>
                          <input_1.Input
                            type="number"
                            min="5"
                            max="480"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 60)}
                          />
                        </form_1.FormControl>
                        <form_1.FormDescription>
                          Minutos de inatividade antes do logout
                        </form_1.FormDescription>
                        <form_1.FormMessage />
                      </form_1.FormItem>
                    );
                  }}
                />
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <form_1.FormField
                  control={form.control}
                  name="system.performanceMode"
                  render={(_a) => {
                    var field = _a.field;
                    return (
                      <form_1.FormItem>
                        <form_1.FormLabel>Modo de Performance</form_1.FormLabel>
                        <select_1.Select onValueChange={field.onChange} defaultValue={field.value}>
                          <form_1.FormControl>
                            <select_1.SelectTrigger>
                              <select_1.SelectValue />
                            </select_1.SelectTrigger>
                          </form_1.FormControl>
                          <select_1.SelectContent>
                            <select_1.SelectItem value="low">
                              Baixa (economiza recursos)
                            </select_1.SelectItem>
                            <select_1.SelectItem value="normal">Normal</select_1.SelectItem>
                            <select_1.SelectItem value="high">
                              Alta (máxima velocidade)
                            </select_1.SelectItem>
                          </select_1.SelectContent>
                        </select_1.Select>
                        <form_1.FormMessage />
                      </form_1.FormItem>
                    );
                  }}
                />

                <form_1.FormField
                  control={form.control}
                  name="system.dataRetentionDays"
                  render={(_a) => {
                    var field = _a.field;
                    return (
                      <form_1.FormItem>
                        <form_1.FormLabel>Retenção de Dados (dias)</form_1.FormLabel>
                        <form_1.FormControl>
                          <input_1.Input
                            type="number"
                            min="90"
                            max="2555"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 1825)}
                          />
                        </form_1.FormControl>
                        <form_1.FormDescription>
                          Tempo para manter dados arquivados (90-2555 dias)
                        </form_1.FormDescription>
                        <form_1.FormMessage />
                      </form_1.FormItem>
                    );
                  }}
                />
              </div>

              <form_1.FormField
                control={form.control}
                name="system.auditLogging"
                render={(_a) => {
                  var field = _a.field;
                  return (
                    <form_1.FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <form_1.FormLabel className="text-base">Log de Auditoria</form_1.FormLabel>
                        <form_1.FormDescription>
                          Registrar todas as ações para conformidade
                        </form_1.FormDescription>
                      </div>
                      <form_1.FormControl>
                        <switch_1.Switch checked={field.value} onCheckedChange={field.onChange} />
                      </form_1.FormControl>
                    </form_1.FormItem>
                  );
                }}
              />
            </card_1.CardContent>
          </card_1.Card>

          {/* Save Button */}
          <div className="sticky bottom-0 bg-white border-t p-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              {lastSaved && (
                <>
                  <lucide_react_1.CheckCircle2 className="h-4 w-4 text-green-600" />
                  Salvo em {lastSaved.toLocaleTimeString()}
                </>
              )}
            </div>
            <button_1.Button type="submit" disabled={isSaving} className="min-w-32">
              {isSaving
                ? <>
                    <lucide_react_1.Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                : <>
                    <lucide_react_1.Save className="mr-2 h-4 w-4" />
                    Salvar Preferências
                  </>}
            </button_1.Button>
          </div>
        </form>
      </form_1.Form>
    </div>
  );
}
