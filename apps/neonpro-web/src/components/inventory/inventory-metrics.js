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
exports.InventoryMetrics = InventoryMetrics;
/**
 * Story 11.3: Inventory Metrics Component
 * Real-time inventory metrics and KPI dashboard
 */
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var icons_1 = require("@/components/ui/icons");
var progress_1 = require("@/components/ui/progress");
var select_1 = require("@/components/ui/select");
var table_1 = require("@/components/ui/table");
var inventory_1 = require("@/lib/inventory");
var use_toast_1 = require("@/hooks/use-toast");
function InventoryMetrics(_a) {
  var _this = this;
  var onRefresh = _a.onRefresh,
    className = _a.className;
  var _b = (0, react_1.useState)(null),
    metrics = _b[0],
    setMetrics = _b[1];
  var _c = (0, react_1.useState)([]),
    alerts = _c[0],
    setAlerts = _c[1];
  var _d = (0, react_1.useState)(true),
    isLoading = _d[0],
    setIsLoading = _d[1];
  var _e = (0, react_1.useState)({
      centro_custo: "all",
      periodo: "month",
    }),
    filters = _e[0],
    setFilters = _e[1];
  var toast = (0, use_toast_1.useToast)().toast;
  var stockOutputManager = new inventory_1.StockOutputManager();
  var consumptionAnalyzer = new inventory_1.ConsumptionAnalyzer();
  var fifoManager = new inventory_1.FIFOManager();
  (0, react_1.useEffect)(
    function () {
      loadMetrics();
    },
    [filters],
  );
  var loadMetrics = function () {
    return __awaiter(_this, void 0, void 0, function () {
      var endDate,
        startDate,
        _a,
        analyticsData,
        analyticsError,
        fifoStatus,
        calculatedMetrics,
        generatedAlerts,
        error_1,
        errorMessage;
      var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
      return __generator(this, function (_p) {
        switch (_p.label) {
          case 0:
            _p.trys.push([0, 3, 4, 5]);
            setIsLoading(true);
            endDate = new Date();
            startDate = new Date();
            switch (filters.periodo) {
              case "today":
                startDate.setHours(0, 0, 0, 0);
                break;
              case "week":
                startDate.setDate(endDate.getDate() - 7);
                break;
              case "month":
                startDate.setMonth(endDate.getMonth() - 1);
                break;
              case "quarter":
                startDate.setMonth(endDate.getMonth() - 3);
                break;
            }
            return [
              4 /*yield*/,
              consumptionAnalyzer.getConsumptionAnalytics(
                filters.centro_custo === "all" ? undefined : filters.centro_custo,
                startDate,
                endDate,
              ),
            ];
          case 1:
            (_a = _p.sent()), (analyticsData = _a.data), (analyticsError = _a.error);
            if (analyticsError) {
              console.warn("Analytics error:", analyticsError);
            }
            return [
              4 /*yield*/,
              fifoManager.getFIFOStatusByCostCenter(
                filters.centro_custo === "all" ? undefined : filters.centro_custo,
              ),
            ];
          case 2:
            fifoStatus = _p.sent().data;
            calculatedMetrics = {
              total_items:
                ((_b =
                  analyticsData === null || analyticsData === void 0
                    ? void 0
                    : analyticsData.produtos_mais_consumidos) === null || _b === void 0
                  ? void 0
                  : _b.length) || 0,
              total_value:
                ((_c =
                  analyticsData === null || analyticsData === void 0
                    ? void 0
                    : analyticsData.consumo_total) === null || _c === void 0
                  ? void 0
                  : _c.valor_total) || 0,
              consumption_rate:
                ((_d =
                  analyticsData === null || analyticsData === void 0
                    ? void 0
                    : analyticsData.media_diaria) === null || _d === void 0
                  ? void 0
                  : _d.valor) || 0,
              efficiency_score:
                ((_e =
                  analyticsData === null || analyticsData === void 0
                    ? void 0
                    : analyticsData.eficiencia_custos) === null || _e === void 0
                  ? void 0
                  : _e.score_eficiencia) || 0,
              cost_savings:
                ((_f =
                  analyticsData === null || analyticsData === void 0
                    ? void 0
                    : analyticsData.eficiencia_custos) === null || _f === void 0
                  ? void 0
                  : _f.economia_potencial) || 0,
              expiry_alerts:
                ((_g =
                  fifoStatus === null || fifoStatus === void 0
                    ? void 0
                    : fifoStatus.filter(function (item) {
                        return (
                          item.status_validade === "proximoVencimento" ||
                          item.status_validade === "vencido"
                        );
                      })) === null || _g === void 0
                  ? void 0
                  : _g.length) || 0,
              low_stock_alerts:
                ((_h =
                  fifoStatus === null || fifoStatus === void 0
                    ? void 0
                    : fifoStatus.filter(function (item) {
                        return item.quantidade_atual <= (item.estoque_minimo || 0);
                      })) === null || _h === void 0
                  ? void 0
                  : _h.length) || 0,
              transfer_requests: 0, // Will be calculated separately
              aging_analysis: {
                items_30_days:
                  ((_j =
                    fifoStatus === null || fifoStatus === void 0
                      ? void 0
                      : fifoStatus.filter(function (item) {
                          var daysToExpiry = Math.ceil(
                            (new Date(item.data_validade).getTime() - Date.now()) /
                              (1000 * 60 * 60 * 24),
                          );
                          return daysToExpiry <= 30 && daysToExpiry > 0;
                        })) === null || _j === void 0
                    ? void 0
                    : _j.length) || 0,
                items_60_days:
                  ((_k =
                    fifoStatus === null || fifoStatus === void 0
                      ? void 0
                      : fifoStatus.filter(function (item) {
                          var daysToExpiry = Math.ceil(
                            (new Date(item.data_validade).getTime() - Date.now()) /
                              (1000 * 60 * 60 * 24),
                          );
                          return daysToExpiry <= 60 && daysToExpiry > 30;
                        })) === null || _k === void 0
                    ? void 0
                    : _k.length) || 0,
                items_90_days:
                  ((_l =
                    fifoStatus === null || fifoStatus === void 0
                      ? void 0
                      : fifoStatus.filter(function (item) {
                          var daysToExpiry = Math.ceil(
                            (new Date(item.data_validade).getTime() - Date.now()) /
                              (1000 * 60 * 60 * 24),
                          );
                          return daysToExpiry <= 90 && daysToExpiry > 60;
                        })) === null || _l === void 0
                    ? void 0
                    : _l.length) || 0,
                expired_items:
                  ((_m =
                    fifoStatus === null || fifoStatus === void 0
                      ? void 0
                      : fifoStatus.filter(function (item) {
                          return new Date(item.data_validade) < new Date();
                        })) === null || _m === void 0
                    ? void 0
                    : _m.length) || 0,
              },
              top_consumers:
                ((_o =
                  analyticsData === null || analyticsData === void 0
                    ? void 0
                    : analyticsData.produtos_mais_consumidos) === null || _o === void 0
                  ? void 0
                  : _o.slice(0, 5)) || [],
              trends:
                (analyticsData === null || analyticsData === void 0
                  ? void 0
                  : analyticsData.tendencias) || [],
            };
            setMetrics(calculatedMetrics);
            generatedAlerts = [];
            // Low stock alerts
            if (calculatedMetrics.low_stock_alerts > 0) {
              generatedAlerts.push({
                id: "low-stock-alert",
                type: "stock_baixo",
                severity: "alta",
                title: "Estoque Baixo",
                message: "".concat(
                  calculatedMetrics.low_stock_alerts,
                  " produto(s) com estoque abaixo do m\u00EDnimo",
                ),
                product_id: "multiple",
                threshold_value: 0,
                current_value: calculatedMetrics.low_stock_alerts,
                created_at: new Date().toISOString(),
              });
            }
            // Expiry alerts
            if (calculatedMetrics.expiry_alerts > 0) {
              generatedAlerts.push({
                id: "expiry-alert",
                type: "vencimento_proximo",
                severity: "media",
                title: "Vencimento Próximo",
                message: "".concat(
                  calculatedMetrics.expiry_alerts,
                  " produto(s) pr\u00F3ximo(s) ao vencimento",
                ),
                product_id: "multiple",
                threshold_value: 30,
                current_value: calculatedMetrics.expiry_alerts,
                created_at: new Date().toISOString(),
              });
            }
            // Efficiency alerts
            if (calculatedMetrics.efficiency_score < 70) {
              generatedAlerts.push({
                id: "efficiency-alert",
                type: "eficiencia_baixa",
                severity: "media",
                title: "Eficiência Baixa",
                message: "Score de efici\u00EAncia atual: ".concat(
                  calculatedMetrics.efficiency_score,
                  "%",
                ),
                product_id: "general",
                threshold_value: 70,
                current_value: calculatedMetrics.efficiency_score,
                created_at: new Date().toISOString(),
              });
            }
            setAlerts(generatedAlerts);
            return [3 /*break*/, 5];
          case 3:
            error_1 = _p.sent();
            errorMessage = error_1 instanceof Error ? error_1.message : "Erro ao carregar métricas";
            toast({
              title: "Erro",
              description: errorMessage,
              variant: "destructive",
            });
            return [3 /*break*/, 5];
          case 4:
            setIsLoading(false);
            return [7 /*endfinally*/];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  var formatCurrency = function (value) {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };
  var formatPercentage = function (value) {
    return "".concat(value.toFixed(1), "%");
  };
  var getSeverityColor = function (severity) {
    var colors = {
      baixa: "bg-blue-100 text-blue-800",
      media: "bg-yellow-100 text-yellow-800",
      alta: "bg-red-100 text-red-800",
    };
    return colors[severity] || "bg-gray-100 text-gray-800";
  };
  var getEfficiencyColor = function (score) {
    if (score >= 90) return "text-green-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };
  var getTrendIcon = function (trend) {
    if (!(trend === null || trend === void 0 ? void 0 : trend.variacao_valor))
      return <icons_1.Icons.Minus className="h-4 w-4 text-gray-500" />;
    return trend.variacao_valor >= 0
      ? <icons_1.Icons.TrendingUp className="h-4 w-4 text-green-500" />
      : <icons_1.Icons.TrendingDown className="h-4 w-4 text-red-500" />;
  };
  if (isLoading) {
    return (
      <div className={"space-y-6 ".concat(className)}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Métricas de Inventário</h2>
            <p className="text-muted-foreground">Dashboard de indicadores</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(function (i) {
            return (
              <card_1.Card key={i}>
                <card_1.CardContent className="p-6">
                  <div className="h-20 bg-gray-200 rounded animate-pulse" />
                </card_1.CardContent>
              </card_1.Card>
            );
          })}
        </div>
      </div>
    );
  }
  return (
    <div className={"space-y-6 ".concat(className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Métricas de Inventário</h2>
          <p className="text-muted-foreground">Dashboard de indicadores e KPIs em tempo real</p>
        </div>
        <button_1.Button variant="outline" onClick={loadMetrics}>
          <icons_1.Icons.RefreshCw className="w-4 h-4 mr-2" />
          Atualizar
        </button_1.Button>
      </div>

      {/* Filters */}
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle className="text-lg">Filtros</card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Centro de Custo</label>
              <select_1.Select
                value={filters.centro_custo}
                onValueChange={function (value) {
                  return setFilters(function (prev) {
                    return __assign(__assign({}, prev), { centro_custo: value });
                  });
                }}
              >
                <select_1.SelectTrigger>
                  <select_1.SelectValue />
                </select_1.SelectTrigger>
                <select_1.SelectContent>
                  <select_1.SelectItem value="all">Todos os Centros</select_1.SelectItem>
                  <select_1.SelectItem value="cc001">Consultório 1</select_1.SelectItem>
                  <select_1.SelectItem value="cc002">Consultório 2</select_1.SelectItem>
                  <select_1.SelectItem value="cc003">Sala de Cirurgia</select_1.SelectItem>
                  <select_1.SelectItem value="cc004">Recepção</select_1.SelectItem>
                  <select_1.SelectItem value="cc005">Estoque Central</select_1.SelectItem>
                </select_1.SelectContent>
              </select_1.Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Período</label>
              <select_1.Select
                value={filters.periodo}
                onValueChange={function (value) {
                  return setFilters(function (prev) {
                    return __assign(__assign({}, prev), { periodo: value });
                  });
                }}
              >
                <select_1.SelectTrigger>
                  <select_1.SelectValue />
                </select_1.SelectTrigger>
                <select_1.SelectContent>
                  <select_1.SelectItem value="today">Hoje</select_1.SelectItem>
                  <select_1.SelectItem value="week">Última Semana</select_1.SelectItem>
                  <select_1.SelectItem value="month">Último Mês</select_1.SelectItem>
                  <select_1.SelectItem value="quarter">Último Trimestre</select_1.SelectItem>
                </select_1.SelectContent>
              </select_1.Select>
            </div>
          </div>
        </card_1.CardContent>
      </card_1.Card>

      {/* Key Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <card_1.Card>
            <card_1.CardHeader className="pb-2">
              <card_1.CardTitle className="text-sm font-medium text-muted-foreground">
                Total de Itens
              </card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="text-2xl font-bold">{metrics.total_items}</div>
              <p className="text-sm text-muted-foreground">produtos únicos</p>
            </card_1.CardContent>
          </card_1.Card>

          <card_1.Card>
            <card_1.CardHeader className="pb-2">
              <card_1.CardTitle className="text-sm font-medium text-muted-foreground">
                Valor Total
              </card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="text-2xl font-bold">{formatCurrency(metrics.total_value)}</div>
              <p className="text-sm text-muted-foreground">valor consumido</p>
            </card_1.CardContent>
          </card_1.Card>

          <card_1.Card>
            <card_1.CardHeader className="pb-2">
              <card_1.CardTitle className="text-sm font-medium text-muted-foreground">
                Taxa de Consumo
              </card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="text-2xl font-bold">{formatCurrency(metrics.consumption_rate)}</div>
              <p className="text-sm text-muted-foreground">por dia (média)</p>
            </card_1.CardContent>
          </card_1.Card>

          <card_1.Card>
            <card_1.CardHeader className="pb-2">
              <card_1.CardTitle className="text-sm font-medium text-muted-foreground">
                Score de Eficiência
              </card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div
                className={"text-2xl font-bold ".concat(
                  getEfficiencyColor(metrics.efficiency_score),
                )}
              >
                {formatPercentage(metrics.efficiency_score)}
              </div>
              <p className="text-sm text-muted-foreground">eficiência de custos</p>
            </card_1.CardContent>
          </card_1.Card>
        </div>
      )}

      {/* Secondary Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <card_1.Card>
            <card_1.CardHeader className="pb-2">
              <card_1.CardTitle className="text-sm font-medium text-muted-foreground">
                Economia Potencial
              </card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(metrics.cost_savings)}
              </div>
              <p className="text-sm text-muted-foreground">oportunidades identificadas</p>
            </card_1.CardContent>
          </card_1.Card>

          <card_1.Card>
            <card_1.CardHeader className="pb-2">
              <card_1.CardTitle className="text-sm font-medium text-muted-foreground">
                Alertas de Vencimento
              </card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="text-2xl font-bold text-yellow-600">{metrics.expiry_alerts}</div>
              <p className="text-sm text-muted-foreground">produtos próximos ao vencimento</p>
            </card_1.CardContent>
          </card_1.Card>

          <card_1.Card>
            <card_1.CardHeader className="pb-2">
              <card_1.CardTitle className="text-sm font-medium text-muted-foreground">
                Estoque Baixo
              </card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="text-2xl font-bold text-red-600">{metrics.low_stock_alerts}</div>
              <p className="text-sm text-muted-foreground">abaixo do estoque mínimo</p>
            </card_1.CardContent>
          </card_1.Card>
        </div>
      )}

      {/* Aging Analysis */}
      {metrics && (
        <card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle className="flex items-center gap-2">
              <icons_1.Icons.Clock className="h-5 w-5" />
              Análise de Aging (Vencimento)
            </card_1.CardTitle>
            <card_1.CardDescription>
              Distribuição de produtos por prazo de vencimento
            </card_1.CardDescription>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {metrics.aging_analysis.expired_items}
                </div>
                <p className="text-sm text-muted-foreground">Vencidos</p>
                <progress_1.Progress value={100} className="mt-2 h-2" />
              </div>

              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {metrics.aging_analysis.items_30_days}
                </div>
                <p className="text-sm text-muted-foreground">Até 30 dias</p>
                <progress_1.Progress value={75} className="mt-2 h-2" />
              </div>

              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {metrics.aging_analysis.items_60_days}
                </div>
                <p className="text-sm text-muted-foreground">30-60 dias</p>
                <progress_1.Progress value={50} className="mt-2 h-2" />
              </div>

              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {metrics.aging_analysis.items_90_days}
                </div>
                <p className="text-sm text-muted-foreground">60-90 dias</p>
                <progress_1.Progress value={25} className="mt-2 h-2" />
              </div>
            </div>
          </card_1.CardContent>
        </card_1.Card>
      )}

      {/* Top Consumers */}
      {metrics && metrics.top_consumers.length > 0 && (
        <card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle className="flex items-center gap-2">
              <icons_1.Icons.BarChart3 className="h-5 w-5" />
              Top Produtos Consumidos
            </card_1.CardTitle>
            <card_1.CardDescription>
              Produtos com maior consumo no período selecionado
            </card_1.CardDescription>
          </card_1.CardHeader>
          <card_1.CardContent>
            <table_1.Table>
              <table_1.TableHeader>
                <table_1.TableRow>
                  <table_1.TableHead>Produto</table_1.TableHead>
                  <table_1.TableHead>Categoria</table_1.TableHead>
                  <table_1.TableHead>Quantidade</table_1.TableHead>
                  <table_1.TableHead>Valor</table_1.TableHead>
                  <table_1.TableHead>% Total</table_1.TableHead>
                  <table_1.TableHead>Tendência</table_1.TableHead>
                </table_1.TableRow>
              </table_1.TableHeader>
              <table_1.TableBody>
                {metrics.top_consumers.map(function (product, index) {
                  return (
                    <table_1.TableRow key={index}>
                      <table_1.TableCell className="font-medium">
                        {product.nome_produto}
                      </table_1.TableCell>
                      <table_1.TableCell>{product.categoria}</table_1.TableCell>
                      <table_1.TableCell>{product.quantidade_consumida}</table_1.TableCell>
                      <table_1.TableCell>
                        {formatCurrency(product.valor_consumido)}
                      </table_1.TableCell>
                      <table_1.TableCell>
                        <badge_1.Badge variant="outline">
                          {formatPercentage(product.percentual_consumo_total)}
                        </badge_1.Badge>
                      </table_1.TableCell>
                      <table_1.TableCell>
                        <div className="flex items-center gap-2">
                          {getTrendIcon(product)}
                          <span className="text-sm">
                            {formatPercentage(Math.abs(product.variacao_percentual || 0))}
                          </span>
                        </div>
                      </table_1.TableCell>
                    </table_1.TableRow>
                  );
                })}
              </table_1.TableBody>
            </table_1.Table>
          </card_1.CardContent>
        </card_1.Card>
      )}

      {/* Alerts */}
      {alerts.length > 0 && (
        <card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle className="flex items-center gap-2">
              <icons_1.Icons.AlertTriangle className="h-5 w-5" />
              Alertas Ativos
            </card_1.CardTitle>
            <card_1.CardDescription>
              Alertas e notificações que requerem atenção
            </card_1.CardDescription>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="space-y-3">
              {alerts.map(function (alert) {
                return (
                  <div
                    key={alert.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <icons_1.Icons.AlertCircle className="h-5 w-5 text-orange-500" />
                      <div>
                        <p className="font-medium">{alert.title}</p>
                        <p className="text-sm text-muted-foreground">{alert.message}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <badge_1.Badge className={getSeverityColor(alert.severity)}>
                        {alert.severity}
                      </badge_1.Badge>
                      {alert.threshold_value && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Limite: {alert.threshold_value}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </card_1.CardContent>
        </card_1.Card>
      )}
    </div>
  );
}
