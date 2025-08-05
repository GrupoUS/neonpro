// A/B Testing Manager Component
// Epic 7.2: Automated Marketing Campaigns + Personalization
// Author: VoidBeast Agent
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
exports.default = ABTestManager;
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var progress_1 = require("@/components/ui/progress");
var select_1 = require("@/components/ui/select");
var separator_1 = require("@/components/ui/separator");
var textarea_1 = require("@/components/ui/textarea");
var lucide_react_1 = require("lucide-react");
var react_1 = require("react");
var sonner_1 = require("sonner");
function ABTestManager(_a) {
  var _this = this;
  var campaignId = _a.campaignId,
    onTestCreated = _a.onTestCreated;
  var _b = (0, react_1.useState)([]),
    tests = _b[0],
    setTests = _b[1];
  var _c = (0, react_1.useState)(false),
    isLoading = _c[0],
    setIsLoading = _c[1];
  var _d = (0, react_1.useState)(false),
    isCreating = _d[0],
    setIsCreating = _d[1];
  var _e = (0, react_1.useState)(null),
    selectedTest = _e[0],
    setSelectedTest = _e[1];
  // Form state for creating new A/B test
  var _f = (0, react_1.useState)({
      test_name: "",
      hypothesis: "",
      variations: {
        control: { name: "Controle (Original)", content: "", percentage: 50 },
        variant_a: { name: "Variação A", content: "", percentage: 50 },
      },
      success_metric: "conversion_rate",
      confidence_level: 95,
      duration_days: 14,
    }),
    formData = _f[0],
    setFormData = _f[1];
  var loadABTests = function () {
    return __awaiter(_this, void 0, void 0, function () {
      var mockTests;
      return __generator(this, function (_a) {
        try {
          setIsLoading(true);
          mockTests = [
            {
              id: "1",
              campaign_id: campaignId,
              test_name: "Teste de Assunto do Email",
              hypothesis: "Assuntos mais personalizados aumentam taxa de abertura",
              variations: {
                control: {
                  name: "Controle",
                  content: "Promoção especial para você",
                  percentage: 50,
                },
                variant_a: {
                  name: "Variação A",
                  content: "Maria, sua promoção exclusiva chegou!",
                  percentage: 50,
                },
              },
              traffic_split: { control: 0.5, variant_a: 0.5 },
              success_metric: "open_rate",
              confidence_level: 95,
              duration_days: 7,
              status: "running",
              statistical_significance: 0.83,
              created_at: new Date().toISOString(),
              started_at: new Date().toISOString(),
            },
          ];
          setTests(mockTests);
        } catch (error) {
          console.error("Error loading A/B tests:", error);
          sonner_1.toast.error("Erro ao carregar testes A/B");
        } finally {
          setIsLoading(false);
        }
        return [2 /*return*/];
      });
    });
  };
  (0, react_1.useEffect)(
    function () {
      loadABTests();
    },
    [campaignId],
  );
  var handleCreateTest = function () {
    return __awaiter(_this, void 0, void 0, function () {
      var testData, response, data, error_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, 4, 5]);
            setIsCreating(true);
            testData = {
              campaign_id: campaignId,
              test_name: formData.test_name,
              hypothesis: formData.hypothesis,
              variations: formData.variations,
              traffic_split: Object.keys(formData.variations).reduce(function (acc, key) {
                acc[key] = formData.variations[key].percentage / 100;
                return acc;
              }, {}),
              success_metric: formData.success_metric,
              confidence_level: formData.confidence_level,
              duration_days: formData.duration_days,
            };
            return [
              4 /*yield*/,
              fetch("/api/campaigns/".concat(campaignId, "/ab-test"), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(testData),
              }),
            ];
          case 1:
            response = _a.sent();
            return [4 /*yield*/, response.json()];
          case 2:
            data = _a.sent();
            if (response.ok) {
              sonner_1.toast.success("Teste A/B criado com sucesso!");
              loadABTests();
              if (onTestCreated) {
                onTestCreated(data.ab_test);
              }
              // Reset form
              setFormData({
                test_name: "",
                hypothesis: "",
                variations: {
                  control: {
                    name: "Controle (Original)",
                    content: "",
                    percentage: 50,
                  },
                  variant_a: { name: "Variação A", content: "", percentage: 50 },
                },
                success_metric: "conversion_rate",
                confidence_level: 95,
                duration_days: 14,
              });
            } else {
              sonner_1.toast.error("Erro ao criar teste A/B: " + data.error);
            }
            return [3 /*break*/, 5];
          case 3:
            error_1 = _a.sent();
            console.error("Error creating A/B test:", error_1);
            sonner_1.toast.error("Erro ao criar teste A/B");
            return [3 /*break*/, 5];
          case 4:
            setIsCreating(false);
            return [7 /*endfinally*/];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  var updateVariationPercentage = function (variationKey, percentage) {
    var variations = __assign({}, formData.variations);
    var variationKeys = Object.keys(variations);
    var otherKey = variationKeys.find(function (key) {
      return key !== variationKey;
    });
    if (otherKey) {
      variations[variationKey].percentage = percentage;
      variations[otherKey].percentage = 100 - percentage;
      setFormData(function (prev) {
        return __assign(__assign({}, prev), { variations: variations });
      });
    }
  };
  var getStatusBadge = function (status) {
    var statusConfig = {
      draft: { color: "bg-gray-500", text: "Rascunho" },
      running: { color: "bg-blue-500", text: "Executando" },
      completed: { color: "bg-green-500", text: "Concluído" },
      paused: { color: "bg-yellow-500", text: "Pausado" },
      cancelled: { color: "bg-red-500", text: "Cancelado" },
    };
    var config = statusConfig[status] || statusConfig.draft;
    return (
      <badge_1.Badge className={"".concat(config.color, " text-white")}>
        {config.text}
      </badge_1.Badge>
    );
  };
  var getSuccessMetricLabel = function (metric) {
    var labels = {
      open_rate: "Taxa de Abertura",
      click_rate: "Taxa de Clique",
      conversion_rate: "Taxa de Conversão",
      unsubscribe_rate: "Taxa de Descadastro",
      revenue: "Receita",
    };
    return labels[metric] || metric;
  };
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <lucide_react_1.TestTube className="h-6 w-6" />
            Testes A/B
          </h2>
          <p className="text-muted-foreground">
            Otimize suas campanhas com testes estatisticamente significativos
          </p>
        </div>
      </div>

      {/* Create New A/B Test */}
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle>Criar Novo Teste A/B</card_1.CardTitle>
          <card_1.CardDescription>
            Configure um teste para otimizar sua campanha
          </card_1.CardDescription>
        </card_1.CardHeader>
        <card_1.CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label_1.Label htmlFor="test_name">Nome do Teste</label_1.Label>
              <input_1.Input
                id="test_name"
                value={formData.test_name}
                onChange={function (e) {
                  return setFormData(function (prev) {
                    return __assign(__assign({}, prev), { test_name: e.target.value });
                  });
                }}
                placeholder="Ex: Teste de Assunto do Email"
              />
            </div>

            <div>
              <label_1.Label htmlFor="success_metric">Métrica de Sucesso</label_1.Label>
              <select_1.Select
                value={formData.success_metric}
                onValueChange={function (value) {
                  return setFormData(function (prev) {
                    return __assign(__assign({}, prev), { success_metric: value });
                  });
                }}
              >
                <select_1.SelectTrigger>
                  <select_1.SelectValue placeholder="Selecione a métrica" />
                </select_1.SelectTrigger>
                <select_1.SelectContent>
                  <select_1.SelectItem value="open_rate">Taxa de Abertura</select_1.SelectItem>
                  <select_1.SelectItem value="click_rate">Taxa de Clique</select_1.SelectItem>
                  <select_1.SelectItem value="conversion_rate">
                    Taxa de Conversão
                  </select_1.SelectItem>
                  <select_1.SelectItem value="revenue">Receita</select_1.SelectItem>
                </select_1.SelectContent>
              </select_1.Select>
            </div>
          </div>

          <div>
            <label_1.Label htmlFor="hypothesis">Hipótese</label_1.Label>
            <textarea_1.Textarea
              id="hypothesis"
              value={formData.hypothesis}
              onChange={function (e) {
                return setFormData(function (prev) {
                  return __assign(__assign({}, prev), { hypothesis: e.target.value });
                });
              }}
              placeholder="Ex: Assuntos mais personalizados aumentam a taxa de abertura em 15%"
              rows={2}
            />
          </div>

          {/* Variations Configuration */}
          <div className="space-y-4">
            <label_1.Label>Configuração das Variações</label_1.Label>

            {Object.entries(formData.variations).map(function (_a, index) {
              var key = _a[0],
                variation = _a[1];
              return (
                <card_1.Card key={key} className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{variation.name}</h4>
                      <div className="flex items-center space-x-2">
                        <label_1.Label className="text-sm">Tráfego:</label_1.Label>
                        <input_1.Input
                          type="number"
                          min="10"
                          max="90"
                          value={variation.percentage}
                          onChange={function (e) {
                            return updateVariationPercentage(key, parseInt(e.target.value) || 0);
                          }}
                          className="w-20"
                        />
                        <span className="text-sm">%</span>
                      </div>
                    </div>

                    <textarea_1.Textarea
                      value={variation.content}
                      onChange={function (e) {
                        var variations = __assign({}, formData.variations);
                        variations[key].content = e.target.value;
                        setFormData(function (prev) {
                          return __assign(__assign({}, prev), { variations: variations });
                        });
                      }}
                      placeholder="Conteúdo da variação..."
                      rows={2}
                    />
                  </div>
                </card_1.Card>
              );
            })}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label_1.Label htmlFor="confidence_level">Nível de Confiança (%)</label_1.Label>
              <select_1.Select
                value={formData.confidence_level.toString()}
                onValueChange={function (value) {
                  return setFormData(function (prev) {
                    return __assign(__assign({}, prev), { confidence_level: parseInt(value) });
                  });
                }}
              >
                <select_1.SelectTrigger>
                  <select_1.SelectValue />
                </select_1.SelectTrigger>
                <select_1.SelectContent>
                  <select_1.SelectItem value="90">90%</select_1.SelectItem>
                  <select_1.SelectItem value="95">95%</select_1.SelectItem>
                  <select_1.SelectItem value="99">99%</select_1.SelectItem>
                </select_1.SelectContent>
              </select_1.Select>
            </div>

            <div>
              <label_1.Label htmlFor="duration_days">Duração (dias)</label_1.Label>
              <input_1.Input
                id="duration_days"
                type="number"
                min="3"
                max="30"
                value={formData.duration_days}
                onChange={function (e) {
                  return setFormData(function (prev) {
                    return __assign(__assign({}, prev), {
                      duration_days: parseInt(e.target.value) || 14,
                    });
                  });
                }}
              />
            </div>
          </div>

          <button_1.Button
            onClick={handleCreateTest}
            disabled={isCreating || !formData.test_name || !formData.hypothesis}
            className="w-full"
          >
            {isCreating ? "Criando..." : "Criar Teste A/B"}
          </button_1.Button>
        </card_1.CardContent>
      </card_1.Card>

      {/* Active Tests */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <lucide_react_1.BarChart3 className="h-5 w-5" />
          Testes Ativos ({tests.length})
        </h3>

        {tests.map(function (test) {
          return (
            <card_1.Card key={test.id}>
              <card_1.CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <card_1.CardTitle className="text-lg">{test.test_name}</card_1.CardTitle>
                    <card_1.CardDescription>{test.hypothesis}</card_1.CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(test.status)}
                    {test.status === "running" && test.statistical_significance && (
                      <badge_1.Badge variant="outline">
                        {Math.round(test.statistical_significance * 100)}% confiança
                      </badge_1.Badge>
                    )}
                  </div>
                </div>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="space-y-4">
                  {/* Test Configuration */}
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Métrica: </span>
                      {getSuccessMetricLabel(test.success_metric)}
                    </div>
                    <div>
                      <span className="font-medium">Duração: </span>
                      {test.duration_days} dias
                    </div>
                    <div>
                      <span className="font-medium">Confiança: </span>
                      {test.confidence_level}%
                    </div>
                  </div>

                  <separator_1.Separator />

                  {/* Variations Performance */}
                  <div className="space-y-3">
                    <h4 className="font-medium">Performance das Variações</h4>

                    {Object.entries(test.variations).map(function (_a) {
                      var key = _a[0],
                        variation = _a[1];
                      return (
                        <div key={key} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{variation.name}</span>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm">
                                {Math.round(test.traffic_split[key] * 100)}% tráfego
                              </span>
                              {test.winner_variation === key && (
                                <badge_1.Badge className="bg-yellow-500 text-white">
                                  <lucide_react_1.Trophy className="h-3 w-3 mr-1" />
                                  Vencedor
                                </badge_1.Badge>
                              )}
                            </div>
                          </div>

                          {/* Mock performance data - in real app would come from API */}
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="grid grid-cols-4 gap-4 text-sm">
                              <div>
                                <div className="font-medium">1,250</div>
                                <div className="text-muted-foreground">Envios</div>
                              </div>
                              <div>
                                <div className="font-medium">387</div>
                                <div className="text-muted-foreground">Aberturas</div>
                              </div>
                              <div>
                                <div className="font-medium">31.0%</div>
                                <div className="text-muted-foreground">Taxa</div>
                              </div>
                              <div>
                                <div className="font-medium text-green-600">+5.2%</div>
                                <div className="text-muted-foreground">vs. Controle</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Statistical Significance */}
                  {test.status === "running" && test.statistical_significance && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Significância Estatística</span>
                        <span className="font-medium">
                          {Math.round(test.statistical_significance * 100)}%
                        </span>
                      </div>
                      <progress_1.Progress value={test.statistical_significance * 100} />

                      {test.statistical_significance >= 0.95
                        ? <p className="text-sm text-green-600">
                            ✓ Resultado estatisticamente significativo! Pode declarar vencedor.
                          </p>
                        : <p className="text-sm text-yellow-600">
                            ⏳ Aguardando mais dados para significância estatística...
                          </p>}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-2 pt-2">
                    <button_1.Button variant="outline" size="sm">
                      <lucide_react_1.BarChart3 className="h-4 w-4 mr-2" />
                      Ver Detalhes
                    </button_1.Button>

                    {test.status === "running" && (
                      <>
                        <button_1.Button variant="outline" size="sm">
                          <lucide_react_1.Pause className="h-4 w-4 mr-2" />
                          Pausar
                        </button_1.Button>

                        {test.statistical_significance && test.statistical_significance >= 0.95 && (
                          <button_1.Button size="sm">
                            <lucide_react_1.Trophy className="h-4 w-4 mr-2" />
                            Declarar Vencedor
                          </button_1.Button>
                        )}
                      </>
                    )}

                    {test.status === "draft" && (
                      <button_1.Button size="sm">
                        <lucide_react_1.Play className="h-4 w-4 mr-2" />
                        Iniciar Teste
                      </button_1.Button>
                    )}
                  </div>
                </div>
              </card_1.CardContent>
            </card_1.Card>
          );
        })}

        {tests.length === 0 && (
          <card_1.Card>
            <card_1.CardContent className="text-center py-8">
              <lucide_react_1.TestTube className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhum teste A/B configurado</h3>
              <p className="text-muted-foreground">
                Crie seu primeiro teste para otimizar sua campanha
              </p>
            </card_1.CardContent>
          </card_1.Card>
        )}
      </div>
    </div>
  );
}
