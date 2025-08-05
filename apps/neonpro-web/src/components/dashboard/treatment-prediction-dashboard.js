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
exports.default = TreatmentPredictionDashboard;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var select_1 = require("@/components/ui/select");
var tabs_1 = require("@/components/ui/tabs");
var progress_1 = require("@/components/ui/progress");
var lucide_react_1 = require("lucide-react");
var mockPredictions = [
  {
    treatment: "Harmonização Facial com Ácido Hialurônico",
    confidence: 94,
    reasoning:
      "Baseado na idade da paciente (32 anos) e preocupações com volume facial, este tratamento é altamente recomendado.",
    expectedResults: "Rejuvenescimento facial, melhora do contorno e hidratação profunda",
    duration: "45-60 minutos",
    cost: "R$ 1.200 - R$ 2.000",
    riskLevel: "low",
  },
  {
    treatment: "Botox para Rugas de Expressão",
    confidence: 87,
    reasoning: "Paciente apresenta linhas de expressão moderadas na testa e região dos olhos.",
    expectedResults: "Redução significativa de rugas dinâmicas e prevenção de novas linhas",
    duration: "20-30 minutos",
    cost: "R$ 800 - R$ 1.500",
    riskLevel: "low",
  },
  {
    treatment: "Peeling Químico Médio",
    confidence: 76,
    reasoning: "Indicado para melhora da textura da pele e manchas solares identificadas.",
    expectedResults: "Pele mais uniforme, redução de manchas e melhora da textura",
    duration: "30-45 minutos",
    cost: "R$ 600 - R$ 1.200",
    riskLevel: "medium",
  },
];
function TreatmentPredictionDashboard() {
  var _this = this;
  var _a = (0, react_1.useState)({}),
    patientData = _a[0],
    setPatientData = _a[1];
  var _b = (0, react_1.useState)([]),
    predictions = _b[0],
    setPredictions = _b[1];
  var _c = (0, react_1.useState)(false),
    isAnalyzing = _c[0],
    setIsAnalyzing = _c[1];
  var handleAnalyze = function () {
    return __awaiter(_this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            setIsAnalyzing(true);
            // Simular análise de IA
            return [
              4 /*yield*/,
              new Promise(function (resolve) {
                return setTimeout(resolve, 3000);
              }),
            ];
          case 1:
            // Simular análise de IA
            _a.sent();
            setPredictions(mockPredictions);
            setIsAnalyzing(false);
            return [2 /*return*/];
        }
      });
    });
  };
  var getRiskColor = function (risk) {
    switch (risk) {
      case "low":
        return "text-green-600 bg-green-100";
      case "medium":
        return "text-yellow-600 bg-yellow-100";
      case "high":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };
  var getRiskIcon = function (risk) {
    switch (risk) {
      case "low":
        return <lucide_react_1.Heart className="h-4 w-4" />;
      case "medium":
        return <lucide_react_1.AlertTriangle className="h-4 w-4" />;
      case "high":
        return <lucide_react_1.AlertTriangle className="h-4 w-4" />;
      default:
        return <lucide_react_1.AlertTriangle className="h-4 w-4" />;
    }
  };
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Predição de Tratamentos</h2>
          <p className="text-muted-foreground">
            Sistema de IA para recomendação personalizada de tratamentos estéticos
          </p>
        </div>
        <div className="flex items-center gap-2">
          <badge_1.Badge variant="secondary" className="flex items-center gap-1">
            <lucide_react_1.Brain className="h-3 w-3" />
            IA Avançada
          </badge_1.Badge>
          <badge_1.Badge variant="outline" className="flex items-center gap-1">
            <lucide_react_1.Zap className="h-3 w-3" />
            Tempo Real
          </badge_1.Badge>
        </div>
      </div>

      <tabs_1.Tabs defaultValue="analysis" className="w-full">
        <tabs_1.TabsList className="grid w-full grid-cols-3">
          <tabs_1.TabsTrigger value="analysis">Análise do Paciente</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="predictions">Predições</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="insights">Insights</tabs_1.TabsTrigger>
        </tabs_1.TabsList>

        <tabs_1.TabsContent value="analysis" className="space-y-4">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle className="flex items-center gap-2">
                <lucide_react_1.User className="h-5 w-5" />
                Perfil do Paciente
              </card_1.CardTitle>
              <card_1.CardDescription>
                Insira os dados do paciente para análise e predição de tratamentos
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label_1.Label htmlFor="age">Idade</label_1.Label>
                  <input_1.Input
                    id="age"
                    type="number"
                    placeholder="Ex: 32"
                    value={patientData.age || ""}
                    onChange={function (e) {
                      return setPatientData(function (prev) {
                        return __assign(__assign({}, prev), { age: parseInt(e.target.value) });
                      });
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <label_1.Label htmlFor="skinType">Tipo de Pele</label_1.Label>
                  <select_1.Select
                    onValueChange={function (value) {
                      return setPatientData(function (prev) {
                        return __assign(__assign({}, prev), { skinType: value });
                      });
                    }}
                  >
                    <select_1.SelectTrigger>
                      <select_1.SelectValue placeholder="Selecione" />
                    </select_1.SelectTrigger>
                    <select_1.SelectContent>
                      <select_1.SelectItem value="oily">Oleosa</select_1.SelectItem>
                      <select_1.SelectItem value="dry">Seca</select_1.SelectItem>
                      <select_1.SelectItem value="mixed">Mista</select_1.SelectItem>
                      <select_1.SelectItem value="sensitive">Sensível</select_1.SelectItem>
                      <select_1.SelectItem value="normal">Normal</select_1.SelectItem>
                    </select_1.SelectContent>
                  </select_1.Select>
                </div>

                <div className="space-y-2">
                  <label_1.Label htmlFor="budget">Orçamento</label_1.Label>
                  <select_1.Select
                    onValueChange={function (value) {
                      return setPatientData(function (prev) {
                        return __assign(__assign({}, prev), { budget: value });
                      });
                    }}
                  >
                    <select_1.SelectTrigger>
                      <select_1.SelectValue placeholder="Faixa de investimento" />
                    </select_1.SelectTrigger>
                    <select_1.SelectContent>
                      <select_1.SelectItem value="low">R$ 500 - R$ 1.000</select_1.SelectItem>
                      <select_1.SelectItem value="medium">R$ 1.000 - R$ 3.000</select_1.SelectItem>
                      <select_1.SelectItem value="high">R$ 3.000 - R$ 8.000</select_1.SelectItem>
                      <select_1.SelectItem value="premium">Acima de R$ 8.000</select_1.SelectItem>
                    </select_1.SelectContent>
                  </select_1.Select>
                </div>
              </div>

              <div className="space-y-2">
                <label_1.Label htmlFor="concerns">Principais Preocupações</label_1.Label>
                <input_1.Input
                  id="concerns"
                  placeholder="Ex: rugas, flacidez, manchas, volume facial..."
                  onChange={function (e) {
                    return setPatientData(function (prev) {
                      return __assign(__assign({}, prev), {
                        concerns: e.target.value.split(",").map(function (c) {
                          return c.trim();
                        }),
                      });
                    });
                  }}
                />
              </div>

              <div className="space-y-2">
                <label_1.Label htmlFor="previous">Tratamentos Anteriores</label_1.Label>
                <input_1.Input
                  id="previous"
                  placeholder="Ex: botox, preenchimento, peeling..."
                  onChange={function (e) {
                    return setPatientData(function (prev) {
                      return __assign(__assign({}, prev), {
                        previousTreatments: e.target.value.split(",").map(function (t) {
                          return t.trim();
                        }),
                      });
                    });
                  }}
                />
              </div>

              <button_1.Button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="w-full"
                size="lg"
              >
                {isAnalyzing
                  ? <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Analisando com IA...
                    </>
                  : <>
                      <lucide_react_1.Brain className="h-4 w-4 mr-2" />
                      Analisar e Predizer Tratamentos
                    </>}
              </button_1.Button>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="predictions" className="space-y-4">
          {predictions.length === 0
            ? <card_1.Card>
                <card_1.CardContent className="flex flex-col items-center justify-center py-12">
                  <lucide_react_1.Brain className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhuma Predição Disponível</h3>
                  <p className="text-muted-foreground text-center">
                    Preencha os dados do paciente na aba "Análise do Paciente" para gerar predições.
                  </p>
                </card_1.CardContent>
              </card_1.Card>
            : <div className="space-y-4">
                {predictions.map(function (prediction, index) {
                  return (
                    <card_1.Card key={index} className="relative">
                      <card_1.CardHeader>
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <card_1.CardTitle className="text-lg">
                              {prediction.treatment}
                            </card_1.CardTitle>
                            <div className="flex items-center gap-2">
                              <badge_1.Badge
                                variant="secondary"
                                className="flex items-center gap-1"
                              >
                                <lucide_react_1.Target className="h-3 w-3" />
                                {prediction.confidence}% Confiança
                              </badge_1.Badge>
                              <badge_1.Badge
                                variant="outline"
                                className={"flex items-center gap-1 ".concat(
                                  getRiskColor(prediction.riskLevel),
                                )}
                              >
                                {getRiskIcon(prediction.riskLevel)}
                                Risco{" "}
                                {prediction.riskLevel === "low"
                                  ? "Baixo"
                                  : prediction.riskLevel === "medium"
                                    ? "Médio"
                                    : "Alto"}
                              </badge_1.Badge>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-primary">#{index + 1}</div>
                            <div className="text-xs text-muted-foreground">Recomendação</div>
                          </div>
                        </div>
                      </card_1.CardHeader>
                      <card_1.CardContent className="space-y-4">
                        <div>
                          <label_1.Label className="text-sm font-medium">
                            Justificativa da IA
                          </label_1.Label>
                          <p className="text-sm text-muted-foreground mt-1">
                            {prediction.reasoning}
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                          <div>
                            <label_1.Label className="font-medium flex items-center gap-1">
                              <lucide_react_1.TrendingUp className="h-4 w-4" />
                              Resultados Esperados
                            </label_1.Label>
                            <p className="text-muted-foreground mt-1">
                              {prediction.expectedResults}
                            </p>
                          </div>
                          <div>
                            <label_1.Label className="font-medium flex items-center gap-1">
                              <lucide_react_1.Clock className="h-4 w-4" />
                              Duração
                            </label_1.Label>
                            <p className="text-muted-foreground mt-1">{prediction.duration}</p>
                          </div>
                          <div>
                            <label_1.Label className="font-medium flex items-center gap-1">
                              <lucide_react_1.DollarSign className="h-4 w-4" />
                              Investimento
                            </label_1.Label>
                            <p className="text-muted-foreground mt-1">{prediction.cost}</p>
                          </div>
                          <div>
                            <label_1.Label className="font-medium">Confiança</label_1.Label>
                            <div className="mt-1">
                              <progress_1.Progress value={prediction.confidence} className="h-2" />
                              <p className="text-xs text-muted-foreground mt-1">
                                {prediction.confidence}%
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button_1.Button size="sm" variant="default">
                            Agendar Consulta
                          </button_1.Button>
                          <button_1.Button size="sm" variant="outline">
                            Mais Detalhes
                          </button_1.Button>
                          <button_1.Button size="sm" variant="outline">
                            Compartilhar
                          </button_1.Button>
                        </div>
                      </card_1.CardContent>
                    </card_1.Card>
                  );
                })}
              </div>}
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="insights" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle className="flex items-center gap-2">
                  <lucide_react_1.Brain className="h-5 w-5" />
                  Insights da IA
                </card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent className="space-y-4">
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="font-medium text-blue-800 mb-1">Padrão Identificado</div>
                  <p className="text-sm text-blue-700">
                    Pacientes com perfil similar têm 89% de satisfação com harmonização facial
                  </p>
                </div>

                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="font-medium text-green-800 mb-1">Timing Ideal</div>
                  <p className="text-sm text-green-700">
                    Melhor período para iniciar tratamentos: próximas 2-4 semanas
                  </p>
                </div>

                <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="font-medium text-orange-800 mb-1">Combinação Sugerida</div>
                  <p className="text-sm text-orange-700">
                    Botox + Harmonização pode oferecer resultados 34% superiores
                  </p>
                </div>
              </card_1.CardContent>
            </card_1.Card>

            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Estatísticas do Sistema</card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Precisão da IA</span>
                  <span className="font-bold">94.2%</span>
                </div>
                <progress_1.Progress value={94.2} className="h-2" />

                <div className="flex justify-between items-center">
                  <span className="text-sm">Satisfação dos Pacientes</span>
                  <span className="font-bold">96.8%</span>
                </div>
                <progress_1.Progress value={96.8} className="h-2" />

                <div className="flex justify-between items-center">
                  <span className="text-sm">Taxa de Conversão</span>
                  <span className="font-bold">87.3%</span>
                </div>
                <progress_1.Progress value={87.3} className="h-2" />

                <div className="pt-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    <strong>1,247</strong> predições realizadas este mês
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <strong>892</strong> tratamentos agendados
                  </div>
                </div>
              </card_1.CardContent>
            </card_1.Card>
          </div>
        </tabs_1.TabsContent>
      </tabs_1.Tabs>
    </div>
  );
}
