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
exports.CustomReportBuilder = CustomReportBuilder;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var checkbox_1 = require("@/components/ui/checkbox");
var select_1 = require("@/components/ui/select");
var textarea_1 = require("@/components/ui/textarea");
var badge_1 = require("@/components/ui/badge");
var separator_1 = require("@/components/ui/separator");
var date_range_picker_1 = require("@/components/ui/date-range-picker");
var lucide_react_1 = require("lucide-react");
var use_reports_1 = require("@/hooks/inventory/use-reports");
var react_hot_toast_1 = require("react-hot-toast");
var AVAILABLE_SECTIONS = [
  {
    id: "overview",
    title: "Visão Geral",
    description: "KPIs principais e resumo executivo",
    icon: lucide_react_1.BarChart3,
    category: "analytics",
    enabled: true,
  },
  {
    id: "turnover",
    title: "Análise de Giro",
    description: "Taxa de rotação e tempo em estoque",
    icon: lucide_react_1.TrendingUp,
    category: "performance",
    enabled: false,
  },
  {
    id: "categories",
    title: "Performance por Categoria",
    description: "Análise detalhada por categoria de produtos",
    icon: lucide_react_1.PieChart,
    category: "analytics",
    enabled: false,
  },
  {
    id: "financial",
    title: "Análise Financeira",
    description: "Custos, margens e investimento em estoque",
    icon: lucide_react_1.DollarSign,
    category: "financial",
    enabled: false,
  },
  {
    id: "suppliers",
    title: "Performance de Fornecedores",
    description: "Avaliação de pontualidade e qualidade",
    icon: lucide_react_1.Package,
    category: "operational",
    enabled: false,
  },
  {
    id: "alerts",
    title: "Alertas e Recomendações",
    description: "Produtos críticos e ações sugeridas",
    icon: lucide_react_1.AlertTriangle,
    category: "operational",
    enabled: false,
  },
  {
    id: "movements",
    title: "Movimentação de Estoque",
    description: "Histórico de entradas e saídas",
    icon: Activity,
    category: "operational",
    enabled: false,
  },
  {
    id: "predictive",
    title: "Análise Preditiva",
    description: "Previsão de demanda e recomendações",
    icon: lucide_react_1.Clock,
    category: "analytics",
    enabled: false,
  },
];
var AVAILABLE_METRICS = [
  {
    id: "turnover-rate",
    name: "Taxa de Giro",
    description: "Velocidade de rotação do estoque",
    category: "kpi",
    enabled: true,
  },
  {
    id: "stock-accuracy",
    name: "Acurácia do Estoque",
    description: "Precisão entre físico e sistema",
    category: "kpi",
    enabled: true,
  },
  {
    id: "carrying-cost",
    name: "Custo de Carregamento",
    description: "Custo total de manutenção",
    category: "kpi",
    enabled: false,
  },
  {
    id: "stockout-rate",
    name: "Taxa de Ruptura",
    description: "Percentual de produtos em falta",
    category: "kpi",
    enabled: false,
  },
  {
    id: "fill-rate",
    name: "Taxa de Atendimento",
    description: "Percentual de pedidos completos",
    category: "kpi",
    enabled: false,
  },
  {
    id: "lead-time",
    name: "Lead Time Médio",
    description: "Tempo médio de reposição",
    category: "kpi",
    enabled: false,
  },
  {
    id: "demand-trend",
    name: "Tendência de Demanda",
    description: "Variação da demanda ao longo do tempo",
    category: "trend",
    enabled: false,
  },
  {
    id: "abc-distribution",
    name: "Distribuição ABC",
    description: "Classificação por importância",
    category: "comparison",
    enabled: false,
  },
];
var REPORT_TEMPLATES = [
  {
    id: "executive",
    name: "Relatório Executivo",
    description: "Resumo gerencial com KPIs principais",
    sections: ["overview", "financial", "alerts"],
    metrics: ["turnover-rate", "stock-accuracy", "carrying-cost"],
    groupBy: "category",
    format: "pdf",
  },
  {
    id: "operational",
    name: "Relatório Operacional",
    description: "Análise detalhada para equipe operacional",
    sections: ["turnover", "movements", "suppliers", "alerts"],
    metrics: ["turnover-rate", "stockout-rate", "fill-rate", "lead-time"],
    groupBy: "product",
    format: "excel",
  },
  {
    id: "analytical",
    name: "Relatório Analítico",
    description: "Análise completa com insights preditivos",
    sections: ["overview", "categories", "turnover", "predictive"],
    metrics: ["turnover-rate", "stock-accuracy", "demand-trend", "abc-distribution"],
    groupBy: "category",
    format: "pdf",
  },
];
function CustomReportBuilder() {
  var _this = this;
  var _a = (0, react_1.useState)(AVAILABLE_SECTIONS),
    sections = _a[0],
    setSections = _a[1];
  var _b = (0, react_1.useState)(AVAILABLE_METRICS),
    metrics = _b[0],
    setMetrics = _b[1];
  var _c = (0, react_1.useState)(),
    dateRange = _c[0],
    setDateRange = _c[1];
  var _d = (0, react_1.useState)("category"),
    groupBy = _d[0],
    setGroupBy = _d[1];
  var _e = (0, react_1.useState)("pdf"),
    format = _e[0],
    setFormat = _e[1];
  var _f = (0, react_1.useState)(""),
    reportTitle = _f[0],
    setReportTitle = _f[1];
  var _g = (0, react_1.useState)(""),
    reportDescription = _g[0],
    setReportDescription = _g[1];
  var _h = (0, react_1.useState)(""),
    selectedTemplate = _h[0],
    setSelectedTemplate = _h[1];
  var _j = (0, use_reports_1.useReports)(),
    generateCustomReport = _j.generateCustomReport,
    exportReport = _j.exportReport,
    isGenerating = _j.isGenerating;
  var handleSectionToggle = (0, react_1.useCallback)(function (sectionId) {
    setSections(function (prev) {
      return prev.map(function (section) {
        return section.id === sectionId
          ? __assign(__assign({}, section), { enabled: !section.enabled })
          : section;
      });
    });
  }, []);
  var handleMetricToggle = (0, react_1.useCallback)(function (metricId) {
    setMetrics(function (prev) {
      return prev.map(function (metric) {
        return metric.id === metricId
          ? __assign(__assign({}, metric), { enabled: !metric.enabled })
          : metric;
      });
    });
  }, []);
  var handleTemplateSelect = (0, react_1.useCallback)(function (templateId) {
    var template = REPORT_TEMPLATES.find(function (t) {
      return t.id === templateId;
    });
    if (!template) return;
    setSelectedTemplate(templateId);
    setGroupBy(template.groupBy);
    setFormat(template.format);
    // Update sections
    setSections(function (prev) {
      return prev.map(function (section) {
        return __assign(__assign({}, section), { enabled: template.sections.includes(section.id) });
      });
    });
    // Update metrics
    setMetrics(function (prev) {
      return prev.map(function (metric) {
        return __assign(__assign({}, metric), { enabled: template.metrics.includes(metric.id) });
      });
    });
    setReportTitle(template.name);
    setReportDescription(template.description);
    react_hot_toast_1.toast.success('Template "'.concat(template.name, '" aplicado!'));
  }, []);
  var handleGenerateReport = (0, react_1.useCallback)(
    function () {
      return __awaiter(_this, void 0, void 0, function () {
        var enabledSections, enabledMetrics, reportData, error_1;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              enabledSections = sections
                .filter(function (s) {
                  return s.enabled;
                })
                .map(function (s) {
                  return s.id;
                });
              enabledMetrics = metrics
                .filter(function (m) {
                  return m.enabled;
                })
                .map(function (m) {
                  return m.id;
                });
              if (enabledSections.length === 0) {
                react_hot_toast_1.toast.error("Selecione pelo menos uma seção para o relatório");
                return [2 /*return*/];
              }
              _a.label = 1;
            case 1:
              _a.trys.push([1, 5, , 6]);
              return [
                4 /*yield*/,
                generateCustomReport({
                  sections: enabledSections,
                  dateRange: dateRange,
                  groupBy: groupBy,
                  metrics: enabledMetrics,
                }),
              ];
            case 2:
              reportData = _a.sent();
              if (!reportData) return [3 /*break*/, 4];
              // Proceed to export
              return [
                4 /*yield*/,
                exportReport({
                  type: format,
                  filters: { dateRange: dateRange },
                  templateType: "detailed",
                }),
              ];
            case 3:
              // Proceed to export
              _a.sent();
              _a.label = 4;
            case 4:
              return [3 /*break*/, 6];
            case 5:
              error_1 = _a.sent();
              console.error("Erro ao gerar relatório:", error_1);
              react_hot_toast_1.toast.error("Erro ao gerar relatório personalizado");
              return [3 /*break*/, 6];
            case 6:
              return [2 /*return*/];
          }
        });
      });
    },
    [sections, metrics, dateRange, groupBy, format, generateCustomReport, exportReport],
  );
  var enabledSectionsCount = sections.filter(function (s) {
    return s.enabled;
  }).length;
  var enabledMetricsCount = metrics.filter(function (m) {
    return m.enabled;
  }).length;
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Constructor de Relatórios</h1>
          <p className="text-muted-foreground mt-1">
            Crie relatórios personalizados de análise de estoque
          </p>
        </div>

        <div className="flex gap-3">
          <button_1.Button variant="outline" size="sm">
            <lucide_react_1.Save className="h-4 w-4 mr-2" />
            Salvar Template
          </button_1.Button>
          <button_1.Button variant="outline" size="sm">
            <lucide_react_1.Share className="h-4 w-4 mr-2" />
            Compartilhar
          </button_1.Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Templates */}
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle className="flex items-center space-x-2">
                <lucide_react_1.Settings className="h-5 w-5" />
                <span>Templates Pré-definidos</span>
              </card_1.CardTitle>
              <card_1.CardDescription>
                Selecione um template como ponto de partida
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {REPORT_TEMPLATES.map(function (template) {
                  return (
                    <card_1.Card
                      key={template.id}
                      className={"cursor-pointer transition-colors hover:bg-accent ".concat(
                        selectedTemplate === template.id ? "ring-2 ring-primary" : "",
                      )}
                      onClick={function () {
                        return handleTemplateSelect(template.id);
                      }}
                    >
                      <card_1.CardHeader className="pb-3">
                        <card_1.CardTitle className="text-base">{template.name}</card_1.CardTitle>
                        <card_1.CardDescription className="text-sm">
                          {template.description}
                        </card_1.CardDescription>
                      </card_1.CardHeader>
                      <card_1.CardContent className="pt-0">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{template.sections.length} seções</span>
                          <badge_1.Badge variant="outline">
                            {template.format.toUpperCase()}
                          </badge_1.Badge>
                        </div>
                      </card_1.CardContent>
                    </card_1.Card>
                  );
                })}
              </div>
            </card_1.CardContent>
          </card_1.Card>
          {/* Report Configuration */}
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Configuração do Relatório</card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label_1.Label htmlFor="report-title">Título do Relatório</label_1.Label>
                  <input_1.Input
                    id="report-title"
                    value={reportTitle}
                    onChange={function (e) {
                      return setReportTitle(e.target.value);
                    }}
                    placeholder="Digite o título do relatório"
                  />
                </div>

                <div>
                  <label_1.Label htmlFor="format">Formato de Exportação</label_1.Label>
                  <select_1.Select
                    value={format}
                    onValueChange={function (value) {
                      return setFormat(value);
                    }}
                  >
                    <select_1.SelectTrigger>
                      <select_1.SelectValue />
                    </select_1.SelectTrigger>
                    <select_1.SelectContent>
                      <select_1.SelectItem value="pdf">PDF</select_1.SelectItem>
                      <select_1.SelectItem value="excel">Excel</select_1.SelectItem>
                      <select_1.SelectItem value="csv">CSV</select_1.SelectItem>
                    </select_1.SelectContent>
                  </select_1.Select>
                </div>
              </div>

              <div>
                <label_1.Label htmlFor="report-description">Descrição</label_1.Label>
                <textarea_1.Textarea
                  id="report-description"
                  value={reportDescription}
                  onChange={function (e) {
                    return setReportDescription(e.target.value);
                  }}
                  placeholder="Descrição opcional do relatório"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label_1.Label>Período de Análise</label_1.Label>
                  <date_range_picker_1.DatePickerWithRange
                    value={dateRange}
                    onChange={setDateRange}
                    placeholder="Selecionar período"
                  />
                </div>

                <div>
                  <label_1.Label htmlFor="group-by">Agrupar Por</label_1.Label>
                  <select_1.Select
                    value={groupBy}
                    onValueChange={function (value) {
                      return setGroupBy(value);
                    }}
                  >
                    <select_1.SelectTrigger>
                      <select_1.SelectValue />
                    </select_1.SelectTrigger>
                    <select_1.SelectContent>
                      <select_1.SelectItem value="category">Categoria</select_1.SelectItem>
                      <select_1.SelectItem value="supplier">Fornecedor</select_1.SelectItem>
                      <select_1.SelectItem value="product">Produto</select_1.SelectItem>
                    </select_1.SelectContent>
                  </select_1.Select>
                </div>
              </div>
            </card_1.CardContent>
          </card_1.Card>{" "}
          {/* Sections Selection */}
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle className="flex items-center justify-between">
                <span>Seções do Relatório</span>
                <badge_1.Badge variant="secondary">
                  {enabledSectionsCount} selecionadas
                </badge_1.Badge>
              </card_1.CardTitle>
              <card_1.CardDescription>
                Escolha as seções que serão incluídas no relatório
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sections.map(function (section) {
                  var Icon = section.icon;
                  return (
                    <div key={section.id} className="flex items-center space-x-3">
                      <checkbox_1.Checkbox
                        id={section.id}
                        checked={section.enabled}
                        onCheckedChange={function () {
                          return handleSectionToggle(section.id);
                        }}
                      />
                      <div className="flex items-center space-x-2 flex-1">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <label_1.Label
                            htmlFor={section.id}
                            className="text-sm font-medium cursor-pointer"
                          >
                            {section.title}
                          </label_1.Label>
                          <p className="text-xs text-muted-foreground">{section.description}</p>
                        </div>
                      </div>
                      <badge_1.Badge variant="outline" className="text-xs">
                        {section.category}
                      </badge_1.Badge>
                    </div>
                  );
                })}
              </div>
            </card_1.CardContent>
          </card_1.Card>
          {/* Metrics Selection */}
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle className="flex items-center justify-between">
                <span>Métricas e KPIs</span>
                <badge_1.Badge variant="secondary">
                  {enabledMetricsCount} selecionadas
                </badge_1.Badge>
              </card_1.CardTitle>
              <card_1.CardDescription>
                Selecione as métricas que serão calculadas e exibidas
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="space-y-3">
                {metrics.map(function (metric) {
                  return (
                    <div key={metric.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <checkbox_1.Checkbox
                          id={metric.id}
                          checked={metric.enabled}
                          onCheckedChange={function () {
                            return handleMetricToggle(metric.id);
                          }}
                        />
                        <div>
                          <label_1.Label
                            htmlFor={metric.id}
                            className="text-sm font-medium cursor-pointer"
                          >
                            {metric.name}
                          </label_1.Label>
                          <p className="text-xs text-muted-foreground">{metric.description}</p>
                        </div>
                      </div>
                      <badge_1.Badge variant="outline" className="text-xs">
                        {metric.category}
                      </badge_1.Badge>
                    </div>
                  );
                })}
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </div>

        {/* Preview Panel */}
        <div className="space-y-6">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle className="flex items-center space-x-2">
                <lucide_react_1.Eye className="h-5 w-5" />
                <span>Prévia do Relatório</span>
              </card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-sm mb-2">Título</h4>
                <p className="text-sm text-muted-foreground">
                  {reportTitle || "Relatório de Estoque Personalizado"}
                </p>
              </div>

              <separator_1.Separator />

              <div>
                <h4 className="font-medium text-sm mb-2">Configuração</h4>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <p>Formato: {format.toUpperCase()}</p>
                  <p>
                    Agrupamento:{" "}
                    {groupBy === "category"
                      ? "Categoria"
                      : groupBy === "supplier"
                        ? "Fornecedor"
                        : "Produto"}
                  </p>
                  <p>Período: {dateRange ? "Personalizado" : "Último mês"}</p>
                </div>
              </div>

              <separator_1.Separator />

              <div>
                <h4 className="font-medium text-sm mb-2">Seções Incluídas</h4>
                <div className="space-y-1">
                  {sections
                    .filter(function (s) {
                      return s.enabled;
                    })
                    .map(function (section) {
                      return (
                        <div key={section.id} className="flex items-center space-x-2">
                          <lucide_react_1.CheckCircle className="h-3 w-3 text-green-500" />
                          <span className="text-xs">{section.title}</span>
                        </div>
                      );
                    })}
                  {enabledSectionsCount === 0 && (
                    <p className="text-xs text-muted-foreground">Nenhuma seção selecionada</p>
                  )}
                </div>
              </div>

              <separator_1.Separator />

              <div>
                <h4 className="font-medium text-sm mb-2">Métricas Incluídas</h4>
                <div className="space-y-1">
                  {metrics
                    .filter(function (m) {
                      return m.enabled;
                    })
                    .map(function (metric) {
                      return (
                        <div key={metric.id} className="flex items-center space-x-2">
                          <lucide_react_1.CheckCircle className="h-3 w-3 text-blue-500" />
                          <span className="text-xs">{metric.name}</span>
                        </div>
                      );
                    })}
                  {enabledMetricsCount === 0 && (
                    <p className="text-xs text-muted-foreground">Nenhuma métrica selecionada</p>
                  )}
                </div>
              </div>
            </card_1.CardContent>
          </card_1.Card>

          {/* Generation Actions */}
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Gerar Relatório</card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent className="space-y-4">
              <button_1.Button
                onClick={handleGenerateReport}
                disabled={isGenerating || enabledSectionsCount === 0}
                className="w-full"
              >
                {isGenerating
                  ? <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Gerando...
                    </>
                  : <>
                      <lucide_react_1.FileText className="h-4 w-4 mr-2" />
                      Gerar e Baixar
                    </>}
              </button_1.Button>

              <div className="text-xs text-muted-foreground space-y-1">
                <p>• O relatório será gerado com base nas configurações selecionadas</p>
                <p>• Tempo estimado: 30-60 segundos</p>
                <p>• O arquivo será baixado automaticamente quando pronto</p>
              </div>
            </card_1.CardContent>
          </card_1.Card>

          {/* Quick Stats */}
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle className="text-base">Estatísticas do Relatório</card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Seções</span>
                <badge_1.Badge variant={enabledSectionsCount > 0 ? "default" : "secondary"}>
                  {enabledSectionsCount}/{sections.length}
                </badge_1.Badge>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Métricas</span>
                <badge_1.Badge variant={enabledMetricsCount > 0 ? "default" : "secondary"}>
                  {enabledMetricsCount}/{metrics.length}
                </badge_1.Badge>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Formato</span>
                <badge_1.Badge variant="outline">{format.toUpperCase()}</badge_1.Badge>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Complexidade</span>
                <badge_1.Badge
                  variant={
                    enabledSectionsCount + enabledMetricsCount > 8
                      ? "destructive"
                      : enabledSectionsCount + enabledMetricsCount > 4
                        ? "default"
                        : "secondary"
                  }
                >
                  {enabledSectionsCount + enabledMetricsCount > 8
                    ? "Alta"
                    : enabledSectionsCount + enabledMetricsCount > 4
                      ? "Média"
                      : "Baixa"}
                </badge_1.Badge>
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </div>
      </div>
    </div>
  );
}
