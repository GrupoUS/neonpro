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
exports.default = AutomationConfig;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var switch_1 = require("@/components/ui/switch");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var textarea_1 = require("@/components/ui/textarea");
var select_1 = require("@/components/ui/select");
var tabs_1 = require("@/components/ui/tabs");
var separator_1 = require("@/components/ui/separator");
var badge_1 = require("@/components/ui/badge");
var lucide_react_1 = require("lucide-react");
var use_toast_1 = require("@/components/ui/use-toast");
var defaultConfig = {
  enabled: false,
  schedules: {
    fullAutomation: {
      enabled: false,
      cron: "0 2 * * *",
      timezone: "America/Sao_Paulo",
    },
    consentManagement: {
      enabled: false,
      cron: "0 */6 * * *",
    },
    dataSubjectRights: {
      enabled: false,
      cron: "0 */4 * * *",
    },
    auditReporting: {
      enabled: false,
      cron: "0 1 * * 0",
    },
    anonymization: {
      enabled: false,
      cron: "0 3 * * 0",
    },
  },
  notifications: {
    email: {
      enabled: false,
      recipients: [],
      events: [],
    },
    webhook: {
      enabled: false,
      url: "",
      events: [],
    },
  },
  limits: {
    maxConcurrentJobs: 3,
    jobTimeout: 3600,
    retryAttempts: 3,
    batchSize: 100,
  },
  features: {
    autoConsentManagement: false,
    autoDataSubjectRights: false,
    autoAuditReporting: false,
    autoAnonymization: false,
    realTimeMonitoring: false,
    smartAlerts: false,
  },
};
function AutomationConfig() {
  var _this = this;
  var _a = (0, react_1.useState)(defaultConfig),
    config = _a[0],
    setConfig = _a[1];
  var _b = (0, react_1.useState)(true),
    loading = _b[0],
    setLoading = _b[1];
  var _c = (0, react_1.useState)(false),
    saving = _c[0],
    setSaving = _c[1];
  var _d = (0, react_1.useState)(false),
    hasChanges = _d[0],
    setHasChanges = _d[1];
  var toast = (0, use_toast_1.useToast)().toast;
  var loadConfig = function () {
    return __awaiter(_this, void 0, void 0, function () {
      var response, data, error_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 4, 5, 6]);
            setLoading(true);
            return [4 /*yield*/, fetch("/api/compliance/automation/config")];
          case 1:
            response = _a.sent();
            if (!response.ok) return [3 /*break*/, 3];
            return [4 /*yield*/, response.json()];
          case 2:
            data = _a.sent();
            setConfig(data.data);
            _a.label = 3;
          case 3:
            return [3 /*break*/, 6];
          case 4:
            error_1 = _a.sent();
            console.error("Erro ao carregar configuração:", error_1);
            toast({
              title: "Erro",
              description: "Falha ao carregar configuração",
              variant: "destructive",
            });
            return [3 /*break*/, 6];
          case 5:
            setLoading(false);
            return [7 /*endfinally*/];
          case 6:
            return [2 /*return*/];
        }
      });
    });
  };
  var saveConfig = function () {
    return __awaiter(_this, void 0, void 0, function () {
      var response, error_2;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, 3, 4]);
            setSaving(true);
            return [
              4 /*yield*/,
              fetch("/api/compliance/automation/config", {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(config),
              }),
            ];
          case 1:
            response = _a.sent();
            if (response.ok) {
              setHasChanges(false);
              toast({
                title: "Sucesso",
                description: "Configuração salva com sucesso",
              });
            } else {
              throw new Error("Falha ao salvar configuração");
            }
            return [3 /*break*/, 4];
          case 2:
            error_2 = _a.sent();
            console.error("Erro ao salvar configuração:", error_2);
            toast({
              title: "Erro",
              description: "Falha ao salvar configuração",
              variant: "destructive",
            });
            return [3 /*break*/, 4];
          case 3:
            setSaving(false);
            return [7 /*endfinally*/];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  (0, react_1.useEffect)(function () {
    loadConfig();
  }, []);
  var updateConfig = function (path, value) {
    setConfig(function (prev) {
      var newConfig = __assign({}, prev);
      var keys = path.split(".");
      var current = newConfig;
      for (var i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      setHasChanges(true);
      return newConfig;
    });
  };
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <lucide_react_1.RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando configurações...</span>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configuração da Automação</h1>
          <p className="text-muted-foreground">Configure os parâmetros da automação LGPD</p>
        </div>
        <div className="flex items-center space-x-2">
          {hasChanges && (
            <badge_1.Badge variant="outline" className="text-yellow-600">
              <lucide_react_1.AlertTriangle className="h-3 w-3 mr-1" />
              Alterações não salvas
            </badge_1.Badge>
          )}
          <button_1.Button onClick={saveConfig} disabled={saving || !hasChanges}>
            <lucide_react_1.Save className={"h-4 w-4 mr-2 ".concat(saving ? "animate-spin" : "")} />
            {saving ? "Salvando..." : "Salvar"}
          </button_1.Button>
        </div>
      </div>
      {/* Configuração Geral */}
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle className="flex items-center">
            <lucide_react_1.Settings className="h-5 w-5 mr-2" />
            Configuração Geral
          </card_1.CardTitle>
          <card_1.CardDescription>Configurações principais da automação</card_1.CardDescription>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="flex items-center justify-between">
            <div>
              <label_1.Label htmlFor="automation-enabled" className="text-base font-medium">
                Habilitar Automação
              </label_1.Label>
              <p className="text-sm text-muted-foreground">
                Ativa ou desativa todo o sistema de automação
              </p>
            </div>
            <switch_1.Switch
              id="automation-enabled"
              checked={config.enabled}
              onCheckedChange={function (checked) {
                return updateConfig("enabled", checked);
              }}
            />
          </div>
        </card_1.CardContent>
      </card_1.Card>

      {/* Tabs de Configuração */}
      <tabs_1.Tabs defaultValue="schedules" className="space-y-4">
        <tabs_1.TabsList className="grid w-full grid-cols-4">
          <tabs_1.TabsTrigger value="schedules">Agendamentos</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="features">Recursos</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="notifications">Notificações</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="limits">Limites</tabs_1.TabsTrigger>
        </tabs_1.TabsList>

        <tabs_1.TabsContent value="schedules" className="space-y-4">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle className="flex items-center">
                <lucide_react_1.Clock className="h-5 w-5 mr-2" />
                Agendamentos
              </card_1.CardTitle>
              <card_1.CardDescription>
                Configure quando cada processo deve ser executado
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent className="space-y-6">
              {/* Automação Completa */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label_1.Label className="text-base font-medium">
                    Automação Completa
                  </label_1.Label>
                  <switch_1.Switch
                    checked={config.schedules.fullAutomation.enabled}
                    onCheckedChange={function (checked) {
                      return updateConfig("schedules.fullAutomation.enabled", checked);
                    }}
                  />
                </div>
                {config.schedules.fullAutomation.enabled && (
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label_1.Label htmlFor="full-cron">Expressão Cron</label_1.Label>
                      <input_1.Input
                        id="full-cron"
                        value={config.schedules.fullAutomation.cron}
                        onChange={function (e) {
                          return updateConfig("schedules.fullAutomation.cron", e.target.value);
                        }}
                        placeholder="0 2 * * *"
                      />
                      <p className="text-xs text-muted-foreground mt-1">Diariamente às 02:00</p>
                    </div>
                    <div>
                      <label_1.Label htmlFor="timezone">Fuso Horário</label_1.Label>
                      <select_1.Select
                        value={config.schedules.fullAutomation.timezone}
                        onValueChange={function (value) {
                          return updateConfig("schedules.fullAutomation.timezone", value);
                        }}
                      >
                        <select_1.SelectTrigger>
                          <select_1.SelectValue />
                        </select_1.SelectTrigger>
                        <select_1.SelectContent>
                          <select_1.SelectItem value="America/Sao_Paulo">
                            São Paulo (UTC-3)
                          </select_1.SelectItem>
                          <select_1.SelectItem value="America/New_York">
                            New York (UTC-5)
                          </select_1.SelectItem>
                          <select_1.SelectItem value="Europe/London">
                            London (UTC+0)
                          </select_1.SelectItem>
                          <select_1.SelectItem value="UTC">UTC</select_1.SelectItem>
                        </select_1.SelectContent>
                      </select_1.Select>
                    </div>
                  </div>
                )}
              </div>

              <separator_1.Separator />

              {/* Gestão de Consentimentos */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label_1.Label className="text-base font-medium">
                      Gestão de Consentimentos
                    </label_1.Label>
                    <p className="text-sm text-muted-foreground">
                      Verificação e atualização de consentimentos
                    </p>
                  </div>
                  <switch_1.Switch
                    checked={config.schedules.consentManagement.enabled}
                    onCheckedChange={function (checked) {
                      return updateConfig("schedules.consentManagement.enabled", checked);
                    }}
                  />
                </div>
                {config.schedules.consentManagement.enabled && (
                  <div>
                    <label_1.Label htmlFor="consent-cron">Expressão Cron</label_1.Label>
                    <input_1.Input
                      id="consent-cron"
                      value={config.schedules.consentManagement.cron}
                      onChange={function (e) {
                        return updateConfig("schedules.consentManagement.cron", e.target.value);
                      }}
                      placeholder="0 */6 * * *"
                    />
                    <p className="text-xs text-muted-foreground mt-1">A cada 6 horas</p>
                  </div>
                )}
              </div>

              <separator_1.Separator />

              {/* Direitos dos Titulares */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label_1.Label className="text-base font-medium">
                      Direitos dos Titulares
                    </label_1.Label>
                    <p className="text-sm text-muted-foreground">
                      Processamento de solicitações de direitos
                    </p>
                  </div>
                  <switch_1.Switch
                    checked={config.schedules.dataSubjectRights.enabled}
                    onCheckedChange={function (checked) {
                      return updateConfig("schedules.dataSubjectRights.enabled", checked);
                    }}
                  />
                </div>
                {config.schedules.dataSubjectRights.enabled && (
                  <div>
                    <label_1.Label htmlFor="rights-cron">Expressão Cron</label_1.Label>
                    <input_1.Input
                      id="rights-cron"
                      value={config.schedules.dataSubjectRights.cron}
                      onChange={function (e) {
                        return updateConfig("schedules.dataSubjectRights.cron", e.target.value);
                      }}
                      placeholder="0 */4 * * *"
                    />
                    <p className="text-xs text-muted-foreground mt-1">A cada 4 horas</p>
                  </div>
                )}
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>
        <tabs_1.TabsContent value="features" className="space-y-4">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle className="flex items-center">
                <lucide_react_1.Shield className="h-5 w-5 mr-2" />
                Recursos da Automação
              </card_1.CardTitle>
              <card_1.CardDescription>
                Habilite ou desabilite recursos específicos
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label_1.Label className="text-base font-medium">
                      Gestão Automática de Consentimentos
                    </label_1.Label>
                    <p className="text-sm text-muted-foreground">
                      Verificação e renovação automática de consentimentos
                    </p>
                  </div>
                  <switch_1.Switch
                    checked={config.features.autoConsentManagement}
                    onCheckedChange={function (checked) {
                      return updateConfig("features.autoConsentManagement", checked);
                    }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label_1.Label className="text-base font-medium">
                      Processamento de Direitos dos Titulares
                    </label_1.Label>
                    <p className="text-sm text-muted-foreground">
                      Processamento automático de solicitações de direitos
                    </p>
                  </div>
                  <switch_1.Switch
                    checked={config.features.autoDataSubjectRights}
                    onCheckedChange={function (checked) {
                      return updateConfig("features.autoDataSubjectRights", checked);
                    }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label_1.Label className="text-base font-medium">
                      Relatórios de Auditoria Automáticos
                    </label_1.Label>
                    <p className="text-sm text-muted-foreground">
                      Geração automática de relatórios de conformidade
                    </p>
                  </div>
                  <switch_1.Switch
                    checked={config.features.autoAuditReporting}
                    onCheckedChange={function (checked) {
                      return updateConfig("features.autoAuditReporting", checked);
                    }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label_1.Label className="text-base font-medium">
                      Anonimização Automática
                    </label_1.Label>
                    <p className="text-sm text-muted-foreground">
                      Anonimização automática de dados antigos
                    </p>
                  </div>
                  <switch_1.Switch
                    checked={config.features.autoAnonymization}
                    onCheckedChange={function (checked) {
                      return updateConfig("features.autoAnonymization", checked);
                    }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label_1.Label className="text-base font-medium">
                      Monitoramento em Tempo Real
                    </label_1.Label>
                    <p className="text-sm text-muted-foreground">
                      Monitoramento contínuo de conformidade
                    </p>
                  </div>
                  <switch_1.Switch
                    checked={config.features.realTimeMonitoring}
                    onCheckedChange={function (checked) {
                      return updateConfig("features.realTimeMonitoring", checked);
                    }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label_1.Label className="text-base font-medium">
                      Alertas Inteligentes
                    </label_1.Label>
                    <p className="text-sm text-muted-foreground">
                      Sistema de alertas baseado em IA
                    </p>
                  </div>
                  <switch_1.Switch
                    checked={config.features.smartAlerts}
                    onCheckedChange={function (checked) {
                      return updateConfig("features.smartAlerts", checked);
                    }}
                  />
                </div>
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="notifications" className="space-y-4">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle className="flex items-center">
                <lucide_react_1.Bell className="h-5 w-5 mr-2" />
                Notificações
              </card_1.CardTitle>
              <card_1.CardDescription>
                Configure como e quando receber notificações
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent className="space-y-6">
              {/* Email */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label_1.Label className="text-base font-medium">
                    Notificações por Email
                  </label_1.Label>
                  <switch_1.Switch
                    checked={config.notifications.email.enabled}
                    onCheckedChange={function (checked) {
                      return updateConfig("notifications.email.enabled", checked);
                    }}
                  />
                </div>
                {config.notifications.email.enabled && (
                  <div className="space-y-4">
                    <div>
                      <label_1.Label htmlFor="email-recipients">Destinatários</label_1.Label>
                      <textarea_1.Textarea
                        id="email-recipients"
                        value={config.notifications.email.recipients.join("\n")}
                        onChange={function (e) {
                          return updateConfig(
                            "notifications.email.recipients",
                            e.target.value.split("\n").filter(function (email) {
                              return email.trim();
                            }),
                          );
                        }}
                        placeholder="admin@clinica.com\nresponsavel@clinica.com"
                        rows={3}
                      />
                      <p className="text-xs text-muted-foreground mt-1">Um email por linha</p>
                    </div>
                  </div>
                )}
              </div>

              <separator_1.Separator />

              {/* Webhook */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label_1.Label className="text-base font-medium">Webhook</label_1.Label>
                  <switch_1.Switch
                    checked={config.notifications.webhook.enabled}
                    onCheckedChange={function (checked) {
                      return updateConfig("notifications.webhook.enabled", checked);
                    }}
                  />
                </div>
                {config.notifications.webhook.enabled && (
                  <div>
                    <label_1.Label htmlFor="webhook-url">URL do Webhook</label_1.Label>
                    <input_1.Input
                      id="webhook-url"
                      value={config.notifications.webhook.url}
                      onChange={function (e) {
                        return updateConfig("notifications.webhook.url", e.target.value);
                      }}
                      placeholder="https://api.exemplo.com/webhook"
                    />
                  </div>
                )}
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="limits" className="space-y-4">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle className="flex items-center">
                <lucide_react_1.Database className="h-5 w-5 mr-2" />
                Limites e Performance
              </card_1.CardTitle>
              <card_1.CardDescription>
                Configure limites de execução e performance
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label_1.Label htmlFor="max-jobs">Máximo de Jobs Simultâneos</label_1.Label>
                  <input_1.Input
                    id="max-jobs"
                    type="number"
                    min="1"
                    max="10"
                    value={config.limits.maxConcurrentJobs}
                    onChange={function (e) {
                      return updateConfig("limits.maxConcurrentJobs", parseInt(e.target.value));
                    }}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Número máximo de processos executando simultaneamente
                  </p>
                </div>

                <div>
                  <label_1.Label htmlFor="job-timeout">Timeout de Job (segundos)</label_1.Label>
                  <input_1.Input
                    id="job-timeout"
                    type="number"
                    min="300"
                    max="7200"
                    value={config.limits.jobTimeout}
                    onChange={function (e) {
                      return updateConfig("limits.jobTimeout", parseInt(e.target.value));
                    }}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Tempo limite para execução de cada job
                  </p>
                </div>

                <div>
                  <label_1.Label htmlFor="retry-attempts">Tentativas de Retry</label_1.Label>
                  <input_1.Input
                    id="retry-attempts"
                    type="number"
                    min="0"
                    max="5"
                    value={config.limits.retryAttempts}
                    onChange={function (e) {
                      return updateConfig("limits.retryAttempts", parseInt(e.target.value));
                    }}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Número de tentativas em caso de falha
                  </p>
                </div>

                <div>
                  <label_1.Label htmlFor="batch-size">Tamanho do Lote</label_1.Label>
                  <input_1.Input
                    id="batch-size"
                    type="number"
                    min="10"
                    max="1000"
                    value={config.limits.batchSize}
                    onChange={function (e) {
                      return updateConfig("limits.batchSize", parseInt(e.target.value));
                    }}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Número de registros processados por lote
                  </p>
                </div>
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>
      </tabs_1.Tabs>
    </div>
  );
}
