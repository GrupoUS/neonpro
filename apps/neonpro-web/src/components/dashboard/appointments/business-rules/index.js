"use client";
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      ((t) => {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.hasOwn(s, p)) t[p] = s[p];
        }
        return t;
      });
    return __assign.apply(this, arguments);
  };
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
exports.BusinessRulesConfigPanel = BusinessRulesConfigPanel;
// =============================================
// NeonPro Business Rules Configuration Panel
// Story 1.2: Unified business rules management
// =============================================
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var tabs_1 = require("@/components/ui/tabs");
var lucide_react_1 = require("lucide-react");
var react_1 = require("react");
var sonner_1 = require("sonner");
var clinic_holiday_manager_1 = require("./clinic-holiday-manager");
var service_type_rule_manager_1 = require("./service-type-rule-manager");
function BusinessRulesConfigPanel(_a) {
  var clinicId = _a.clinicId,
    onConfigurationChange = _a.onConfigurationChange;
  var _b = (0, react_1.useState)("schedules"),
    activeTab = _b[0],
    setActiveTab = _b[1];
  var _c = (0, react_1.useState)(false),
    hasUnsavedChanges = _c[0],
    setHasUnsavedChanges = _c[1];
  var _d = (0, react_1.useState)({
      professionalSchedules: 0,
      holidays: 0,
      serviceRules: 0,
    }),
    configStats = _d[0],
    setConfigStats = _d[1];
  var handleConfigurationUpdate = (type, count) => {
    setConfigStats((prev) => {
      var _a;
      return __assign(
        __assign({}, prev),
        ((_a = {}),
        (_a[
          type === "schedules"
            ? "professionalSchedules"
            : type === "holidays"
              ? "holidays"
              : "serviceRules"
        ] = count),
        _a),
      );
    });
    setHasUnsavedChanges(true);
    onConfigurationChange === null || onConfigurationChange === void 0
      ? void 0
      : onConfigurationChange();
  };
  var saveAllConfigurations = () =>
    __awaiter(this, void 0, void 0, function () {
      var response, error_1;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              fetch("/api/clinic/".concat(clinicId, "/business-rules/refresh"), {
                method: "POST",
              }),
            ];
          case 1:
            response = _a.sent();
            if (response.ok) {
              setHasUnsavedChanges(false);
              sonner_1.toast.success("Todas as configurações foram salvas e aplicadas!");
            }
            return [3 /*break*/, 3];
          case 2:
            error_1 = _a.sent();
            console.error("Error saving configurations:", error_1);
            sonner_1.toast.error("Erro ao salvar configurações");
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  var getTabIcon = (tab) => {
    switch (tab) {
      case "schedules":
        return <lucide_react_1.Clock className="h-4 w-4" />;
      case "holidays":
        return <lucide_react_1.Calendar className="h-4 w-4" />;
      case "rules":
        return <lucide_react_1.Settings className="h-4 w-4" />;
      default:
        return <lucide_react_1.Settings className="h-4 w-4" />;
    }
  };
  var getConfigurationSummary = () => {
    var totalConfigs =
      configStats.professionalSchedules + configStats.holidays + configStats.serviceRules;
    if (totalConfigs === 0) {
      return {
        status: "warning",
        message: "Nenhuma regra configurada",
        description: "Configure horários, feriados e regras para evitar conflitos",
      };
    }
    var missingConfigs = [];
    if (configStats.professionalSchedules === 0) missingConfigs.push("horários dos profissionais");
    if (configStats.holidays === 0) missingConfigs.push("feriados");
    if (configStats.serviceRules === 0) missingConfigs.push("regras de serviços");
    if (missingConfigs.length > 0) {
      return {
        status: "info",
        message: "Configuração parcial",
        description: "Considere configurar: ".concat(missingConfigs.join(", ")),
      };
    }
    return {
      status: "success",
      message: "Configuração completa",
      description: "Todas as regras básicas estão configuradas",
    };
  };
  var configSummary = getConfigurationSummary();
  return (
    <div className="space-y-6">
      {/* Header with Summary */}
      <card_1.Card>
        <card_1.CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <card_1.CardTitle className="flex items-center gap-2">
                <lucide_react_1.Settings className="h-5 w-5" />
                Regras de Negócio
              </card_1.CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Configure horários, feriados e regras para prevenir conflitos de agendamento
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="flex items-center gap-2">
                  {configSummary.status === "success" && (
                    <lucide_react_1.CheckCircle className="h-4 w-4 text-green-600" />
                  )}
                  <badge_1.Badge
                    variant={
                      configSummary.status === "success"
                        ? "default"
                        : configSummary.status === "warning"
                          ? "destructive"
                          : "secondary"
                    }
                  >
                    {configSummary.message}
                  </badge_1.Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{configSummary.description}</p>
              </div>

              {hasUnsavedChanges && (
                <button_1.Button onClick={saveAllConfigurations} size="sm">
                  <lucide_react_1.Save className="h-4 w-4 mr-2" />
                  Aplicar Mudanças
                </button_1.Button>
              )}
            </div>
          </div>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {configStats.professionalSchedules}
              </div>
              <div className="text-xs text-muted-foreground">Horários Profissionais</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{configStats.holidays}</div>
              <div className="text-xs text-muted-foreground">Feriados/Fechamentos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{configStats.serviceRules}</div>
              <div className="text-xs text-muted-foreground">Regras de Serviços</div>
            </div>
          </div>
        </card_1.CardContent>
      </card_1.Card>

      {/* Configuration Tabs */}
      <card_1.Card>
        <card_1.CardContent className="p-0">
          <tabs_1.Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <tabs_1.TabsList className="grid w-full grid-cols-3 rounded-none border-b">
              <tabs_1.TabsTrigger value="schedules" className="flex items-center gap-2">
                {getTabIcon("schedules")}
                Horários dos Profissionais
              </tabs_1.TabsTrigger>
              <tabs_1.TabsTrigger value="holidays" className="flex items-center gap-2">
                {getTabIcon("holidays")}
                Feriados e Fechamentos
              </tabs_1.TabsTrigger>
              <tabs_1.TabsTrigger value="rules" className="flex items-center gap-2">
                {getTabIcon("rules")}
                Regras de Serviços
              </tabs_1.TabsTrigger>
            </tabs_1.TabsList>

            <div className="p-6">
              <tabs_1.TabsContent value="schedules" className="mt-0">
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Configure os horários de trabalho para cada profissional da clínica.
                  </p>
                  {/* Here you would typically list professionals and allow managing each one */}
                  <div className="text-center py-8 text-muted-foreground">
                    <lucide_react_1.Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Selecione um profissional para configurar horários</p>
                    <p className="text-xs">
                      Esta funcionalidade seria integrada com a seleção de profissionais
                    </p>
                  </div>
                </div>
              </tabs_1.TabsContent>

              <tabs_1.TabsContent value="holidays" className="mt-0">
                <clinic_holiday_manager_1.ClinicHolidayManager
                  clinicId={clinicId}
                  onHolidaysChange={(holidays) =>
                    handleConfigurationUpdate("holidays", holidays.length)
                  }
                />
              </tabs_1.TabsContent>

              <tabs_1.TabsContent value="rules" className="mt-0">
                <service_type_rule_manager_1.ServiceTypeRuleManager
                  clinicId={clinicId}
                  onRulesChange={(rules) => handleConfigurationUpdate("rules", rules.length)}
                />
              </tabs_1.TabsContent>
            </div>
          </tabs_1.Tabs>
        </card_1.CardContent>
      </card_1.Card>

      {/* Help Section */}
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle className="flex items-center gap-2">
            <lucide_react_1.RefreshCw className="h-4 w-4" />
            Como Funciona o Sistema de Prevenção de Conflitos
          </card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div className="space-y-2">
              <div className="flex items-center gap-2 font-medium">
                <lucide_react_1.Clock className="h-4 w-4 text-blue-600" />
                Horários dos Profissionais
              </div>
              <ul className="space-y-1 text-muted-foreground list-disc list-inside">
                <li>Define horários de trabalho por dia da semana</li>
                <li>Controla intervalos e pausas</li>
                <li>Limita agendamentos por hora</li>
                <li>Define tempos mínimos entre consultas</li>
              </ul>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 font-medium">
                <lucide_react_1.Calendar className="h-4 w-4 text-green-600" />
                Feriados e Fechamentos
              </div>
              <ul className="space-y-1 text-muted-foreground list-disc list-inside">
                <li>Bloqueia datas específicas ou recorrentes</li>
                <li>Permite fechamentos parciais por horário</li>
                <li>Configuração de feriados anuais automáticos</li>
                <li>Fechamentos temporários para reformas</li>
              </ul>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 font-medium">
                <lucide_react_1.Settings className="h-4 w-4 text-purple-600" />
                Regras de Serviços
              </div>
              <ul className="space-y-1 text-muted-foreground list-disc list-inside">
                <li>Define durações mínimas e máximas</li>
                <li>Controla tempos de buffer antes/depois</li>
                <li>Limita agendamentos diários por tipo</li>
                <li>Restringe profissionais autorizados</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-start gap-3">
              <lucide_react_1.UserCheck className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900 mb-2">Validação em Tempo Real</h4>
                <p className="text-blue-700 text-sm">
                  O sistema valida automaticamente cada agendamento contra todas as regras
                  configuradas, prevenindo conflitos antes que aconteçam e sugerindo horários
                  alternativos quando necessário.
                </p>
              </div>
            </div>
          </div>
        </card_1.CardContent>
      </card_1.Card>
    </div>
  );
}
