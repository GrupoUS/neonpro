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
exports.ConsumptionAnalytics = ConsumptionAnalytics;
/**
 * Story 11.3: Consumption Analytics Component
 * Advanced consumption analytics and cost control interface
 */
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var icons_1 = require("@/components/ui/icons");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var select_1 = require("@/components/ui/select");
var table_1 = require("@/components/ui/table");
var inventory_1 = require("@/lib/inventory");
var use_toast_1 = require("@/hooks/use-toast");
function ConsumptionAnalytics(_a) {
  var onRefresh = _a.onRefresh,
    className = _a.className;
  var _b = (0, react_1.useState)(null),
    analytics = _b[0],
    setAnalytics = _b[1];
  var _c = (0, react_1.useState)([]),
    forecasts = _c[0],
    setForecasts = _c[1];
  var _d = (0, react_1.useState)([]),
    opportunities = _d[0],
    setOpportunities = _d[1];
  var _e = (0, react_1.useState)(true),
    isLoading = _e[0],
    setIsLoading = _e[1];
  var _f = (0, react_1.useState)(false),
    isGeneratingRecommendations = _f[0],
    setIsGeneratingRecommendations = _f[1];
  var _g = (0, react_1.useState)({
      centroCustoId: "cc001",
      dataInicio: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      dataFim: new Date().toISOString().split("T")[0],
      periodo: "month",
    }),
    filters = _g[0],
    setFilters = _g[1];
  var toast = (0, use_toast_1.useToast)().toast;
  var consumptionAnalyzer = new inventory_1.ConsumptionAnalyzer();
  (0, react_1.useEffect)(() => {
    loadAnalyticsData();
  }, [filters]);
  var loadAnalyticsData = () =>
    __awaiter(this, void 0, void 0, function () {
      var startDate,
        endDate,
        _a,
        analyticsData,
        analyticsError,
        _b,
        forecastData,
        forecastError,
        error_1,
        errorMessage;
      return __generator(this, (_c) => {
        switch (_c.label) {
          case 0:
            _c.trys.push([0, 3, 4, 5]);
            setIsLoading(true);
            startDate = new Date(filters.dataInicio);
            endDate = new Date(filters.dataFim);
            return [
              4 /*yield*/,
              consumptionAnalyzer.getConsumptionAnalytics(
                filters.centroCustoId,
                startDate,
                endDate,
              ),
            ];
          case 1:
            (_a = _c.sent()), (analyticsData = _a.data), (analyticsError = _a.error);
            if (analyticsError) {
              throw new Error(analyticsError);
            }
            setAnalytics(analyticsData);
            return [
              4 /*yield*/,
              consumptionAnalyzer.getConsumptionForecast(filters.centroCustoId, undefined, 30),
            ];
          case 2:
            (_b = _c.sent()), (forecastData = _b.data), (forecastError = _b.error);
            if (forecastError) {
              console.warn("Forecast error:", forecastError);
            } else {
              setForecasts(forecastData || []);
            }
            return [3 /*break*/, 5];
          case 3:
            error_1 = _c.sent();
            errorMessage =
              error_1 instanceof Error ? error_1.message : "Erro ao carregar dados de analytics";
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
  var generateOptimizationRecommendations = () =>
    __awaiter(this, void 0, void 0, function () {
      var startDate, endDate, _a, recommendationsData, error, error_2, errorMessage;
      return __generator(this, (_b) => {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, 3, 4]);
            setIsGeneratingRecommendations(true);
            startDate = new Date(filters.dataInicio);
            endDate = new Date(filters.dataFim);
            return [
              4 /*yield*/,
              consumptionAnalyzer.generateCostOptimizationRecommendations(
                filters.centroCustoId,
                startDate,
                endDate,
              ),
            ];
          case 1:
            (_a = _b.sent()), (recommendationsData = _a.data), (error = _a.error);
            if (error) {
              throw new Error(error);
            }
            setOpportunities(recommendationsData || []);
            toast({
              title: "Sucesso",
              description: "".concat(
                (recommendationsData === null || recommendationsData === void 0
                  ? void 0
                  : recommendationsData.length) || 0,
                " oportunidades de otimiza\u00E7\u00E3o identificadas",
              ),
            });
            return [3 /*break*/, 4];
          case 2:
            error_2 = _b.sent();
            errorMessage =
              error_2 instanceof Error ? error_2.message : "Erro ao gerar recomendações";
            toast({
              title: "Erro",
              description: errorMessage,
              variant: "destructive",
            });
            return [3 /*break*/, 4];
          case 3:
            setIsGeneratingRecommendations(false);
            return [7 /*endfinally*/];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  var handleFilterChange = (field, value) => {
    setFilters((prev) => {
      var _a;
      return __assign(__assign({}, prev), ((_a = {}), (_a[field] = value), _a));
    });
  };
  var getComplexityColor = (complexity) => {
    var colors = {
      baixa: "bg-green-100 text-green-800",
      media: "bg-yellow-100 text-yellow-800",
      alta: "bg-red-100 text-red-800",
    };
    return colors[complexity] || "bg-gray-100 text-gray-800";
  };
  var getTrendIcon = (trend) => {
    switch (trend) {
      case "crescente":
        return <icons_1.Icons.TrendingUp className="h-4 w-4 text-green-500" />;
      case "decrescente":
        return <icons_1.Icons.TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <icons_1.Icons.Minus className="h-4 w-4 text-gray-500" />;
    }
  };
  var formatCurrency = (value) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  var formatPercentage = (value) => "".concat(value.toFixed(1), "%");
  if (isLoading) {
    return (
      <div className={"space-y-6 ".concat(className)}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Analytics de Consumo</h2>
            <p className="text-muted-foreground">Análise e controle de custos</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <card_1.Card key={i}>
              <card_1.CardContent className="p-6">
                <div className="h-48 bg-gray-200 rounded animate-pulse" />
              </card_1.CardContent>
            </card_1.Card>
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className={"space-y-6 ".concat(className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analytics de Consumo</h2>
          <p className="text-muted-foreground">Análise avançada de consumo e controle de custos</p>
        </div>
        <div className="flex gap-2">
          <button_1.Button variant="outline" onClick={loadAnalyticsData}>
            <icons_1.Icons.RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </button_1.Button>
          <button_1.Button
            onClick={generateOptimizationRecommendations}
            disabled={isGeneratingRecommendations}
          >
            {isGeneratingRecommendations
              ? <>
                  <icons_1.Icons.Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analisando...
                </>
              : <>
                  <icons_1.Icons.Lightbulb className="w-4 h-4 mr-2" />
                  Gerar Recomendações
                </>}
          </button_1.Button>
        </div>
      </div>

      {/* Filters */}
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle className="text-lg">Filtros de Análise</card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label_1.Label>Centro de Custo</label_1.Label>
              <select_1.Select
                value={filters.centroCustoId}
                onValueChange={(value) => handleFilterChange("centroCustoId", value)}
              >
                <select_1.SelectTrigger>
                  <select_1.SelectValue placeholder="Selecione" />
                </select_1.SelectTrigger>
                <select_1.SelectContent>
                  <select_1.SelectItem value="cc001">Consultório 1</select_1.SelectItem>
                  <select_1.SelectItem value="cc002">Consultório 2</select_1.SelectItem>
                  <select_1.SelectItem value="cc003">Sala de Cirurgia</select_1.SelectItem>
                  <select_1.SelectItem value="cc004">Recepção</select_1.SelectItem>
                </select_1.SelectContent>
              </select_1.Select>
            </div>

            <div className="space-y-2">
              <label_1.Label>Data Início</label_1.Label>
              <input_1.Input
                type="date"
                value={filters.dataInicio}
                onChange={(e) => handleFilterChange("dataInicio", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label_1.Label>Data Fim</label_1.Label>
              <input_1.Input
                type="date"
                value={filters.dataFim}
                onChange={(e) => handleFilterChange("dataFim", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label_1.Label>Período</label_1.Label>
              <select_1.Select
                value={filters.periodo}
                onValueChange={(value) => handleFilterChange("periodo", value)}
              >
                <select_1.SelectTrigger>
                  <select_1.SelectValue />
                </select_1.SelectTrigger>
                <select_1.SelectContent>
                  <select_1.SelectItem value="week">Semanal</select_1.SelectItem>
                  <select_1.SelectItem value="month">Mensal</select_1.SelectItem>
                  <select_1.SelectItem value="quarter">Trimestral</select_1.SelectItem>
                  <select_1.SelectItem value="year">Anual</select_1.SelectItem>
                </select_1.SelectContent>
              </select_1.Select>
            </div>
          </div>
        </card_1.CardContent>
      </card_1.Card>

      {/* Summary Cards */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <card_1.Card>
            <card_1.CardHeader className="pb-2">
              <card_1.CardTitle className="text-sm font-medium text-muted-foreground">
                Consumo Total
              </card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(analytics.consumo_total.valor_total)}
              </div>
              <p className="text-sm text-muted-foreground">
                {analytics.consumo_total.numero_produtos} produtos
              </p>
              <div className="mt-2">
                <badge_1.Badge variant="secondary">
                  {analytics.consumo_total.numero_movimentacoes} movimentações
                </badge_1.Badge>
              </div>
            </card_1.CardContent>
          </card_1.Card>

          <card_1.Card>
            <card_1.CardHeader className="pb-2">
              <card_1.CardTitle className="text-sm font-medium text-muted-foreground">
                Média Diária
              </card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(analytics.media_diaria.valor)}
              </div>
              <p className="text-sm text-muted-foreground">
                {analytics.media_diaria.movimentacoes.toFixed(1)} movimentações/dia
              </p>
            </card_1.CardContent>
          </card_1.Card>

          <card_1.Card>
            <card_1.CardHeader className="pb-2">
              <card_1.CardTitle className="text-sm font-medium text-muted-foreground">
                Eficiência de Custos
              </card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {analytics.eficiencia_custos.score_eficiencia}%
              </div>
              <p className="text-sm text-muted-foreground">Score de eficiência</p>
            </card_1.CardContent>
          </card_1.Card>

          <card_1.Card>
            <card_1.CardHeader className="pb-2">
              <card_1.CardTitle className="text-sm font-medium text-muted-foreground">
                Economia Potencial
              </card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(analytics.eficiencia_custos.economia_potencial)}
              </div>
              <p className="text-sm text-muted-foreground">Oportunidades identificadas</p>
            </card_1.CardContent>
          </card_1.Card>
        </div>
      )}

      {/* Top Consumed Products */}
      {analytics && analytics.produtos_mais_consumidos.length > 0 && (
        <card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle className="flex items-center gap-2">
              <icons_1.Icons.BarChart3 className="h-5 w-5" />
              Produtos Mais Consumidos
            </card_1.CardTitle>
            <card_1.CardDescription>
              Análise detalhada dos produtos com maior consumo no período
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
                  <table_1.TableHead>Custo Médio</table_1.TableHead>
                </table_1.TableRow>
              </table_1.TableHeader>
              <table_1.TableBody>
                {analytics.produtos_mais_consumidos.slice(0, 10).map((product) => (
                  <table_1.TableRow key={product.produto_id}>
                    <table_1.TableCell className="font-medium">
                      {product.nome_produto}
                    </table_1.TableCell>
                    <table_1.TableCell>{product.categoria}</table_1.TableCell>
                    <table_1.TableCell>{product.quantidade_consumida}</table_1.TableCell>
                    <table_1.TableCell>{formatCurrency(product.valor_consumido)}</table_1.TableCell>
                    <table_1.TableCell>
                      <badge_1.Badge variant="outline">
                        {formatPercentage(product.percentual_consumo_total)}
                      </badge_1.Badge>
                    </table_1.TableCell>
                    <table_1.TableCell>
                      <div className="flex items-center gap-2">
                        {getTrendIcon(product.tendencia_mensal)}
                        <span className="text-sm">
                          {formatPercentage(product.variacao_percentual)}
                        </span>
                      </div>
                    </table_1.TableCell>
                    <table_1.TableCell>
                      {formatCurrency(product.custo_medio_unitario)}
                    </table_1.TableCell>
                  </table_1.TableRow>
                ))}
              </table_1.TableBody>
            </table_1.Table>
          </card_1.CardContent>
        </card_1.Card>
      )}

      {/* Consumption Trends */}
      {analytics && analytics.tendencias.length > 0 && (
        <card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle className="flex items-center gap-2">
              <icons_1.Icons.TrendingUp className="h-5 w-5" />
              Tendências de Consumo
            </card_1.CardTitle>
            <card_1.CardDescription>Evolução do consumo ao longo do tempo</card_1.CardDescription>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="space-y-4">
              {analytics.tendencias.map((trend, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <h4 className="font-medium">{trend.periodo}</h4>
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(trend.valor_consumido)} • {trend.quantidade_consumida}{" "}
                      unidades
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 mb-1">
                      {trend.variacao_valor >= 0
                        ? <icons_1.Icons.TrendingUp className="h-4 w-4 text-green-500" />
                        : <icons_1.Icons.TrendingDown className="h-4 w-4 text-red-500" />}
                      <span
                        className={"text-sm font-medium ".concat(
                          trend.variacao_valor >= 0 ? "text-green-600" : "text-red-600",
                        )}
                      >
                        {formatPercentage(Math.abs(trend.variacao_valor))}
                      </span>
                    </div>
                    <badge_1.Badge variant="secondary">
                      Score: {trend.eficiencia_score}
                    </badge_1.Badge>
                  </div>
                </div>
              ))}
            </div>
          </card_1.CardContent>
        </card_1.Card>
      )}

      {/* Optimization Opportunities */}
      {opportunities.length > 0 && (
        <card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle className="flex items-center gap-2">
              <icons_1.Icons.Lightbulb className="h-5 w-5" />
              Oportunidades de Otimização
            </card_1.CardTitle>
            <card_1.CardDescription>
              Recomendações para redução de custos e melhoria de eficiência
            </card_1.CardDescription>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="space-y-4">
              {opportunities.map((opportunity, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-medium mb-1">{opportunity.descricao}</h4>
                      <div className="flex items-center gap-2 mb-2">
                        <badge_1.Badge className={getComplexityColor(opportunity.complexidade)}>
                          {opportunity.complexidade} complexidade
                        </badge_1.Badge>
                        <badge_1.Badge variant="outline">
                          {opportunity.prazo_implementacao} dias
                        </badge_1.Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Impacto: {opportunity.impacto_operacional}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">
                        {formatCurrency(opportunity.economia_estimada)}
                      </div>
                      <p className="text-sm text-muted-foreground">Economia estimada</p>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button_1.Button size="sm" variant="outline">
                      <icons_1.Icons.ArrowRight className="w-4 h-4 mr-1" />
                      Implementar
                    </button_1.Button>
                  </div>
                </div>
              ))}
            </div>
          </card_1.CardContent>
        </card_1.Card>
      )}

      {/* Consumption Forecasts */}
      {forecasts.length > 0 && (
        <card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle className="flex items-center gap-2">
              <icons_1.Icons.Crystal className="h-5 w-5" />
              Previsão de Consumo
            </card_1.CardTitle>
            <card_1.CardDescription>
              Previsões de consumo para os próximos 30 dias
            </card_1.CardDescription>
          </card_1.CardHeader>
          <card_1.CardContent>
            <table_1.Table>
              <table_1.TableHeader>
                <table_1.TableRow>
                  <table_1.TableHead>Produto</table_1.TableHead>
                  <table_1.TableHead>Previsão Quantidade</table_1.TableHead>
                  <table_1.TableHead>Previsão Valor</table_1.TableHead>
                  <table_1.TableHead>Confiança</table_1.TableHead>
                  <table_1.TableHead>Recomendação Compra</table_1.TableHead>
                  <table_1.TableHead>Economia Esperada</table_1.TableHead>
                </table_1.TableRow>
              </table_1.TableHeader>
              <table_1.TableBody>
                {forecasts.slice(0, 5).map((forecast) => (
                  <table_1.TableRow key={forecast.produto_id}>
                    <table_1.TableCell className="font-medium">
                      {forecast.nome_produto}
                    </table_1.TableCell>
                    <table_1.TableCell>{forecast.previsao_quantidade.toFixed(0)}</table_1.TableCell>
                    <table_1.TableCell>{formatCurrency(forecast.previsao_valor)}</table_1.TableCell>
                    <table_1.TableCell>
                      <badge_1.Badge
                        variant={forecast.confianca_previsao >= 75 ? "default" : "secondary"}
                      >
                        {forecast.confianca_previsao}%
                      </badge_1.Badge>
                    </table_1.TableCell>
                    <table_1.TableCell>
                      {forecast.recomendacao_compra.quantidade_recomendada.toFixed(0)} unidades
                      <br />
                      <span className="text-sm text-muted-foreground">
                        em {forecast.recomendacao_compra.prazo_compra_ideal} dias
                      </span>
                    </table_1.TableCell>
                    <table_1.TableCell>
                      {formatCurrency(forecast.recomendacao_compra.economia_esperada)}
                    </table_1.TableCell>
                  </table_1.TableRow>
                ))}
              </table_1.TableBody>
            </table_1.Table>
          </card_1.CardContent>
        </card_1.Card>
      )}

      {/* Alerts */}
      {analytics && analytics.alertas.length > 0 && (
        <card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle className="flex items-center gap-2">
              <icons_1.Icons.AlertTriangle className="h-5 w-5" />
              Alertas de Consumo
            </card_1.CardTitle>
            <card_1.CardDescription>
              Alertas e anomalias detectadas no consumo
            </card_1.CardDescription>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="space-y-3">
              {analytics.alertas.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <icons_1.Icons.AlertCircle className="h-5 w-5 text-orange-500" />
                    <div>
                      <p className="font-medium">{alert.descricao}</p>
                      <p className="text-sm text-muted-foreground">{alert.acao_recomendada}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <badge_1.Badge
                      variant={alert.gravidade === "alta" ? "destructive" : "secondary"}
                    >
                      {alert.gravidade}
                    </badge_1.Badge>
                    <p className="text-sm text-muted-foreground mt-1">
                      {formatCurrency(alert.valor_impacto)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </card_1.CardContent>
        </card_1.Card>
      )}
    </div>
  );
}
