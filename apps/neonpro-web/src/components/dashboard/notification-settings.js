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
exports.NotificationSettings = NotificationSettings;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var label_1 = require("@/components/ui/label");
var switch_1 = require("@/components/ui/switch");
var select_1 = require("@/components/ui/select");
var separator_1 = require("@/components/ui/separator");
var badge_1 = require("@/components/ui/badge");
var lucide_react_1 = require("lucide-react");
var sonner_1 = require("sonner");
var notification_context_1 = require("@/contexts/notification-context");
function NotificationSettings(_a) {
  var className = _a.className;
  var _b = (0, notification_context_1.useNotificationContext)(),
    preferences = _b.preferences,
    updatePreferences = _b.updatePreferences,
    requestPermission = _b.requestPermission,
    isLoading = _b.isLoading;
  var _c = (0, react_1.useState)(false),
    saving = _c[0],
    setSaving = _c[1];
  var _d = (0, react_1.useState)(
      typeof window !== "undefined" && "Notification" in window
        ? Notification.permission
        : "denied",
    ),
    permissionStatus = _d[0],
    setPermissionStatus = _d[1];
  var handlePreferenceChange = (key, value) =>
    __awaiter(this, void 0, void 0, function () {
      var error_1;
      var _a;
      return __generator(this, (_b) => {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            return [4 /*yield*/, updatePreferences(((_a = {}), (_a[key] = value), _a))];
          case 1:
            _b.sent();
            sonner_1.toast.success("Configuração atualizada!");
            return [3 /*break*/, 3];
          case 2:
            error_1 = _b.sent();
            sonner_1.toast.error("Erro ao atualizar configuração");
            console.error("Error updating preference:", error_1);
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  var handleRequestPermission = () =>
    __awaiter(this, void 0, void 0, function () {
      var permission, error_2;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 4, , 5]);
            return [4 /*yield*/, requestPermission()];
          case 1:
            permission = _a.sent();
            setPermissionStatus(permission);
            if (!(permission === "granted")) return [3 /*break*/, 3];
            // Enable push notifications when permission is granted
            return [4 /*yield*/, handlePreferenceChange("push_enabled", true)];
          case 2:
            // Enable push notifications when permission is granted
            _a.sent();
            _a.label = 3;
          case 3:
            return [3 /*break*/, 5];
          case 4:
            error_2 = _a.sent();
            sonner_1.toast.error("Erro ao solicitar permissão");
            return [3 /*break*/, 5];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  var settingsSections = [
    {
      title: "Notificações por Email",
      description: "Receba notificações importantes por email",
      icon: lucide_react_1.Mail,
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
      icon: lucide_react_1.Smartphone,
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
      icon: lucide_react_1.Bell,
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
      icon: lucide_react_1.Clock,
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
      icon: lucide_react_1.VolumeX,
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
      <card_1.Card className={className}>
        <card_1.CardContent className="flex justify-center p-6">
          <lucide_react_1.RefreshCw className="h-6 w-6 animate-spin" />
        </card_1.CardContent>
      </card_1.Card>
    );
  }
  return (
    <div className={"space-y-6 ".concat(className)}>
      {/* Browser Permission Status */}
      {typeof window !== "undefined" && "Notification" in window && (
        <card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle className="flex items-center gap-2">
              <lucide_react_1.Settings className="h-5 w-5" />
              Status das Permissões
            </card_1.CardTitle>
            <card_1.CardDescription>
              Status das permissões do navegador para notificações
            </card_1.CardDescription>
          </card_1.CardHeader>
          <card_1.CardContent>
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
                <badge_1.Badge variant={permissionStatus === "granted" ? "default" : "destructive"}>
                  {permissionStatus === "granted" && "Ativado"}
                  {permissionStatus === "denied" && "Bloqueado"}
                  {permissionStatus === "default" && "Pendente"}
                </badge_1.Badge>
                {permissionStatus !== "granted" && (
                  <button_1.Button
                    size="sm"
                    onClick={handleRequestPermission}
                    disabled={permissionStatus === "denied"}
                  >
                    Permitir
                  </button_1.Button>
                )}
              </div>
            </div>
          </card_1.CardContent>
        </card_1.Card>
      )}

      {/* Settings Sections */}
      {settingsSections.map((section, sectionIndex) => (
        <card_1.Card key={section.title}>
          <card_1.CardHeader>
            <card_1.CardTitle className="flex items-center gap-2">
              <section.icon className="h-5 w-5" />
              {section.title}
            </card_1.CardTitle>
            <card_1.CardDescription>{section.description}</card_1.CardDescription>
          </card_1.CardHeader>
          <card_1.CardContent className="space-y-6">
            {section.settings.map((setting, settingIndex) => (
              <div key={setting.key}>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label_1.Label htmlFor={setting.key}>{setting.label}</label_1.Label>
                    <p className="text-sm text-muted-foreground">{setting.description}</p>
                  </div>

                  <div className="flex items-center">
                    {setting.type === "switch" && (
                      <switch_1.Switch
                        id={setting.key}
                        checked={preferences[setting.key]}
                        onCheckedChange={(checked) => handlePreferenceChange(setting.key, checked)}
                        disabled={saving}
                      />
                    )}

                    {setting.type === "select" && setting.options && (
                      <select_1.Select
                        value={String(preferences[setting.key] || "")}
                        onValueChange={(value) =>
                          handlePreferenceChange(setting.key, parseInt(value))
                        }
                      >
                        <select_1.SelectTrigger className="w-48">
                          <select_1.SelectValue />
                        </select_1.SelectTrigger>
                        <select_1.SelectContent>
                          {setting.options.map((option) => (
                            <select_1.SelectItem key={option.value} value={String(option.value)}>
                              {option.label}
                            </select_1.SelectItem>
                          ))}
                        </select_1.SelectContent>
                      </select_1.Select>
                    )}

                    {setting.type === "time" && (
                      <input
                        type="time"
                        id={setting.key}
                        value={preferences[setting.key] || ""}
                        onChange={(e) => handlePreferenceChange(setting.key, e.target.value)}
                        className="px-3 py-2 border border-input bg-background rounded-md text-sm"
                        disabled={saving}
                      />
                    )}
                  </div>
                </div>

                {settingIndex < section.settings.length - 1 && (
                  <separator_1.Separator className="mt-6" />
                )}
              </div>
            ))}
          </card_1.CardContent>
        </card_1.Card>
      ))}

      {/* Test Notification */}
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle className="flex items-center gap-2">
            <lucide_react_1.Volume2 className="h-5 w-5" />
            Testar Notificações
          </card_1.CardTitle>
          <card_1.CardDescription>
            Envie uma notificação de teste para verificar suas configurações
          </card_1.CardDescription>
        </card_1.CardHeader>
        <card_1.CardContent>
          <button_1.Button
            onClick={() => {
              sonner_1.toast.success("Teste de notificação!", {
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
          </button_1.Button>
        </card_1.CardContent>
      </card_1.Card>
    </div>
  );
}
