"use client";
"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StockAlertsManagement = StockAlertsManagement;
var alert_1 = require("@/components/ui/alert");
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var dialog_1 = require("@/components/ui/dialog");
var label_1 = require("@/components/ui/label");
var scroll_area_1 = require("@/components/ui/scroll-area");
var select_1 = require("@/components/ui/select");
var switch_1 = require("@/components/ui/switch");
var table_1 = require("@/components/ui/table");
var tabs_1 = require("@/components/ui/tabs");
var use_toast_1 = require("@/hooks/use-toast");
var utils_1 = require("@/lib/utils");
var date_fns_1 = require("date-fns");
var locale_1 = require("date-fns/locale");
var lucide_react_1 = require("lucide-react");
var react_1 = require("react");
var alertSeverityColors = {
    low: "text-blue-600 bg-blue-50 border-blue-200",
    medium: "text-yellow-600 bg-yellow-50 border-yellow-200",
    high: "text-orange-600 bg-orange-50 border-orange-200",
    critical: "text-red-600 bg-red-50 border-red-200",
};
var alertTypeIcons = {
    low_stock: lucide_react_1.Package,
    expiring: lucide_react_1.Clock,
    expired: lucide_react_1.AlertTriangle,
    overstock: lucide_react_1.Package,
    critical_shortage: lucide_react_1.AlertTriangle,
};
var alertTypeLabels = {
    low_stock: "Estoque Baixo",
    expiring: "Próximo ao Vencimento",
    expired: "Vencido",
    overstock: "Excesso de Estoque",
    critical_shortage: "Falta Crítica",
};
var severityLabels = {
    low: "Baixa",
    medium: "Média",
    high: "Alta",
    critical: "Crítica",
};
function StockAlertsManagement(_a) {
    var _this = this;
    var className = _a.className;
    var _b = (0, react_1.useState)([]), alerts = _b[0], setAlerts = _b[1];
    var _c = (0, react_1.useState)([]), configs = _c[0], setConfigs = _c[1];
    var _d = (0, react_1.useState)(true), isLoading = _d[0], setIsLoading = _d[1];
    var _e = (0, react_1.useState)("alerts"), selectedTab = _e[0], setSelectedTab = _e[1];
    var _f = (0, react_1.useState)("all"), filterSeverity = _f[0], setFilterSeverity = _f[1];
    var _g = (0, react_1.useState)("all"), filterType = _g[0], setFilterType = _g[1];
    var _h = (0, react_1.useState)("all"), filterStatus = _h[0], setFilterStatus = _h[1];
    var _j = (0, react_1.useState)(false), showConfigDialog = _j[0], setShowConfigDialog = _j[1];
    var _k = (0, react_1.useState)(null), editingConfig = _k[0], setEditingConfig = _k[1];
    var toast = (0, use_toast_1.useToast)().toast;
    // Load alerts and configurations
    var loadData = function () { return __awaiter(_this, void 0, void 0, function () {
        var _a, alertsRes, configsRes, alertsData, configsData, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    setIsLoading(true);
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 7, 8, 9]);
                    return [4 /*yield*/, Promise.all([
                            fetch("/api/stock/alerts"),
                            fetch("/api/stock/alerts/configs"),
                        ])];
                case 2:
                    _a = _b.sent(), alertsRes = _a[0], configsRes = _a[1];
                    if (!alertsRes.ok) return [3 /*break*/, 4];
                    return [4 /*yield*/, alertsRes.json()];
                case 3:
                    alertsData = _b.sent();
                    setAlerts(alertsData.alerts || []);
                    _b.label = 4;
                case 4:
                    if (!configsRes.ok) return [3 /*break*/, 6];
                    return [4 /*yield*/, configsRes.json()];
                case 5:
                    configsData = _b.sent();
                    setConfigs(configsData.configs || []);
                    _b.label = 6;
                case 6: return [3 /*break*/, 9];
                case 7:
                    error_1 = _b.sent();
                    toast({
                        title: "Erro ao carregar dados",
                        description: "Não foi possível carregar os alertas e configurações.",
                        variant: "destructive",
                    });
                    return [3 /*break*/, 9];
                case 8:
                    setIsLoading(false);
                    return [7 /*endfinally*/];
                case 9: return [2 /*return*/];
            }
        });
    }); };
    // Resolve alert
    var resolveAlert = function (alertId) { return __awaiter(_this, void 0, void 0, function () {
        var response, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, fetch("/api/stock/alerts", {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ alertId: alertId, resolved: true }),
                        })];
                case 1:
                    response = _a.sent();
                    if (response.ok) {
                        setAlerts(function (prev) {
                            return prev.map(function (alert) {
                                return alert.id === alertId ? __assign(__assign({}, alert), { resolvedAt: new Date() }) : alert;
                            });
                        });
                        toast({
                            title: "Alerta resolvido",
                            description: "O alerta foi marcado como resolvido.",
                        });
                    }
                    return [3 /*break*/, 3];
                case 2:
                    error_2 = _a.sent();
                    toast({
                        title: "Erro",
                        description: "Não foi possível resolver o alerta.",
                        variant: "destructive",
                    });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    // Toggle configuration active status
    var toggleConfig = function (configId, active) { return __awaiter(_this, void 0, void 0, function () {
        var response, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, fetch("/api/stock/alerts/configs", {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ configId: configId, active: active }),
                        })];
                case 1:
                    response = _a.sent();
                    if (response.ok) {
                        setConfigs(function (prev) {
                            return prev.map(function (config) {
                                return config.id === configId ? __assign(__assign({}, config), { isActive: active }) : config;
                            });
                        });
                        toast({
                            title: active ? "Configuração ativada" : "Configuração desativada",
                            description: "A configura\u00E7\u00E3o foi ".concat(active ? "ativada" : "desativada", " com sucesso."),
                        });
                    }
                    return [3 /*break*/, 3];
                case 2:
                    error_3 = _a.sent();
                    toast({
                        title: "Erro",
                        description: "Não foi possível atualizar a configuração.",
                        variant: "destructive",
                    });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    // Filter alerts
    var filteredAlerts = alerts.filter(function (alert) {
        if (filterSeverity !== "all" && alert.severityLevel !== filterSeverity)
            return false;
        if (filterType !== "all" && alert.alertType !== filterType)
            return false;
        if (filterStatus === "active" && alert.resolvedAt)
            return false;
        if (filterStatus === "resolved" && !alert.resolvedAt)
            return false;
        return true;
    });
    // Filter configs
    var filteredConfigs = configs.filter(function (config) {
        if (filterType !== "all" && config.alertType !== filterType)
            return false;
        return true;
    });
    (0, react_1.useEffect)(function () {
        loadData();
    }, []);
    if (isLoading) {
        return (<card_1.Card className={className}>
        <card_1.CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <lucide_react_1.RefreshCw className="h-6 w-6 animate-spin"/>
          </div>
        </card_1.CardContent>
      </card_1.Card>);
    }
    return (<card_1.Card className={className}>
      <card_1.CardHeader>
        <div className="flex items-center justify-between">
          <card_1.CardTitle className="flex items-center gap-2">
            <lucide_react_1.Bell className="h-5 w-5"/>
            Gerenciamento de Alertas de Estoque
          </card_1.CardTitle>
          <button_1.Button onClick={loadData} variant="outline" size="sm">
            <lucide_react_1.RefreshCw className="h-4 w-4 mr-2"/>
            Atualizar
          </button_1.Button>
        </div>
      </card_1.CardHeader>
      <card_1.CardContent>
        <tabs_1.Tabs value={selectedTab} onValueChange={function (value) { return setSelectedTab(value); }}>
          <tabs_1.TabsList className="grid w-full grid-cols-2">
            <tabs_1.TabsTrigger value="alerts" className="flex items-center gap-2">
              <lucide_react_1.AlertTriangle className="h-4 w-4"/>
              Alertas Ativos ({filteredAlerts.length})
            </tabs_1.TabsTrigger>
            <tabs_1.TabsTrigger value="configs" className="flex items-center gap-2">
              <lucide_react_1.Settings className="h-4 w-4"/>
              Configurações ({filteredConfigs.length})
            </tabs_1.TabsTrigger>
          </tabs_1.TabsList>

          {/* Filters */}
          <div className="flex items-center gap-4 py-4">
            <div className="flex items-center gap-2">
              <lucide_react_1.Filter className="h-4 w-4"/>
              <label_1.Label>Filtros:</label_1.Label>
            </div>

            <select_1.Select value={filterSeverity} onValueChange={function (value) { return setFilterSeverity(value); }}>
              <select_1.SelectTrigger className="w-32">
                <select_1.SelectValue placeholder="Severidade"/>
              </select_1.SelectTrigger>
              <select_1.SelectContent>
                <select_1.SelectItem value="all">Todas</select_1.SelectItem>
                <select_1.SelectItem value="low">Baixa</select_1.SelectItem>
                <select_1.SelectItem value="medium">Média</select_1.SelectItem>
                <select_1.SelectItem value="high">Alta</select_1.SelectItem>
                <select_1.SelectItem value="critical">Crítica</select_1.SelectItem>
              </select_1.SelectContent>
            </select_1.Select>

            <select_1.Select value={filterType} onValueChange={function (value) { return setFilterType(value); }}>
              <select_1.SelectTrigger className="w-40">
                <select_1.SelectValue placeholder="Tipo"/>
              </select_1.SelectTrigger>
              <select_1.SelectContent>
                <select_1.SelectItem value="all">Todos</select_1.SelectItem>
                <select_1.SelectItem value="low_stock">Estoque Baixo</select_1.SelectItem>
                <select_1.SelectItem value="out_of_stock">Sem Estoque</select_1.SelectItem>
                <select_1.SelectItem value="expiring_soon">Expirando</select_1.SelectItem>
                <select_1.SelectItem value="demand_prediction">Previsão</select_1.SelectItem>
              </select_1.SelectContent>
            </select_1.Select>

            {selectedTab === "alerts" && (<select_1.Select value={filterStatus} onValueChange={function (value) { return setFilterStatus(value); }}>
                <select_1.SelectTrigger className="w-32">
                  <select_1.SelectValue placeholder="Status"/>
                </select_1.SelectTrigger>
                <select_1.SelectContent>
                  <select_1.SelectItem value="all">Todos</select_1.SelectItem>
                  <select_1.SelectItem value="active">Ativos</select_1.SelectItem>
                  <select_1.SelectItem value="resolved">Resolvidos</select_1.SelectItem>
                </select_1.SelectContent>
              </select_1.Select>)}
          </div>

          <tabs_1.TabsContent value="alerts" className="space-y-4">
            {filteredAlerts.length === 0 ? (<alert_1.Alert>
                <lucide_react_1.Info className="h-4 w-4"/>
                <alert_1.AlertDescription>
                  Nenhum alerta encontrado com os filtros selecionados.
                </alert_1.AlertDescription>
              </alert_1.Alert>) : (<scroll_area_1.ScrollArea className="h-96">
                <div className="space-y-3">
                  {filteredAlerts.map(function (alert) {
                var Icon = alertTypeIcons[alert.alertType];
                var isResolved = !!alert.resolvedAt;
                return (<div key={alert.id} className={(0, utils_1.cn)("p-4 rounded-lg border transition-colors", alertSeverityColors[alert.severityLevel], isResolved && "opacity-60")}>
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <Icon className="h-5 w-5 mt-0.5"/>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium">
                                  {alertTypeLabels[alert.alertType]}
                                </h4>
                                <badge_1.Badge variant={alert.severityLevel === "critical"
                        ? "destructive"
                        : "secondary"} className="text-xs">
                                  {severityLabels[alert.severityLevel]}
                                </badge_1.Badge>
                                {isResolved && (<badge_1.Badge variant="outline" className="text-xs">
                                    Resolvido
                                  </badge_1.Badge>)}
                              </div>
                              <p className="text-sm mt-1">{alert.message}</p>
                              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                <span>Produto ID: {alert.productId}</span>
                                <span>Valor Atual: {alert.currentValue}</span>
                                {alert.thresholdValue && (<span>Limite: {alert.thresholdValue}</span>)}
                                <span>
                                  {alert.createdAt &&
                        (0, date_fns_1.format)(new Date(alert.createdAt), "dd/MM/yy HH:mm", { locale: locale_1.pt })}
                                </span>
                              </div>
                            </div>
                          </div>

                          {!isResolved && (<button_1.Button onClick={function () { return resolveAlert(alert.id); }} variant="outline" size="sm">
                              <lucide_react_1.CheckCircle className="h-4 w-4 mr-2"/>
                              Resolver
                            </button_1.Button>)}
                        </div>
                      </div>);
            })}
                </div>
              </scroll_area_1.ScrollArea>)}
          </tabs_1.TabsContent>

          <tabs_1.TabsContent value="configs" className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                Configure os alertas automáticos para diferentes tipos de
                eventos de estoque.
              </p>
              <dialog_1.Dialog open={showConfigDialog} onOpenChange={setShowConfigDialog}>
                <dialog_1.DialogTrigger asChild>
                  <button_1.Button onClick={function () { return setEditingConfig(null); }}>
                    <lucide_react_1.Plus className="h-4 w-4 mr-2"/>
                    Nova Configuração
                  </button_1.Button>
                </dialog_1.DialogTrigger>
                <dialog_1.DialogContent className="sm:max-w-[425px]">
                  <dialog_1.DialogHeader>
                    <dialog_1.DialogTitle>
                      {editingConfig ? "Editar" : "Nova"} Configuração de Alerta
                    </dialog_1.DialogTitle>
                    <dialog_1.DialogDescription>
                      Configure os parâmetros para alertas automáticos de
                      estoque.
                    </dialog_1.DialogDescription>
                  </dialog_1.DialogHeader>
                  <ConfigForm config={editingConfig} onSave={function (config) {
            // Handle save
            setShowConfigDialog(false);
            loadData();
        }} onCancel={function () { return setShowConfigDialog(false); }}/>
                </dialog_1.DialogContent>
              </dialog_1.Dialog>
            </div>

            {filteredConfigs.length === 0 ? (<alert_1.Alert>
                <lucide_react_1.Info className="h-4 w-4"/>
                <alert_1.AlertDescription>
                  Nenhuma configuração encontrada. Crie uma nova configuração
                  para começar.
                </alert_1.AlertDescription>
              </alert_1.Alert>) : (<table_1.Table>
                <table_1.TableHeader>
                  <table_1.TableRow>
                    <table_1.TableHead>Tipo</table_1.TableHead>
                    <table_1.TableHead>Parâmetros</table_1.TableHead>
                    <table_1.TableHead>Severidade</table_1.TableHead>
                    <table_1.TableHead>Status</table_1.TableHead>
                    <table_1.TableHead>Ações</table_1.TableHead>
                  </table_1.TableRow>
                </table_1.TableHeader>
                <table_1.TableBody>
                  {filteredConfigs.map(function (config) { return (<table_1.TableRow key={config.id}>
                      <table_1.TableCell>
                        <div className="flex items-center gap-2">
                          {(function () {
                    var Icon = alertTypeIcons[config.alertType];
                    return <Icon className="h-4 w-4"/>;
                })()}
                          {alertTypeLabels[config.alertType]}
                        </div>
                      </table_1.TableCell>
                      <table_1.TableCell>
                        <div className="text-sm">
                          {config.thresholdUnit === "percentage"
                    ? "".concat(config.thresholdValue, "%")
                    : "".concat(config.thresholdValue, " unidades")}
                        </div>
                      </table_1.TableCell>
                      <table_1.TableCell>
                        <badge_1.Badge variant={config.severityLevel === "critical"
                    ? "destructive"
                    : "secondary"} className="text-xs">
                          {severityLabels[config.severityLevel]}
                        </badge_1.Badge>
                      </table_1.TableCell>
                      <table_1.TableCell>
                        <switch_1.Switch checked={config.isActive} onCheckedChange={function (checked) {
                    return toggleConfig(config.id, checked);
                }}/>
                      </table_1.TableCell>
                      <table_1.TableCell>
                        <div className="flex items-center gap-2">
                          <button_1.Button variant="outline" size="sm" onClick={function () {
                    setEditingConfig(config);
                    setShowConfigDialog(true);
                }}>
                            <lucide_react_1.Edit className="h-4 w-4"/>
                          </button_1.Button>
                        </div>
                      </table_1.TableCell>
                    </table_1.TableRow>); })}
                </table_1.TableBody>
              </table_1.Table>)}
          </tabs_1.TabsContent>
        </tabs_1.Tabs>
      </card_1.CardContent>
    </card_1.Card>);
}
// Config Form Component (placeholder)
function ConfigForm(_a) {
    var config = _a.config, onSave = _a.onSave, onCancel = _a.onCancel;
    return (<div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Formulário de configuração será implementado na próxima iteração.
      </p>
      <dialog_1.DialogFooter>
        <button_1.Button variant="outline" onClick={onCancel}>
          Cancelar
        </button_1.Button>
        <button_1.Button onClick={function () { return onSave({}); }}>Salvar</button_1.Button>
      </dialog_1.DialogFooter>
    </div>);
}
