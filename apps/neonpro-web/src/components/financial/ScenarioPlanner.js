/**
 * Scenario Planning Dashboard Component
 * Interface para planejamento de cenários financeiros
 */
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
var __spreadArray =
  (this && this.__spreadArray) ||
  ((to, from, pack) => {
    if (pack || arguments.length === 2)
      for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
          if (!ar) ar = Array.prototype.slice.call(from, 0, i);
          ar[i] = from[i];
        }
      }
    return to.concat(ar || Array.prototype.slice.call(from));
  });
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScenarioPlanner = ScenarioPlanner;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var textarea_1 = require("@/components/ui/textarea");
var badge_1 = require("@/components/ui/badge");
var progress_1 = require("@/components/ui/progress");
var tabs_1 = require("@/components/ui/tabs");
var dialog_1 = require("@/components/ui/dialog");
var lucide_react_1 = require("lucide-react");
var recharts_1 = require("recharts");
var use_toast_1 = require("@/hooks/use-toast");
var use_scenario_planning_1 = require("../hooks/use-scenario-planning");
function ScenarioPlanner(_a) {
  var userId = _a.userId;
  var toast = (0, use_toast_1.useToast)().toast;
  var _b = (0, react_1.useState)("scenarios"),
    activeTab = _b[0],
    setActiveTab = _b[1];
  var _c = (0, react_1.useState)(false),
    showCreateDialog = _c[0],
    setShowCreateDialog = _c[1];
  var _d = (0, use_scenario_planning_1.useScenarioPlanning)(),
    scenarios = _d.scenarios,
    activeScenario = _d.activeScenario,
    selectedScenarios = _d.selectedScenarios,
    comparisonMode = _d.comparisonMode,
    isLoadingScenarios = _d.isLoadingScenarios,
    createScenario = _d.createScenario,
    deleteScenario = _d.deleteScenario,
    selectScenario = _d.selectScenario,
    toggleComparisonMode = _d.toggleComparisonMode,
    toggleScenarioSelection = _d.toggleScenarioSelection;
  var _e = (0, use_scenario_planning_1.useScenarioAnalysis)(activeScenario),
    scenarioDetails = _e.scenarioDetails,
    isLoadingDetails = _e.isLoadingDetails;
  var comparisonData = (0, use_scenario_planning_1.useScenarioComparison)(
    selectedScenarios,
  ).comparisonData;
  var _f = (0, use_scenario_planning_1.useRiskAssessment)(activeScenario),
    riskData = _f.riskData,
    riskAlerts = _f.riskAlerts;
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Planejamento de Cenários</h2>
          <p className="text-muted-foreground">
            Analise diferentes cenários financeiros e tome decisões estratégicas informadas
          </p>
        </div>
        <div className="flex gap-2">
          <button_1.Button
            variant="outline"
            onClick={toggleComparisonMode}
            className={comparisonMode ? "bg-blue-50 border-blue-200" : ""}
          >
            <lucide_react_1.BarChart3 className="w-4 h-4 mr-2" />
            {comparisonMode ? "Sair da Comparação" : "Comparar Cenários"}
          </button_1.Button>
          <dialog_1.Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <dialog_1.DialogTrigger asChild>
              <button_1.Button>
                <lucide_react_1.Plus className="w-4 h-4 mr-2" />
                Novo Cenário
              </button_1.Button>
            </dialog_1.DialogTrigger>
            <dialog_1.DialogContent className="max-w-2xl">
              <CreateScenarioForm
                userId={userId}
                onSuccess={() => {
                  setShowCreateDialog(false);
                  toast({
                    title: "Cenário criado com sucesso",
                    description: "O novo cenário foi criado e está sendo processado.",
                  });
                }}
                onError={(error) => {
                  toast({
                    title: "Erro ao criar cenário",
                    description: error,
                    variant: "destructive",
                  });
                }}
              />
            </dialog_1.DialogContent>
          </dialog_1.Dialog>
        </div>
      </div>

      {/* Risk Alerts */}
      {riskAlerts.length > 0 && (
        <card_1.Card className="border-orange-200 bg-orange-50">
          <card_1.CardHeader className="pb-3">
            <card_1.CardTitle className="text-orange-800 flex items-center">
              <lucide_react_1.AlertTriangle className="w-5 h-5 mr-2" />
              Alertas de Risco
            </card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="space-y-2">
              {riskAlerts.map((alert, index) => (
                <div
                  key={index}
                  className={"flex items-center p-2 rounded-md ".concat(
                    alert.type === "danger"
                      ? "bg-red-100 text-red-800"
                      : "bg-yellow-100 text-yellow-800",
                  )}
                >
                  <lucide_react_1.AlertCircle className="w-4 h-4 mr-2" />
                  <span className="text-sm">{alert.message}</span>
                </div>
              ))}
            </div>
          </card_1.CardContent>
        </card_1.Card>
      )}

      <tabs_1.Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <tabs_1.TabsList>
          <tabs_1.TabsTrigger value="scenarios">Cenários</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="analysis">Análise Detalhada</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="comparison">Comparação</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="decisions">Suporte à Decisão</tabs_1.TabsTrigger>
        </tabs_1.TabsList>

        <tabs_1.TabsContent value="scenarios" className="space-y-4">
          <ScenariosGrid
            scenarios={scenarios}
            activeScenario={activeScenario}
            selectedScenarios={selectedScenarios}
            comparisonMode={comparisonMode}
            isLoading={isLoadingScenarios}
            onSelectScenario={selectScenario}
            onToggleSelection={toggleScenarioSelection}
            onDeleteScenario={deleteScenario}
          />
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="analysis" className="space-y-4">
          <ScenarioAnalysis
            scenario={scenarioDetails}
            isLoading={isLoadingDetails}
            riskData={riskData}
          />
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="comparison" className="space-y-4">
          <ScenarioComparison scenarios={selectedScenarios} comparisonData={comparisonData} />
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="decisions" className="space-y-4">
          <DecisionSupport selectedScenarios={selectedScenarios} />
        </tabs_1.TabsContent>
      </tabs_1.Tabs>
    </div>
  );
}
function ScenariosGrid(_a) {
  var scenarios = _a.scenarios,
    activeScenario = _a.activeScenario,
    selectedScenarios = _a.selectedScenarios,
    comparisonMode = _a.comparisonMode,
    isLoading = _a.isLoading,
    onSelectScenario = _a.onSelectScenario,
    onToggleSelection = _a.onToggleSelection,
    onDeleteScenario = _a.onDeleteScenario;
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {__spreadArray([], Array(6), true).map((_, i) => (
          <card_1.Card key={i} className="animate-pulse">
            <card_1.CardHeader className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-5/6"></div>
              </div>
            </card_1.CardContent>
          </card_1.Card>
        ))}
      </div>
    );
  }
  if (scenarios.length === 0) {
    return (
      <card_1.Card className="text-center py-12">
        <card_1.CardContent>
          <lucide_react_1.Calculator className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhum cenário encontrado</h3>
          <p className="text-muted-foreground mb-4">
            Crie seu primeiro cenário financeiro para começar a análise
          </p>
          <button_1.Button>
            <lucide_react_1.Plus className="w-4 h-4 mr-2" />
            Criar Primeiro Cenário
          </button_1.Button>
        </card_1.CardContent>
      </card_1.Card>
    );
  }
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {scenarios.map((scenario) => (
        <ScenarioCard
          key={scenario.id}
          scenario={scenario}
          isActive={activeScenario === scenario.id}
          isSelected={selectedScenarios.includes(scenario.id)}
          comparisonMode={comparisonMode}
          onSelect={() => onSelectScenario(scenario.id)}
          onToggleSelection={() => onToggleSelection(scenario.id)}
          onDelete={() => onDeleteScenario(scenario.id)}
        />
      ))}
    </div>
  );
}
function ScenarioCard(_a) {
  var _b, _c, _d, _e, _f;
  var scenario = _a.scenario,
    isActive = _a.isActive,
    isSelected = _a.isSelected,
    comparisonMode = _a.comparisonMode,
    onSelect = _a.onSelect,
    onToggleSelection = _a.onToggleSelection,
    onDelete = _a.onDelete;
  var results = scenario.results;
  var riskLevel =
    ((_b = results === null || results === void 0 ? void 0 : results.risk_assessment) === null ||
    _b === void 0
      ? void 0
      : _b.risk_level) || "medium";
  var getRiskColor = (level) => {
    switch (level) {
      case "low":
        return "text-green-600 bg-green-100";
      case "medium":
        return "text-yellow-600 bg-yellow-100";
      case "high":
        return "text-orange-600 bg-orange-100";
      case "critical":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };
  var getRiskIcon = (level) => {
    switch (level) {
      case "low":
        return <lucide_react_1.CheckCircle2 className="w-4 h-4" />;
      case "medium":
        return <lucide_react_1.AlertCircle className="w-4 h-4" />;
      case "high":
        return <lucide_react_1.AlertTriangle className="w-4 h-4" />;
      case "critical":
        return <lucide_react_1.AlertTriangle className="w-4 h-4" />;
      default:
        return <lucide_react_1.AlertCircle className="w-4 h-4" />;
    }
  };
  return (
    <card_1.Card
      className={"cursor-pointer transition-all "
        .concat(isActive ? "ring-2 ring-blue-500 bg-blue-50" : "", " ")
        .concat(isSelected ? "ring-2 ring-green-500" : "", " hover:shadow-md")}
      onClick={comparisonMode ? onToggleSelection : onSelect}
    >
      <card_1.CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <card_1.CardTitle className="text-lg">{scenario.name}</card_1.CardTitle>
            <card_1.CardDescription className="mt-1">{scenario.description}</card_1.CardDescription>
          </div>
          {comparisonMode && (
            <div
              className={"w-5 h-5 rounded border-2 flex items-center justify-center ".concat(
                isSelected ? "bg-green-500 border-green-500" : "border-gray-300",
              )}
            >
              {isSelected && <lucide_react_1.CheckCircle2 className="w-3 h-3 text-white" />}
            </div>
          )}
        </div>
      </card_1.CardHeader>

      <card_1.CardContent className="space-y-4">
        {/* Key Metrics */}
        {results && (
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-2 bg-green-50 rounded-md">
              <div className="text-sm text-muted-foreground">Lucro Total</div>
              <div className="font-semibold text-green-600">
                R${" "}
                {((_d =
                  (_c = results.key_metrics) === null || _c === void 0
                    ? void 0
                    : _c.total_profit) === null || _d === void 0
                  ? void 0
                  : _d.toLocaleString()) || "0"}
              </div>
            </div>
            <div className="text-center p-2 bg-blue-50 rounded-md">
              <div className="text-sm text-muted-foreground">Margem</div>
              <div className="font-semibold text-blue-600">
                {((_f =
                  (_e = results.key_metrics) === null || _e === void 0
                    ? void 0
                    : _e.profit_margin) === null || _f === void 0
                  ? void 0
                  : _f.toFixed(1)) || "0"}
                %
              </div>
            </div>
          </div>
        )}

        {/* Risk Badge */}
        <div className="flex justify-between items-center">
          <badge_1.Badge className={"".concat(getRiskColor(riskLevel), " border-0")}>
            {getRiskIcon(riskLevel)}
            <span className="ml-1 capitalize">
              Risco{" "}
              {riskLevel === "low"
                ? "Baixo"
                : riskLevel === "medium"
                  ? "Médio"
                  : riskLevel === "high"
                    ? "Alto"
                    : "Crítico"}
            </span>
          </badge_1.Badge>

          {/* Confidence Level */}
          {(results === null || results === void 0 ? void 0 : results.confidence_level) && (
            <div className="text-sm text-muted-foreground">
              Confiança: {results.confidence_level}%
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {!comparisonMode && (
          <div className="flex gap-2 pt-2">
            <button_1.Button variant="outline" size="sm" className="flex-1">
              <lucide_react_1.Eye className="w-4 h-4 mr-1" />
              Analisar
            </button_1.Button>
            <button_1.Button variant="outline" size="sm">
              <lucide_react_1.Copy className="w-4 h-4" />
            </button_1.Button>
            <button_1.Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <lucide_react_1.Trash2 className="w-4 h-4" />
            </button_1.Button>
          </div>
        )}
      </card_1.CardContent>
    </card_1.Card>
  );
}
function CreateScenarioForm(_a) {
  var _b, _c;
  var userId = _a.userId,
    onSuccess = _a.onSuccess,
    onError = _a.onError;
  var createScenario = (0, use_scenario_planning_1.useScenarioPlanning)().createScenario;
  var _d = (0, react_1.useState)(false),
    isLoading = _d[0],
    setIsLoading = _d[1];
  var _e = (0, react_1.useState)({
      name: "",
      description: "",
      projection_period: {
        start_date: new Date().toISOString().split("T")[0],
        end_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      },
      baseline_period: {
        start_date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        end_date: new Date().toISOString().split("T")[0],
      },
    }),
    formData = _e[0],
    setFormData = _e[1];
  var handleSubmit = (e) =>
    __awaiter(this, void 0, void 0, function () {
      var result, error_1;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            e.preventDefault();
            setIsLoading(true);
            _a.label = 1;
          case 1:
            _a.trys.push([1, 3, 4, 5]);
            return [4 /*yield*/, createScenario(formData, userId)];
          case 2:
            result = _a.sent();
            if (result.success) {
              onSuccess();
            } else {
              onError(result.error || "Erro desconhecido");
            }
            return [3 /*break*/, 5];
          case 3:
            error_1 = _a.sent();
            onError(error_1 instanceof Error ? error_1.message : "Erro ao criar cenário");
            return [3 /*break*/, 5];
          case 4:
            setIsLoading(false);
            return [7 /*endfinally*/];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  return (
    <>
      <dialog_1.DialogHeader>
        <dialog_1.DialogTitle>Criar Novo Cenário</dialog_1.DialogTitle>
        <dialog_1.DialogDescription>
          Configure os parâmetros para análise do novo cenário financeiro
        </dialog_1.DialogDescription>
      </dialog_1.DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4">
          <div>
            <label_1.Label htmlFor="name">Nome do Cenário</label_1.Label>
            <input_1.Input
              id="name"
              value={formData.name || ""}
              onChange={(e) =>
                setFormData((prev) => __assign(__assign({}, prev), { name: e.target.value }))
              }
              placeholder="Ex: Expansão Q1 2024"
              required
            />
          </div>

          <div>
            <label_1.Label htmlFor="description">Descrição</label_1.Label>
            <textarea_1.Textarea
              id="description"
              value={formData.description || ""}
              onChange={(e) =>
                setFormData((prev) => __assign(__assign({}, prev), { description: e.target.value }))
              }
              placeholder="Descreva o cenário que você deseja analisar..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label_1.Label htmlFor="start-date">Data de Início</label_1.Label>
              <input_1.Input
                id="start-date"
                type="date"
                value={
                  ((_b = formData.projection_period) === null || _b === void 0
                    ? void 0
                    : _b.start_date) || ""
                }
                onChange={(e) =>
                  setFormData((prev) =>
                    __assign(__assign({}, prev), {
                      projection_period: __assign(__assign({}, prev.projection_period), {
                        start_date: e.target.value,
                      }),
                    }),
                  )
                }
                required
              />
            </div>

            <div>
              <label_1.Label htmlFor="end-date">Data de Fim</label_1.Label>
              <input_1.Input
                id="end-date"
                type="date"
                value={
                  ((_c = formData.projection_period) === null || _c === void 0
                    ? void 0
                    : _c.end_date) || ""
                }
                onChange={(e) =>
                  setFormData((prev) =>
                    __assign(__assign({}, prev), {
                      projection_period: __assign(__assign({}, prev.projection_period), {
                        end_date: e.target.value,
                      }),
                    }),
                  )
                }
                required
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <button_1.Button type="button" variant="outline" onClick={() => onError("Cancelado")}>
            Cancelar
          </button_1.Button>
          <button_1.Button type="submit" disabled={isLoading}>
            {isLoading
              ? <>
                  <div className="w-4 h-4 mr-2 animate-spin border-2 border-current border-t-transparent rounded-full" />
                  Criando...
                </>
              : <>
                  <lucide_react_1.Play className="w-4 h-4 mr-2" />
                  Criar Cenário
                </>}
          </button_1.Button>
        </div>
      </form>
    </>
  );
}
function ScenarioAnalysis(_a) {
  var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u;
  var scenario = _a.scenario,
    isLoading = _a.isLoading,
    riskData = _a.riskData;
  if (isLoading) {
    return (
      <div className="space-y-4">
        {__spreadArray([], Array(3), true).map((_, i) => (
          <card_1.Card key={i} className="animate-pulse">
            <card_1.CardContent className="p-6">
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            </card_1.CardContent>
          </card_1.Card>
        ))}
      </div>
    );
  }
  if (!scenario) {
    return (
      <card_1.Card className="text-center py-12">
        <card_1.CardContent>
          <lucide_react_1.Target className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Selecione um cenário</h3>
          <p className="text-muted-foreground">
            Escolha um cenário na aba "Cenários" para ver a análise detalhada
          </p>
        </card_1.CardContent>
      </card_1.Card>
    );
  }
  return (
    <div className="space-y-6">
      {/* Scenario Header */}
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle className="flex items-center justify-between">
            {scenario.name}
            <badge_1.Badge variant="secondary">
              Confiança:{" "}
              {((_b = scenario.results) === null || _b === void 0 ? void 0 : _b.confidence_level) ||
                0}
              %
            </badge_1.Badge>
          </card_1.CardTitle>
          <card_1.CardDescription>{scenario.description}</card_1.CardDescription>
        </card_1.CardHeader>
      </card_1.Card>

      {/* Key Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Lucro Total"
          value={"R$ ".concat(
            ((_e =
              (_d = (_c = scenario.results) === null || _c === void 0 ? void 0 : _c.key_metrics) ===
                null || _d === void 0
                ? void 0
                : _d.total_profit) === null || _e === void 0
              ? void 0
              : _e.toLocaleString()) || "0",
          )}
          icon={<lucide_react_1.DollarSign className="w-4 h-4" />}
          trend={
            ((_g = (_f = scenario.results) === null || _f === void 0 ? void 0 : _f.key_metrics) ===
              null || _g === void 0
              ? void 0
              : _g.revenue_growth_rate) || 0
          }
          color="green"
        />
        <MetricCard
          title="Margem de Lucro"
          value={"".concat(
            ((_k =
              (_j = (_h = scenario.results) === null || _h === void 0 ? void 0 : _h.key_metrics) ===
                null || _j === void 0
                ? void 0
                : _j.profit_margin) === null || _k === void 0
              ? void 0
              : _k.toFixed(1)) || "0",
            "%",
          )}
          icon={<lucide_react_1.TrendingUp className="w-4 h-4" />}
          trend={0}
          color="blue"
        />
        <MetricCard
          title="Volatilidade"
          value={"".concat(
            ((_o =
              (_m = (_l = scenario.results) === null || _l === void 0 ? void 0 : _l.key_metrics) ===
                null || _m === void 0
                ? void 0
                : _m.revenue_volatility) === null || _o === void 0
              ? void 0
              : _o.toFixed(1)) || "0",
            "%",
          )}
          icon={<lucide_react_1.BarChart3 className="w-4 h-4" />}
          trend={0}
          color="yellow"
        />
        <MetricCard
          title="Score de Risco"
          value={"".concat(
            ((_p =
              riskData === null || riskData === void 0 ? void 0 : riskData.overall_risk_score) ===
              null || _p === void 0
              ? void 0
              : _p.toFixed(0)) || "0",
          )}
          icon={<lucide_react_1.AlertTriangle className="w-4 h-4" />}
          trend={0}
          color="red"
        />
      </div>

      {/* Cash Flow Chart */}
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle>Projeção de Fluxo de Caixa</card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="h-64">
            <recharts_1.ResponsiveContainer width="100%" height="100%">
              <recharts_1.AreaChart
                data={
                  ((_r =
                    (_q = scenario.results) === null || _q === void 0
                      ? void 0
                      : _q.projected_cash_flow) === null || _r === void 0
                    ? void 0
                    : _r.slice(0, 30)) || []
                }
              >
                <recharts_1.CartesianGrid strokeDasharray="3 3" />
                <recharts_1.XAxis dataKey="date" />
                <recharts_1.YAxis />
                <recharts_1.Tooltip
                  formatter={(value) => ["R$ ".concat(value.toLocaleString()), ""]}
                />
                <recharts_1.Area
                  type="monotone"
                  dataKey="revenue"
                  stackId="1"
                  stroke="#10B981"
                  fill="#10B981"
                  fillOpacity={0.6}
                  name="Receita"
                />
                <recharts_1.Area
                  type="monotone"
                  dataKey="expenses"
                  stackId="2"
                  stroke="#EF4444"
                  fill="#EF4444"
                  fillOpacity={0.6}
                  name="Despesas"
                />
              </recharts_1.AreaChart>
            </recharts_1.ResponsiveContainer>
          </div>
        </card_1.CardContent>
      </card_1.Card>

      {/* Risk Analysis */}
      {riskData && (
        <card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle>Análise de Riscos</card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label_1.Label>Probabilidade de Fluxo Negativo</label_1.Label>
                  <div className="flex items-center mt-2">
                    <progress_1.Progress
                      value={riskData.negative_flow_probability}
                      className="flex-1 mr-3"
                    />
                    <span className="text-sm font-medium">
                      {(_s = riskData.negative_flow_probability) === null || _s === void 0
                        ? void 0
                        : _s.toFixed(1)}
                      %
                    </span>
                  </div>
                </div>
                <div>
                  <label_1.Label>Risco de Volatilidade</label_1.Label>
                  <div className="flex items-center mt-2">
                    <progress_1.Progress
                      value={riskData.revenue_volatility_risk}
                      className="flex-1 mr-3"
                    />
                    <span className="text-sm font-medium">
                      {(_t = riskData.revenue_volatility_risk) === null || _t === void 0
                        ? void 0
                        : _t.toFixed(1)}
                      %
                    </span>
                  </div>
                </div>
              </div>

              {/* Stress Test Results */}
              {riskData.stress_test_results && (
                <div>
                  <label_1.Label>Resultados do Teste de Stress</label_1.Label>
                  <div className="mt-2 space-y-2">
                    {riskData.stress_test_results.map((test, index) => {
                      var _a;
                      return (
                        <div
                          key={index}
                          className="flex justify-between items-center p-2 bg-gray-50 rounded"
                        >
                          <span className="text-sm">{test.scenario_name}</span>
                          <div className="text-right">
                            <div className="text-sm font-medium">
                              Sobrevivência:{" "}
                              {(_a = test.survival_probability) === null || _a === void 0
                                ? void 0
                                : _a.toFixed(1)}
                              %
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {test.negative_days} dias negativos
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </card_1.CardContent>
        </card_1.Card>
      )}

      {/* Recommendations */}
      {((_u = scenario.results) === null || _u === void 0 ? void 0 : _u.recommendations) && (
        <card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle>Recomendações</card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="space-y-2">
              {scenario.results.recommendations.map((rec, index) => (
                <div key={index} className="flex items-start p-3 bg-blue-50 rounded-md">
                  <lucide_react_1.CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-sm text-blue-800">{rec}</span>
                </div>
              ))}
            </div>
          </card_1.CardContent>
        </card_1.Card>
      )}
    </div>
  );
}
function MetricCard(_a) {
  var title = _a.title,
    value = _a.value,
    icon = _a.icon,
    trend = _a.trend,
    color = _a.color;
  var colorClasses = {
    green: "text-green-600 bg-green-100",
    blue: "text-blue-600 bg-blue-100",
    yellow: "text-yellow-600 bg-yellow-100",
    red: "text-red-600 bg-red-100",
  };
  return (
    <card_1.Card>
      <card_1.CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
          <div className={"p-3 rounded-full ".concat(colorClasses[color])}>{icon}</div>
        </div>
        {trend !== 0 && (
          <div className="mt-2 flex items-center">
            {trend > 0
              ? <lucide_react_1.TrendingUp className="w-4 h-4 text-green-600 mr-1" />
              : <lucide_react_1.TrendingDown className="w-4 h-4 text-red-600 mr-1" />}
            <span className={"text-sm ".concat(trend > 0 ? "text-green-600" : "text-red-600")}>
              {Math.abs(trend).toFixed(1)}%
            </span>
          </div>
        )}
      </card_1.CardContent>
    </card_1.Card>
  );
}
// ====================================================================
// PLACEHOLDER COMPONENTS
// ====================================================================
function ScenarioComparison(_a) {
  var scenarios = _a.scenarios,
    comparisonData = _a.comparisonData;
  return (
    <card_1.Card>
      <card_1.CardHeader>
        <card_1.CardTitle>Comparação de Cenários</card_1.CardTitle>
        <card_1.CardDescription>Compare até 4 cenários lado a lado</card_1.CardDescription>
      </card_1.CardHeader>
      <card_1.CardContent>
        <div className="text-center py-8">
          <lucide_react_1.BarChart3 className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-muted-foreground">
            Selecione cenários na aba "Cenários" para comparar
          </p>
        </div>
      </card_1.CardContent>
    </card_1.Card>
  );
}
function DecisionSupport(_a) {
  var selectedScenarios = _a.selectedScenarios;
  return (
    <card_1.Card>
      <card_1.CardHeader>
        <card_1.CardTitle>Suporte à Decisão</card_1.CardTitle>
        <card_1.CardDescription>
          Análise inteligente para apoiar suas decisões estratégicas
        </card_1.CardDescription>
      </card_1.CardHeader>
      <card_1.CardContent>
        <div className="text-center py-8">
          <lucide_react_1.Target className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-muted-foreground">
            Funcionalidade de suporte à decisão em desenvolvimento
          </p>
        </div>
      </card_1.CardContent>
    </card_1.Card>
  );
}
