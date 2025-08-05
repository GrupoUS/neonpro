"use client";
"use strict";
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
      };
    return __assign.apply(this, arguments);
  };
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
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
  };
var __generator =
  (this && this.__generator) ||
  function (thisArg, body) {
    var _ = {
        label: 0,
        sent: function () {
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
      return function (v) {
        return step([n, v]);
      };
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
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = IntegrationSettings;
var react_1 = require("react");
var react_hook_form_1 = require("react-hook-form");
var zod_1 = require("@hookform/resolvers/zod");
var z = require("zod");
var card_1 = require("@/components/ui/card");
var form_1 = require("@/components/ui/form");
var input_1 = require("@/components/ui/input");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var switch_1 = require("@/components/ui/switch");
var tabs_1 = require("@/components/ui/tabs");
var alert_1 = require("@/components/ui/alert");
var lucide_react_1 = require("lucide-react");
var sonner_1 = require("sonner");
var integrationSettingsSchema = z.object({
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
function IntegrationSettings() {
  var _this = this;
  var _a = (0, react_1.useState)(false),
    isLoading = _a[0],
    setIsLoading = _a[1];
  var _b = (0, react_1.useState)(false),
    isSaving = _b[0],
    setIsSaving = _b[1];
  var _c = (0, react_1.useState)(null),
    lastSaved = _c[0],
    setLastSaved = _c[1];
  var _d = (0, react_1.useState)("whatsapp"),
    activeTab = _d[0],
    setActiveTab = _d[1];
  var _e = (0, react_1.useState)({}),
    connectionStatus = _e[0],
    setConnectionStatus = _e[1];
  var form = (0, react_hook_form_1.useForm)({
    resolver: (0, zod_1.zodResolver)(integrationSettingsSchema),
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
  (0, react_1.useEffect)(
    function () {
      var loadIntegrationSettings = function () {
        return __awaiter(_this, void 0, void 0, function () {
          return __generator(this, function (_a) {
            setIsLoading(true);
            try {
              // TODO: Replace with actual API call
              // const response = await fetch("/api/settings/integrations");
              // const data = await response.json();
              // form.reset(data);
            } catch (error) {
              console.error("Erro ao carregar integrações:", error);
              sonner_1.toast.error("Erro ao carregar configurações de integração");
            } finally {
              setIsLoading(false);
            }
            return [2 /*return*/];
          });
        });
      };
      loadIntegrationSettings();
    },
    [form],
  );
  var onSubmit = function (data) {
    return __awaiter(_this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        setIsSaving(true);
        try {
          // TODO: Replace with actual API call
          // await fetch("/api/settings/integrations", {
          //   method: "POST",
          //   headers: { "Content-Type": "application/json" },
          //   body: JSON.stringify(data),
          // });
          setLastSaved(new Date());
          sonner_1.toast.success("Configurações de integração salvas com sucesso!");
        } catch (error) {
          console.error("Erro ao salvar configurações:", error);
          sonner_1.toast.error("Erro ao salvar configurações");
        } finally {
          setIsSaving(false);
        }
        return [2 /*return*/];
      });
    });
  };
  var testConnection = function (service) {
    return __awaiter(_this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        try {
          setConnectionStatus(function (prev) {
            var _a;
            return __assign(__assign({}, prev), ((_a = {}), (_a[service] = false), _a));
          });
          // TODO: Replace with actual API call
          // const response = await fetch(`/api/integrations/test/${service}`, {
          //   method: "POST",
          //   headers: { "Content-Type": "application/json" },
          //   body: JSON.stringify(form.getValues()),
          // });
          // Mock success for demo
          setTimeout(function () {
            setConnectionStatus(function (prev) {
              var _a;
              return __assign(__assign({}, prev), ((_a = {}), (_a[service] = true), _a));
            });
            sonner_1.toast.success("Conex\u00E3o com ".concat(service, " testada com sucesso!"));
          }, 2000);
        } catch (error) {
          setConnectionStatus(function (prev) {
            var _a;
            return __assign(__assign({}, prev), ((_a = {}), (_a[service] = false), _a));
          });
          sonner_1.toast.error("Erro ao testar conex\u00E3o com ".concat(service));
        }
        return [2 /*return*/];
      });
    });
  };
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <lucide_react_1.Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <alert_1.Alert>
        <lucide_react_1.Plug className="h-4 w-4" />
        <alert_1.AlertDescription>
          <strong>Integrações:</strong> Configure APIs e serviços externos para automatizar
          comunicações e melhorar a experiência do paciente.
        </alert_1.AlertDescription>
      </alert_1.Alert>

      <form_1.Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <tabs_1.Tabs value={activeTab} onValueChange={setActiveTab}>
            <tabs_1.TabsList className="grid w-full grid-cols-4">
              <tabs_1.TabsTrigger value="whatsapp" className="flex items-center gap-2">
                <lucide_react_1.MessageSquare className="h-4 w-4" />
                WhatsApp
              </tabs_1.TabsTrigger>
              <tabs_1.TabsTrigger value="email" className="flex items-center gap-2">
                <lucide_react_1.Mail className="h-4 w-4" />
                Email
              </tabs_1.TabsTrigger>
              <tabs_1.TabsTrigger value="sms" className="flex items-center gap-2">
                <lucide_react_1.Phone className="h-4 w-4" />
                SMS
              </tabs_1.TabsTrigger>
              <tabs_1.TabsTrigger value="others" className="flex items-center gap-2">
                <lucide_react_1.Plug className="h-4 w-4" />
                Outros
              </tabs_1.TabsTrigger>
            </tabs_1.TabsList>

            {/* WhatsApp Tab */}
            <tabs_1.TabsContent value="whatsapp" className="space-y-6">
              <card_1.Card>
                <card_1.CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <card_1.CardTitle className="flex items-center gap-2">
                        <lucide_react_1.MessageSquare className="h-5 w-5" />
                        WhatsApp Business
                      </card_1.CardTitle>
                      <card_1.CardDescription>
                        Integração com WhatsApp Business API para comunicação com pacientes
                      </card_1.CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {connectionStatus.whatsapp !== undefined && (
                        <badge_1.Badge
                          className={
                            connectionStatus.whatsapp
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }
                        >
                          {connectionStatus.whatsapp
                            ? <>
                                <lucide_react_1.CheckCircle2 className="h-3 w-3 mr-1" />
                                Conectado
                              </>
                            : <>
                                <lucide_react_1.XCircle className="h-3 w-3 mr-1" />
                                Erro na conexão
                              </>}
                        </badge_1.Badge>
                      )}
                      <button_1.Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={function () {
                          return testConnection("whatsapp");
                        }}
                        disabled={!form.watch("whatsapp.enabled")}
                      >
                        <lucide_react_1.TestTube className="h-4 w-4 mr-2" />
                        Testar Conexão
                      </button_1.Button>
                    </div>
                  </div>
                </card_1.CardHeader>
                <card_1.CardContent className="space-y-6">
                  <form_1.FormField
                    control={form.control}
                    name="whatsapp.enabled"
                    render={function (_a) {
                      var field = _a.field;
                      return (
                        <form_1.FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <form_1.FormLabel className="text-base">
                              Habilitar WhatsApp Business
                            </form_1.FormLabel>
                            <form_1.FormDescription>
                              Ativar integração com WhatsApp para comunicação automatizada
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

                  {form.watch("whatsapp.enabled") && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <form_1.FormField
                          control={form.control}
                          name="whatsapp.phoneNumber"
                          render={function (_a) {
                            var field = _a.field;
                            return (
                              <form_1.FormItem>
                                <form_1.FormLabel>Número do WhatsApp Business</form_1.FormLabel>
                                <form_1.FormControl>
                                  <input_1.Input placeholder="+55 11 99999-9999" {...field} />
                                </form_1.FormControl>
                                <form_1.FormDescription>
                                  Número registrado no WhatsApp Business
                                </form_1.FormDescription>
                                <form_1.FormMessage />
                              </form_1.FormItem>
                            );
                          }}
                        />

                        <form_1.FormField
                          control={form.control}
                          name="whatsapp.businessAccountId"
                          render={function (_a) {
                            var field = _a.field;
                            return (
                              <form_1.FormItem>
                                <form_1.FormLabel>Business Account ID</form_1.FormLabel>
                                <form_1.FormControl>
                                  <input_1.Input placeholder="1234567890123456" {...field} />
                                </form_1.FormControl>
                                <form_1.FormDescription>
                                  ID da conta business do WhatsApp
                                </form_1.FormDescription>
                                <form_1.FormMessage />
                              </form_1.FormItem>
                            );
                          }}
                        />
                      </div>

                      <form_1.FormField
                        control={form.control}
                        name="whatsapp.accessToken"
                        render={function (_a) {
                          var field = _a.field;
                          return (
                            <form_1.FormItem>
                              <form_1.FormLabel>Access Token</form_1.FormLabel>
                              <form_1.FormControl>
                                <input_1.Input
                                  type="password"
                                  placeholder="EAABsBCS..."
                                  {...field}
                                />
                              </form_1.FormControl>
                              <form_1.FormDescription>
                                Token de acesso do WhatsApp Business API
                              </form_1.FormDescription>
                              <form_1.FormMessage />
                            </form_1.FormItem>
                          );
                        }}
                      />

                      <form_1.FormField
                        control={form.control}
                        name="whatsapp.webhookUrl"
                        render={function (_a) {
                          var field = _a.field;
                          return (
                            <form_1.FormItem>
                              <form_1.FormLabel>Webhook URL</form_1.FormLabel>
                              <form_1.FormControl>
                                <input_1.Input
                                  placeholder="https://suaapi.com/webhook/whatsapp"
                                  {...field}
                                />
                              </form_1.FormControl>
                              <form_1.FormDescription>
                                URL para receber callbacks do WhatsApp
                              </form_1.FormDescription>
                              <form_1.FormMessage />
                            </form_1.FormItem>
                          );
                        }}
                      />

                      <div className="space-y-4">
                        <h4 className="font-medium">Funcionalidades</h4>

                        <form_1.FormField
                          control={form.control}
                          name="whatsapp.enableAppointmentReminders"
                          render={function (_a) {
                            var field = _a.field;
                            return (
                              <form_1.FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                                <div className="space-y-0.5">
                                  <form_1.FormLabel>Lembretes de Consulta</form_1.FormLabel>
                                  <form_1.FormDescription>
                                    Enviar lembretes automáticos por WhatsApp
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
                          name="whatsapp.enableConfirmations"
                          render={function (_a) {
                            var field = _a.field;
                            return (
                              <form_1.FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                                <div className="space-y-0.5">
                                  <form_1.FormLabel>Confirmações de Agendamento</form_1.FormLabel>
                                  <form_1.FormDescription>
                                    Solicitar confirmação de presença
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
                          name="whatsapp.enableStatusUpdates"
                          render={function (_a) {
                            var field = _a.field;
                            return (
                              <form_1.FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                                <div className="space-y-0.5">
                                  <form_1.FormLabel>Atualizações de Status</form_1.FormLabel>
                                  <form_1.FormDescription>
                                    Notificar mudanças no status da consulta
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
                    </>
                  )}
                </card_1.CardContent>
              </card_1.Card>
            </tabs_1.TabsContent>

            {/* Email Tab */}
            <tabs_1.TabsContent value="email" className="space-y-6">
              <card_1.Card>
                <card_1.CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <card_1.CardTitle className="flex items-center gap-2">
                        <lucide_react_1.Mail className="h-5 w-5" />
                        Email Marketing
                      </card_1.CardTitle>
                      <card_1.CardDescription>
                        Configuração de SMTP e provedores de email
                      </card_1.CardDescription>
                    </div>
                    <button_1.Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={function () {
                        return testConnection("email");
                      }}
                      disabled={!form.watch("email.enabled")}
                    >
                      <lucide_react_1.TestTube className="h-4 w-4 mr-2" />
                      Testar Email
                    </button_1.Button>
                  </div>
                </card_1.CardHeader>
                <card_1.CardContent className="space-y-6">
                  <form_1.FormField
                    control={form.control}
                    name="email.enabled"
                    render={function (_a) {
                      var field = _a.field;
                      return (
                        <form_1.FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <form_1.FormLabel className="text-base">
                              Habilitar Email
                            </form_1.FormLabel>
                            <form_1.FormDescription>
                              Ativar envio de emails automatizados
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

                  {form.watch("email.enabled") && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <form_1.FormField
                          control={form.control}
                          name="email.fromName"
                          render={function (_a) {
                            var field = _a.field;
                            return (
                              <form_1.FormItem>
                                <form_1.FormLabel>Nome do Remetente</form_1.FormLabel>
                                <form_1.FormControl>
                                  <input_1.Input placeholder="Clínica ABC" {...field} />
                                </form_1.FormControl>
                                <form_1.FormMessage />
                              </form_1.FormItem>
                            );
                          }}
                        />

                        <form_1.FormField
                          control={form.control}
                          name="email.fromEmail"
                          render={function (_a) {
                            var field = _a.field;
                            return (
                              <form_1.FormItem>
                                <form_1.FormLabel>Email do Remetente</form_1.FormLabel>
                                <form_1.FormControl>
                                  <input_1.Input
                                    type="email"
                                    placeholder="contato@clinica.com.br"
                                    {...field}
                                  />
                                </form_1.FormControl>
                                <form_1.FormMessage />
                              </form_1.FormItem>
                            );
                          }}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <form_1.FormField
                          control={form.control}
                          name="email.smtpHost"
                          render={function (_a) {
                            var field = _a.field;
                            return (
                              <form_1.FormItem>
                                <form_1.FormLabel>Servidor SMTP</form_1.FormLabel>
                                <form_1.FormControl>
                                  <input_1.Input placeholder="smtp.gmail.com" {...field} />
                                </form_1.FormControl>
                                <form_1.FormMessage />
                              </form_1.FormItem>
                            );
                          }}
                        />

                        <form_1.FormField
                          control={form.control}
                          name="email.smtpPort"
                          render={function (_a) {
                            var field = _a.field;
                            return (
                              <form_1.FormItem>
                                <form_1.FormLabel>Porta SMTP</form_1.FormLabel>
                                <form_1.FormControl>
                                  <input_1.Input
                                    type="number"
                                    placeholder="587"
                                    {...field}
                                    onChange={function (e) {
                                      return field.onChange(parseInt(e.target.value) || 587);
                                    }}
                                  />
                                </form_1.FormControl>
                                <form_1.FormMessage />
                              </form_1.FormItem>
                            );
                          }}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <form_1.FormField
                          control={form.control}
                          name="email.smtpUser"
                          render={function (_a) {
                            var field = _a.field;
                            return (
                              <form_1.FormItem>
                                <form_1.FormLabel>Usuário SMTP</form_1.FormLabel>
                                <form_1.FormControl>
                                  <input_1.Input placeholder="contato@clinica.com.br" {...field} />
                                </form_1.FormControl>
                                <form_1.FormMessage />
                              </form_1.FormItem>
                            );
                          }}
                        />

                        <form_1.FormField
                          control={form.control}
                          name="email.smtpPassword"
                          render={function (_a) {
                            var field = _a.field;
                            return (
                              <form_1.FormItem>
                                <form_1.FormLabel>Senha SMTP</form_1.FormLabel>
                                <form_1.FormControl>
                                  <input_1.Input
                                    type="password"
                                    placeholder="••••••••"
                                    {...field}
                                  />
                                </form_1.FormControl>
                                <form_1.FormMessage />
                              </form_1.FormItem>
                            );
                          }}
                        />
                      </div>
                    </>
                  )}
                </card_1.CardContent>
              </card_1.Card>
            </tabs_1.TabsContent>

            {/* SMS Tab */}
            <tabs_1.TabsContent value="sms" className="space-y-6">
              <card_1.Card>
                <card_1.CardHeader>
                  <card_1.CardTitle className="flex items-center gap-2">
                    <lucide_react_1.Phone className="h-5 w-5" />
                    SMS
                  </card_1.CardTitle>
                  <card_1.CardDescription>
                    Configuração de provedores SMS brasileiros
                  </card_1.CardDescription>
                </card_1.CardHeader>
                <card_1.CardContent className="space-y-6">
                  <form_1.FormField
                    control={form.control}
                    name="sms.enabled"
                    render={function (_a) {
                      var field = _a.field;
                      return (
                        <form_1.FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <form_1.FormLabel className="text-base">Habilitar SMS</form_1.FormLabel>
                            <form_1.FormDescription>
                              Ativar envio de SMS para pacientes
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

                  {form.watch("sms.enabled") && (
                    <>
                      <form_1.FormField
                        control={form.control}
                        name="sms.provider"
                        render={function (_a) {
                          var field = _a.field;
                          return (
                            <form_1.FormItem>
                              <form_1.FormLabel>Provedor SMS</form_1.FormLabel>
                              <form_1.FormControl>
                                <select
                                  className="w-full p-2 border rounded-md"
                                  value={field.value}
                                  onChange={field.onChange}
                                >
                                  <option value="zenvia">Zenvia</option>
                                  <option value="totalvoice">TotalVoice</option>
                                  <option value="twilio">Twilio</option>
                                </select>
                              </form_1.FormControl>
                              <form_1.FormDescription>
                                Provedor brasileiro para envio de SMS
                              </form_1.FormDescription>
                              <form_1.FormMessage />
                            </form_1.FormItem>
                          );
                        }}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <form_1.FormField
                          control={form.control}
                          name="sms.accountSid"
                          render={function (_a) {
                            var field = _a.field;
                            return (
                              <form_1.FormItem>
                                <form_1.FormLabel>Account SID</form_1.FormLabel>
                                <form_1.FormControl>
                                  <input_1.Input placeholder="AC1234567890" {...field} />
                                </form_1.FormControl>
                                <form_1.FormMessage />
                              </form_1.FormItem>
                            );
                          }}
                        />

                        <form_1.FormField
                          control={form.control}
                          name="sms.authToken"
                          render={function (_a) {
                            var field = _a.field;
                            return (
                              <form_1.FormItem>
                                <form_1.FormLabel>Auth Token</form_1.FormLabel>
                                <form_1.FormControl>
                                  <input_1.Input
                                    type="password"
                                    placeholder="••••••••"
                                    {...field}
                                  />
                                </form_1.FormControl>
                                <form_1.FormMessage />
                              </form_1.FormItem>
                            );
                          }}
                        />
                      </div>
                    </>
                  )}
                </card_1.CardContent>
              </card_1.Card>
            </tabs_1.TabsContent>

            {/* Others Tab */}
            <tabs_1.TabsContent value="others" className="space-y-6">
              <card_1.Card>
                <card_1.CardHeader>
                  <card_1.CardTitle>Outras Integrações</card_1.CardTitle>
                  <card_1.CardDescription>
                    Calendários, gateways de pagamento e outras APIs
                  </card_1.CardDescription>
                </card_1.CardHeader>
                <card_1.CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">Gateways de Pagamento</h4>

                    <form_1.FormField
                      control={form.control}
                      name="paymentGateways.mercadoPagoAccessToken"
                      render={function (_a) {
                        var field = _a.field;
                        return (
                          <form_1.FormItem>
                            <form_1.FormLabel>Mercado Pago Access Token</form_1.FormLabel>
                            <form_1.FormControl>
                              <input_1.Input type="password" placeholder="APP_USR-..." {...field} />
                            </form_1.FormControl>
                            <form_1.FormDescription>
                              Token para integração com Mercado Pago
                            </form_1.FormDescription>
                            <form_1.FormMessage />
                          </form_1.FormItem>
                        );
                      }}
                    />

                    <form_1.FormField
                      control={form.control}
                      name="paymentGateways.pixApiKey"
                      render={function (_a) {
                        var field = _a.field;
                        return (
                          <form_1.FormItem>
                            <form_1.FormLabel>PIX API Key</form_1.FormLabel>
                            <form_1.FormControl>
                              <input_1.Input type="password" placeholder="sk_..." {...field} />
                            </form_1.FormControl>
                            <form_1.FormDescription>
                              Chave API para geração de PIX
                            </form_1.FormDescription>
                            <form_1.FormMessage />
                          </form_1.FormItem>
                        );
                      }}
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
                      <form_1.FormField
                        control={form.control}
                        name="calendar.googleCalendar.enabled"
                        render={function (_a) {
                          var field = _a.field;
                          return (
                            <form_1.FormControl>
                              <switch_1.Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </form_1.FormControl>
                          );
                        }}
                      />
                    </div>

                    {form.watch("calendar.googleCalendar.enabled") && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <form_1.FormField
                          control={form.control}
                          name="calendar.googleCalendar.clientId"
                          render={function (_a) {
                            var field = _a.field;
                            return (
                              <form_1.FormItem>
                                <form_1.FormLabel>Client ID</form_1.FormLabel>
                                <form_1.FormControl>
                                  <input_1.Input
                                    placeholder="123456789.apps.googleusercontent.com"
                                    {...field}
                                  />
                                </form_1.FormControl>
                                <form_1.FormMessage />
                              </form_1.FormItem>
                            );
                          }}
                        />

                        <form_1.FormField
                          control={form.control}
                          name="calendar.googleCalendar.clientSecret"
                          render={function (_a) {
                            var field = _a.field;
                            return (
                              <form_1.FormItem>
                                <form_1.FormLabel>Client Secret</form_1.FormLabel>
                                <form_1.FormControl>
                                  <input_1.Input
                                    type="password"
                                    placeholder="GOCSPX-..."
                                    {...field}
                                  />
                                </form_1.FormControl>
                                <form_1.FormMessage />
                              </form_1.FormItem>
                            );
                          }}
                        />
                      </div>
                    )}
                  </div>
                </card_1.CardContent>
              </card_1.Card>
            </tabs_1.TabsContent>
          </tabs_1.Tabs>

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
                    Salvar Integrações
                  </>}
            </button_1.Button>
          </div>
        </form>
      </form_1.Form>
    </div>
  );
}
